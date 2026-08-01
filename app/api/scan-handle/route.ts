import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { uploadVideoToBlob } from "@/lib/video-storage";
import { transcribePost } from "@/lib/transcribe";
import { scrapeInstagramProfile } from "@/lib/instagram-scraper";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();
    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Valid username is required" },
        { status: 400 }
      );
    }

    console.log(`[scan-handle] Scraping @${cleanUsername}...`);
    const scraped = await scrapeInstagramProfile(cleanUsername);

    if (!scraped) {
      return NextResponse.json(
        {
          error:
            "Could not fetch this profile. The account may be private, or Instagram is blocking requests. Try again later.",
        },
        { status: 404 }
      );
    }

    if (scraped.posts.length === 0) {
      return NextResponse.json(
        {
          error: `No public posts found for @${cleanUsername}. The account may be private or have no posts.`,
        },
        { status: 404 }
      );
    }

    console.log(
      `[scan-handle] Found ${scraped.posts.length} posts for @${cleanUsername}`
    );

    // Generate a pseudo IG user ID for scanned profiles
    // Use a deterministic ID based on username to avoid duplicates
    const igUserId = `scanned_${cleanUsername}`;

    // Upsert creator with scanned source
    const creator = await prisma.creator.upsert({
      where: { igUserId },
      update: {
        igUsername: cleanUsername,
        igProfilePic: scraped.profilePicUrl,
        scannedFrom: "scan",
      },
      create: {
        igUserId,
        igUsername: cleanUsername,
        igProfilePic: scraped.profilePicUrl,
        accessToken: "scanned_no_token",
        scannedFrom: "scan",
      },
    });

    // Create blog page if it doesn't exist
    const blogPage = await prisma.blogPage.upsert({
      where: { creatorId: creator.id },
      update: {},
      create: {
        creatorId: creator.id,
        slug: slugify(cleanUsername),
      },
    });

    console.log(`[scan-handle] Creator: ${creator.id}, Blog: ${blogPage.slug}`);

    // Process posts — download videos, upload to Blob, transcribe
    let savedCount = 0;
    let videoCount = 0;
    const totalPosts = scraped.posts.length;

    for (const post of scraped.posts) {
      try {
        // Skip if already exists
        const existing = await prisma.post.findUnique({
          where: { igPostId: post.igPostId },
        });

        let videoFilePath: string | null = existing?.videoFilePath ?? null;
        let articleBody: string | null = existing?.articleBody ?? null;
        let tags: string[] = existing?.tags ?? [];

        // Download and host video
        if (post.mediaType === "VIDEO" && post.videoUrl) {
          if (!videoFilePath) {
            try {
              console.log(`[scan-handle] Uploading video for post ${post.shortcode}...`);
              const blobUrl = await uploadVideoToBlob(
                post.videoUrl,
                post.igPostId
              );
              if (blobUrl) {
                videoFilePath = blobUrl;
                videoCount++;
              }
            } catch (e) {
              console.error(
                `[scan-handle] Video upload failed for ${post.shortcode}:`,
                e
              );
            }
          }

          // Transcribe video → generate blog article
          if (!articleBody && videoFilePath) {
            try {
              console.log(`[scan-handle] Transcribing post ${post.shortcode}...`);
              const transcription = await transcribePost(
                videoFilePath,
                post.igPostId,
                post.caption
              );
              if (transcription) {
                articleBody = transcription.articleBody;
                tags = transcription.tags;
              }
            } catch (e) {
              console.error(
                `[scan-handle] Transcription failed for ${post.shortcode}:`,
                e
              );
            }
          }
        }

        if (existing) {
          await prisma.post.update({
            where: { igPostId: post.igPostId },
            data: {
              permalink: post.permalink,
              caption: post.caption,
              thumbnailUrl: post.thumbnailUrl,
              videoUrl: post.videoUrl,
              videoFilePath,
              mediaType: post.mediaType,
              articleBody,
              tags,
              publishedAt: new Date(post.timestamp),
            },
          });
        } else {
          await prisma.post.create({
            data: {
              creatorId: creator.id,
              igPostId: post.igPostId,
              permalink: post.permalink,
              caption: post.caption,
              thumbnailUrl: post.thumbnailUrl,
              videoUrl: post.videoUrl,
              videoFilePath,
              mediaType: post.mediaType,
              source: "scan",
              articleBody,
              tags,
              publishedAt: new Date(post.timestamp),
            },
          });
        }
        savedCount++;
      } catch (postErr) {
        console.error(
          `[scan-handle] Failed to save post ${post.shortcode}:`,
          postErr
        );
      }
    }

    console.log(
      `[scan-handle] Done: ${savedCount}/${totalPosts} posts saved, ${videoCount} videos hosted`
    );

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      profile: {
        fullName: scraped.fullName,
        bio: scraped.bio,
        profilePicUrl: scraped.profilePicUrl,
        followers: scraped.followers,
        postsCount: scraped.postsCount,
      },
      blogSlug: blogPage.slug,
      postsSaved: savedCount,
      videosHosted: videoCount,
      blogUrl: `/blog/${blogPage.slug}`,
    });
  } catch (err) {
    console.error("[scan-handle] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Scan failed: ${msg.slice(0, 200)}` },
      { status: 500 }
    );
  }
}
