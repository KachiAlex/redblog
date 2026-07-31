import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getLongLivedToken, getInstagramProfile, getMedia } from "@/lib/instagram";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = getUrlParts(req);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/?error=auth_failed", origin));
  }

  try {
    const shortTokenRes = await exchangeCodeForToken(code);
    const shortToken = shortTokenRes.access_token;

    const longTokenRes = await getLongLivedToken(shortToken);
    const longToken = longTokenRes.access_token;
    const expiresIn = longTokenRes.expires_in;

    const profile = await getInstagramProfile(longToken);
    const igUserId = profile.id;
    const igUsername = profile.username;

    const encryptedToken = encrypt(longToken);
    const tokenExpiry = new Date(Date.now() + (expiresIn || 5184000) * 1000);

    const creator = await prisma.creator.upsert({
      where: { igUserId },
      update: {
        igUsername,
        accessToken: encryptedToken,
        tokenExpiry,
      },
      create: {
        igUserId,
        igUsername,
        accessToken: encryptedToken,
        tokenExpiry,
      },
    });

    const blogPage = await prisma.blogPage.upsert({
      where: { creatorId: creator.id },
      update: {},
      create: {
        creatorId: creator.id,
        slug: slugify(igUsername),
      },
    });

    const mediaRes = await getMedia(longToken);
    const mediaItems = mediaRes.data || [];

    for (const item of mediaItems) {
      if (item.media_type === "VIDEO" || item.media_type === "CAROUSEL_ALBUM") {
        await prisma.post.upsert({
          where: { igPostId: item.id },
          update: {
            permalink: item.permalink,
            caption: item.caption || null,
            thumbnailUrl: item.thumbnail_url || null,
            publishedAt: new Date(item.timestamp),
          },
          create: {
            creatorId: creator.id,
            igPostId: item.id,
            permalink: item.permalink,
            caption: item.caption || null,
            thumbnailUrl: item.thumbnail_url || null,
            mediaType: item.media_type,
            publishedAt: new Date(item.timestamp),
          },
        });
      }
    }

    const res = NextResponse.redirect(new URL(`/dashboard?connected=1`, origin));
    res.cookies.delete("oauth_state");
    return res;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=callback_failed", origin));
  }
}

function getUrlParts(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  return { searchParams: url.searchParams, origin };
}
