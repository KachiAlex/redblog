import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getLongLivedToken, getInstagramProfile, getMedia } from "@/lib/instagram";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { uploadVideoToBlob } from "@/lib/video-storage";
import { transcribePost } from "@/lib/transcribe";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = getUrlParts(req);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    console.error("[oauth callback] Missing code/state or state mismatch");
    return NextResponse.redirect(new URL("/?error=auth_failed", origin));
  }

  let igUserId: string | undefined;
  let igUsername: string | undefined;

  try {
    console.log("[oauth callback] Exchanging code for token...");
    const shortTokenRes = await exchangeCodeForToken(code);
    const shortToken = shortTokenRes.access_token;
    console.log("[oauth callback] Got short-lived token");

    console.log("[oauth callback] Exchanging for long-lived token...");
    const longTokenRes = await getLongLivedToken(shortToken);
    const longToken = longTokenRes.access_token;
    const expiresIn = longTokenRes.expires_in;
    console.log("[oauth callback] Got long-lived token, expires_in:", expiresIn);

    console.log("[oauth callback] Fetching profile...");
    const profile = await getInstagramProfile(longToken);
    igUserId = profile.id;
    igUsername = profile.username;
    const igProfilePic = profile.profile_picture_url || null;
    console.log(`[oauth callback] Profile: @${igUsername} (ID: ${igUserId})`);

    const encryptedToken = encrypt(longToken);
    const tokenExpiry = new Date(Date.now() + (expiresIn || 5184000) * 1000);

    const creator = await prisma.creator.upsert({
      where: { igUserId },
      update: {
        igUsername,
        igProfilePic,
        accessToken: encryptedToken,
        tokenExpiry,
        scannedFrom: "oauth",
      },
      create: {
        igUserId: igUserId!,
        igUsername: igUsername!,
        igProfilePic,
        accessToken: encryptedToken,
        tokenExpiry,
        scannedFrom: "oauth",
      },
    });
    console.log(`[oauth callback] Creator upserted: ${creator.id}`);

    const blogPage = await prisma.blogPage.upsert({
      where: { creatorId: creator.id },
      update: {},
      create: {
        creatorId: creator.id,
        slug: slugify(igUsername!),
      },
    });
    console.log(`[oauth callback] BlogPage upserted: ${blogPage.slug}`);

    console.log("[oauth callback] Fetching media...");
    const mediaRes = await getMedia(longToken);
    const mediaItems = mediaRes.data || [];
    console.log(`[oauth callback] Got ${mediaItems.length} media items`);

    let savedCount = 0;
    for (const item of mediaItems) {
      try {
        let videoFilePath: string | null = null;

        if (item.media_type === "VIDEO" && item.media_url) {
          try {
            const blobUrl = await uploadVideoToBlob(item.media_url, item.id);
            if (blobUrl) {
              videoFilePath = blobUrl;
            }
          } catch (e) {
            console.error(`[oauth callback] Video upload failed for ${item.id}:`, e);
          }
        }

        let articleBody: string | null = null;
        let tags: string[] = [];

        if (item.media_type === "VIDEO") {
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
            console.error(`[oauth callback] Transcription failed for ${item.id}:`, e);
          }
        }

        await prisma.post.upsert({
          where: { igPostId: item.id },
          update: {
            permalink: item.permalink,
            caption: item.caption || null,
            thumbnailUrl: item.thumbnail_url || null,
            videoUrl: item.media_url || null,
            videoFilePath,
            mediaType: item.media_type,
            articleBody,
            tags,
            publishedAt: new Date(item.timestamp),
          },
          create: {
            creatorId: creator.id,
            igPostId: item.id,
            permalink: item.permalink,
            caption: item.caption || null,
            thumbnailUrl: item.thumbnail_url || null,
            videoUrl: item.media_url || null,
            videoFilePath,
            mediaType: item.media_type,
            source: "oauth",
            articleBody,
            tags,
            publishedAt: new Date(item.timestamp),
          },
        });
        savedCount++;
      } catch (postErr) {
        console.error(`[oauth callback] Failed to save post ${item.id}:`, postErr);
      }
    }
    console.log(`[oauth callback] Saved ${savedCount}/${mediaItems.length} posts`);

    const res = NextResponse.redirect(new URL(`/auth/close?success=1`, origin));
    res.cookies.delete("oauth_state");
    return res;
  } catch (err) {
    console.error("[oauth callback] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const redirectUrl = new URL("/auth/close?error=callback_failed", origin);
    redirectUrl.searchParams.set("detail", msg.slice(0, 200));
    return NextResponse.redirect(redirectUrl);
  }
}

function getUrlParts(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  return { searchParams: url.searchParams, origin };
}
