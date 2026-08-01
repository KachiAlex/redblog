import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getMedia, getOEmbed } from "@/lib/instagram";
import { uploadVideoToBlob } from "@/lib/video-storage";
import { transcribePost } from "@/lib/transcribe";

export async function POST(req: NextRequest) {
  try {
    const { creatorId } = await req.json();

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId required" }, { status: 400 });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (creator.scannedFrom === "scan" || creator.accessToken === "scanned_no_token") {
      return NextResponse.json(
        { error: "This creator was added via scan and has no OAuth token to sync." },
        { status: 400 }
      );
    }

    const token = decrypt(creator.accessToken);
    const mediaRes = await getMedia(token);
    const mediaItems = mediaRes.data || [];

    let newCount = 0;
    let updatedCount = 0;

    for (const item of mediaItems) {
      const existing = await prisma.post.findUnique({
        where: { igPostId: item.id },
      });

      let embedHtml: string | null = existing?.embedHtml ?? null;
      let embedTitle: string | null = existing?.embedTitle ?? null;

      if (!existing) {
        try {
          const oembed = await getOEmbed(item.permalink, token);
          embedHtml = oembed.html || null;
          embedTitle = oembed.title || null;
        } catch {
        }
      }

      let videoFilePath: string | null = existing?.videoFilePath ?? null;

      if (item.media_type === "VIDEO" && item.media_url) {
        try {
          const blobUrl = await uploadVideoToBlob(item.media_url, item.id);
          if (blobUrl) {
            videoFilePath = blobUrl;
          }
        } catch {
        }
      }

      let articleBody: string | null = existing?.articleBody ?? null;
      let tags: string[] = existing?.tags ?? [];

      if (item.media_type === "VIDEO" && !articleBody) {
        try {
          const transcription = await transcribePost(
            videoFilePath || item.media_url,
            item.id,
            item.caption
          );
          if (transcription) {
            articleBody = transcription.articleBody;
            tags = transcription.tags;
          }
        } catch {
        }
      }

      const postData = {
        permalink: item.permalink,
        embedHtml,
        embedTitle,
        caption: item.caption || null,
        thumbnailUrl: item.thumbnail_url || null,
        videoUrl: item.media_url || null,
        videoFilePath,
        mediaType: item.media_type,
        articleBody,
        tags,
        publishedAt: new Date(item.timestamp),
      };

      if (!existing) {
        await prisma.post.create({
          data: {
            creatorId: creator.id,
            igPostId: item.id,
            source: "oauth",
            ...postData,
          },
        });
        newCount++;
      } else {
        await prisma.post.update({
          where: { igPostId: item.id },
          data: postData,
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, newPosts: newCount, updatedPosts: updatedCount });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
