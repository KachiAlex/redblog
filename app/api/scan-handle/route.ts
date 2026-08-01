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

    // Find or create creator by username (not igUserId, to avoid unique constraint conflicts
    // when a creator was already connected via OAuth)
    const existingCreator = await prisma.creator.findUnique({
      where: { igUsername: cleanUsername },
    });

    let creator;
    if (existingCreator) {
      // Update profile info but preserve OAuth token if present
      creator = await prisma.creator.update({
        where: { id: existingCreator.id },
        data: {
          igProfilePic: scraped.profilePicUrl || existingCreator.igProfilePic,
          // Only set scannedFrom to "scan" if it wasn't connected via OAuth
          scannedFrom: existingCreator.scannedFrom === "oauth" ? "oauth" : "scan",
        },
      });
    } else {
      creator = await prisma.creator.create({
        data: {
          igUserId: `scanned_${cleanUsername}`,
          igUsername: cleanUsername,
          igProfilePic: scraped.profilePicUrl,
          accessToken: "scanned_no_token",
          scannedFrom: "scan",
        },
      });
    }

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

    // Phase 1: Save all posts to DB immediately (fast — no video processing)
    // This ensures posts are visible on the blog right away
    let savedCount = 0;
    const totalPosts = scraped.posts.length;

    for (const post of scraped.posts) {
      try {
        const existing = await prisma.post.findUnique({
          where: { igPostId: post.igPostId },
        });

        if (existing) {
          await prisma.post.update({
            where: { igPostId: post.igPostId },
            data: {
              permalink: post.permalink,
              caption: post.caption,
              thumbnailUrl: post.thumbnailUrl,
              videoUrl: post.videoUrl,
              mediaType: post.mediaType,
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
              mediaType: post.mediaType,
              source: "scan",
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
      `[scan-handle] Phase 1 complete: ${savedCount}/${totalPosts} posts saved to DB`
    );

    // Phase 2: Process videos — download, upload to Blob, transcribe
    // This is slow but posts are already visible from Phase 1
    let videoCount = 0;
    for (const post of scraped.posts) {
      if (post.mediaType !== "VIDEO" || !post.videoUrl) continue;

      try {
        const existing = await prisma.post.findUnique({
          where: { igPostId: post.igPostId },
        });

        // Skip if already processed
        if (existing?.videoFilePath && existing?.articleBody) continue;

        let videoFilePath: string | null = existing?.videoFilePath ?? null;
        let articleBody: string | null = existing?.articleBody ?? null;
        let tags: string[] = existing?.tags ?? [];

        // Download and host video
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

        // Update post with hosted video and article
        if (videoFilePath || articleBody) {
          await prisma.post.update({
            where: { igPostId: post.igPostId },
            data: {
              videoFilePath,
              articleBody,
              tags,
            },
          });
        }
      } catch (postErr) {
        console.error(
          `[scan-handle] Failed to process video for ${post.shortcode}:`,
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
