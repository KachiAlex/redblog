import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getMedia, getOEmbed } from "@/lib/instagram";

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
    for (const item of mediaItems) {
      if (item.media_type === "VIDEO" || item.media_type === "CAROUSEL_ALBUM") {
        const existing = await prisma.post.findUnique({
          where: { igPostId: item.id },
        });

        if (!existing) {
          let embedHtml = null;
          let embedTitle = null;
          try {
            const oembed = await getOEmbed(item.permalink, token);
            embedHtml = oembed.html || null;
            embedTitle = oembed.title || null;
          } catch {
          }

          await prisma.post.create({
            data: {
              creatorId: creator.id,
              igPostId: item.id,
              permalink: item.permalink,
              embedHtml,
              embedTitle,
              caption: item.caption || null,
              thumbnailUrl: item.thumbnail_url || null,
              videoUrl: item.media_url || null,
              mediaType: item.media_type,
              source: "oauth",
              publishedAt: new Date(item.timestamp),
            },
          });
          newCount++;
        }
      }
    }

    return NextResponse.json({ success: true, newPosts: newCount });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
