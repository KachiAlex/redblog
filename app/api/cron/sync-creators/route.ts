import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";
import { getMedia, getOEmbed, refreshLongLivedToken } from "@/lib/instagram";
import { uploadVideoToBlob } from "@/lib/video-storage";
import { transcribePost } from "@/lib/transcribe";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Verifies the request is from Vercel Cron by checking the
 * Authorization: Bearer <CRON_SECRET> header.
 */
function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

async function syncCreatorPosts(creator: any) {
  if (creator.scannedFrom === "scan" || creator.accessToken === "scanned_no_token") {
    console.log(`[cron:sync] Skipping scanned creator @${creator.igUsername} (no OAuth token)`);
    return;
  }

  try {
    let token = decrypt(creator.accessToken);

    if (creator.tokenExpiry) {
      const daysUntilExpiry =
        (creator.tokenExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < 7) {
        try {
          const refreshed = await refreshLongLivedToken(token);
          token = refreshed.access_token;
          const newExpiry = new Date(
            Date.now() + (refreshed.expires_in || 5184000) * 1000
          );
          await prisma.creator.update({
            where: { id: creator.id },
            data: { accessToken: encrypt(token), tokenExpiry: newExpiry },
          });
          console.log(`[cron:sync] Refreshed token for @${creator.igUsername}`);
        } catch (err: any) {
          console.error(`[cron:sync] Token refresh failed for @${creator.igUsername}:`, err.message);
        }
      }
    }

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
          // oEmbed may fail — continue
        }
      }

      let videoFilePath: string | null = existing?.videoFilePath ?? null;

      if (item.media_type === "VIDEO" && item.media_url) {
        try {
          const blobUrl = await uploadVideoToBlob(item.media_url, item.id);
          if (blobUrl) {
            videoFilePath = blobUrl;
          }
        } catch (e) {
          console.error(`[cron:sync] Video upload failed for ${item.id}:`, e);
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
        } catch (e) {
          console.error(`[cron:sync] Transcription failed for ${item.id}:`, e);
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
        console.log(`[cron:sync] New post synced for @${creator.igUsername}: ${item.id}`);
      } else {
        await prisma.post.update({
          where: { igPostId: item.id },
          data: postData,
        });
        updatedCount++;
      }
    }

    if (newCount > 0 || updatedCount > 0) {
      console.log(
        `[cron:sync] @${creator.igUsername}: ${newCount} new, ${updatedCount} updated`
      );
    }
  } catch (err: any) {
    console.error(`[cron:sync] Sync failed for @${creator.igUsername}:`, err.message);
  }
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`[cron:sync] Polling cycle started at ${new Date().toISOString()}`);
    const creators = await prisma.creator.findMany();
    console.log(`[cron:sync] Found ${creators.length} creator(s) to poll`);

    for (const creator of creators) {
      await syncCreatorPosts(creator);
    }

    console.log(`[cron:sync] Polling cycle complete`);
    return NextResponse.json({ success: true, creatorsPolled: creators.length });
  } catch (err: any) {
    console.error("[cron:sync] Fatal error:", err.message);
    return NextResponse.json({ error: "Sync failed", detail: err.message }, { status: 500 });
  }
}
