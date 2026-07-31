import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { scrapeProfile, downloadVideo } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace(/^@/, "").trim();

    if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Invalid Instagram username" },
        { status: 400 }
      );
    }

    const profile = await scrapeProfile(cleanUsername);

    if (profile.posts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Profile scanned but no video posts found",
          username: profile.igUsername,
          postsCreated: 0,
        },
        { status: 200 }
      );
    }

    const creator = await prisma.creator.upsert({
      where: { igUsername: profile.igUsername },
      update: {
        igProfilePic: profile.igProfilePic,
      },
      create: {
        igUserId: profile.igUserId,
        igUsername: profile.igUsername,
        igProfilePic: profile.igProfilePic,
        accessToken: "scanned_no_token",
        scannedFrom: "scan",
      },
    });

    const blogPage = await prisma.blogPage.upsert({
      where: { creatorId: creator.id },
      update: {
        title: profile.fullName || profile.igUsername,
        bio: profile.bio,
      },
      create: {
        creatorId: creator.id,
        slug: slugify(profile.igUsername),
        title: profile.fullName || profile.igUsername,
        bio: profile.bio,
      },
    });

    let postsCreated = 0;
    let videosDownloaded = 0;
    let videosFailed = 0;

    for (const post of profile.posts) {
      if (post.mediaType !== "VIDEO") continue;

      const existing = await prisma.post.findUnique({
        where: { igPostId: post.igPostId },
      });

      if (existing) continue;

      let videoFilePath: string | null = null;
      let videoUrl: string | null = post.videoUrl;

      if (post.videoUrl) {
        try {
          const downloaded = await downloadVideo(
            post.videoUrl,
            post.igPostId
          );
          if (downloaded) {
            videoFilePath = process.env.VERCEL
              ? `/api/videos/${post.igPostId}.mp4`
              : downloaded.filePath;
          }
          videosDownloaded++;
        } catch {
          videosFailed++;
        }
      }

      await prisma.post.create({
        data: {
          creatorId: creator.id,
          igPostId: post.igPostId,
          permalink: post.permalink,
          caption: post.caption,
          thumbnailUrl: post.thumbnailUrl,
          videoUrl,
          videoFilePath,
          mediaType: post.mediaType,
          source: "scan",
          publishedAt: new Date(post.publishedAt),
        },
      });

      postsCreated++;
    }

    return NextResponse.json({
      success: true,
      username: profile.igUsername,
      fullName: profile.fullName,
      profilePic: profile.igProfilePic,
      blogSlug: blogPage.slug,
      postsFound: profile.posts.length,
      postsCreated,
      videosDownloaded,
      videosFailed,
    });
  } catch (err) {
    console.error("Scan error:", err);
    const message = err instanceof Error ? err.message : "Scan failed";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Scan error stack:", stack);
    return NextResponse.json(
      { error: message, details: process.env.NODE_ENV === "development" ? stack : undefined },
      { status: 500 }
    );
  }
}
