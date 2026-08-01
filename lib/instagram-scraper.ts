/**
 * Instagram public profile scraper.
 *
 * Fetches a public Instagram profile page and extracts reel/video post data
 * from the embedded JSON (window._sharedData or __additionalDataLoaded).
 *
 * Falls back to Scrappa API if SCRAPPA_API_KEY is set and direct scraping fails.
 */

export interface ScrapedPost {
  igPostId: string;
  shortcode: string;
  caption: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  mediaType: "VIDEO" | "IMAGE" | "CAROUSEL";
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
  views: number | null;
}

export interface ScrapedProfile {
  username: string;
  fullName: string;
  bio: string | null;
  profilePicUrl: string | null;
  followers: number;
  following: number;
  postsCount: number;
  isVerified: boolean;
  posts: ScrapedPost[];
}

const IG_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/**
 * Attempt 1: Fetch Instagram profile page HTML and parse embedded JSON.
 * Instagram embeds post data in <script type="application/ld+json"> tags
 * and in window._sharedData / __additionalDataLoaded scripts.
 */
async function scrapeViaHTML(username: string): Promise<ScrapedProfile | null> {
  try {
    const res = await fetch(`https://www.instagram.com/${username}/`, {
      headers: IG_HEADERS,
      redirect: "follow",
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Extract profile data from JSON-LD
    const ldJsonMatch = html.match(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
    );

    let fullName = username;
    let bio: string | null = null;
    let profilePicUrl: string | null = null;
    let followers = 0;
    let following = 0;
    let postsCount = 0;
    let isVerified = false;

    if (ldJsonMatch) {
      try {
        const ld = JSON.parse(ldJsonMatch[1]);
        if (ld.name) fullName = ld.name;
        if (ld.description) bio = ld.description;
        if (ld.image) profilePicUrl = Array.isArray(ld.image) ? ld.image[0] : ld.image;
        if (ld.interactionStatistic) {
          for (const stat of ld.interactionStatistic) {
            if (stat.name === "Followers") followers = stat.userInteractionCount || 0;
            if (stat.name === "Following") following = stat.userInteractionCount || 0;
          }
        }
      } catch {}
    }

    // Extract posts from __additionalDataLoaded or window._sharedData
    const posts: ScrapedPost[] = [];

    // Try parsing __additionalDataLoaded blocks
    const additionalDataRegex =
      /window\.__additionalDataLoaded\([^,]+,\s*({[\s\S]*?})\s*\);/g;
    let match;
    while ((match = additionalDataRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const user = data?.data?.user;
        if (user) {
          if (user.full_name) fullName = user.full_name;
          if (user.biography) bio = user.biography;
          if (user.profile_pic_url_hd || user.profile_pic_url) {
            profilePicUrl = user.profile_pic_url_hd || user.profile_pic_url;
          }
          if (user.edge_followed_by?.count) followers = user.edge_followed_by.count;
          if (user.edge_follow?.count) following = user.edge_follow.count;
          if (user.edge_owner_to_timeline_media?.count) {
            postsCount = user.edge_owner_to_timeline_media.count;
          }
          if (user.is_verified) isVerified = user.is_verified;

          const mediaEdges = user.edge_owner_to_timeline_media?.edges || [];
          for (const edge of mediaEdges) {
            const node = edge.node;
            if (!node) continue;

            const isVideo = node.is_video || node.__typename === "GraphVideo";
            const shortcode = node.shortcode || "";

            posts.push({
              igPostId: node.id || shortcode,
              shortcode,
              caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || null,
              videoUrl: isVideo ? node.video_url : null,
              thumbnailUrl: node.thumbnail_src || node.display_url || null,
              mediaType: isVideo ? "VIDEO" : node.__typename === "GraphSidecar" ? "CAROUSEL" : "IMAGE",
              permalink: `https://www.instagram.com/p/${shortcode}/`,
              timestamp: node.taken_at_timestamp
                ? new Date(node.taken_at_timestamp * 1000).toISOString()
                : new Date().toISOString(),
              likes: node.edge_media_preview_like?.count || 0,
              comments: node.edge_media_to_comment?.count || 0,
              views: isVideo ? node.video_view_count || null : null,
            });
          }
        }
      } catch {}
    }

    // Try _sharedData fallback
    if (posts.length === 0) {
      const sharedDataMatch = html.match(
        /window\._sharedData\s*=\s*({[\s\S]*?});<\/script>/
      );
      if (sharedDataMatch) {
        try {
          const shared = JSON.parse(sharedDataMatch[1]);
          const user =
            shared?.entry_data?.ProfilePage?.[0]?.graphql?.user;
          if (user) {
            if (user.full_name) fullName = user.full_name;
            if (user.biography) bio = user.biography;
            if (user.profile_pic_url_hd || user.profile_pic_url) {
              profilePicUrl = user.profile_pic_url_hd || user.profile_pic_url;
            }
            if (user.edge_followed_by?.count) followers = user.edge_followed_by.count;
            if (user.edge_follow?.count) following = user.edge_follow.count;
            if (user.edge_owner_to_timeline_media?.count) {
              postsCount = user.edge_owner_to_timeline_media.count;
            }
            if (user.is_verified) isVerified = user.is_verified;

            const mediaEdges = user.edge_owner_to_timeline_media?.edges || [];
            for (const edge of mediaEdges) {
              const node = edge.node;
              if (!node) continue;
              const isVideo = node.is_video || node.__typename === "GraphVideo";
              const shortcode = node.shortcode || "";
              posts.push({
                igPostId: node.id || shortcode,
                shortcode,
                caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || null,
                videoUrl: isVideo ? node.video_url : null,
                thumbnailUrl: node.thumbnail_src || node.display_url || null,
                mediaType: isVideo ? "VIDEO" : "IMAGE",
                permalink: `https://www.instagram.com/p/${shortcode}/`,
                timestamp: node.taken_at_timestamp
                  ? new Date(node.taken_at_timestamp * 1000).toISOString()
                  : new Date().toISOString(),
                likes: node.edge_media_preview_like?.count || 0,
                comments: node.edge_media_to_comment?.count || 0,
                views: isVideo ? node.video_view_count || null : null,
              });
            }
          }
        } catch {}
      }
    }

    // Try extracting from meta tags as last resort for profile info
    if (!profilePicUrl) {
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogImageMatch) profilePicUrl = ogImageMatch[1];
    }

    if (!bio) {
      const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
      if (ogDescMatch) bio = ogDescMatch[1];
    }

    if (posts.length === 0 && !ldJsonMatch) return null;

    return {
      username,
      fullName,
      bio,
      profilePicUrl,
      followers,
      following,
      postsCount: postsCount || posts.length,
      isVerified,
      posts,
    };
  } catch (err) {
    console.error("[scraper] HTML scrape failed:", err);
    return null;
  }
}

/**
 * Attempt 2: Use Scrappa API as fallback.
 * Requires SCRAPPA_API_KEY environment variable.
 */
async function scrapeViaScrappa(username: string): Promise<ScrapedProfile | null> {
  const apiKey = process.env.SCRAPPA_API_KEY;
  if (!apiKey) {
    console.error("[scraper] No SCRAPPA_API_KEY set");
    return null;
  }

  try {
    // Fetch profile — response: { success: true, user: { ... } }
    const profileRes = await fetch(
      `https://scrappa.co/api/instagram/user?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "X-API-KEY": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error(`[scraper] Scrappa profile request failed (${profileRes.status}):`, errText.slice(0, 200));
      return null;
    }

    const profileData = await profileRes.json();
    const user = profileData.user || profileData;

    // Fetch posts — response: { success: true, posts: [ { ... } ] }
    const postsRes = await fetch(
      `https://scrappa.co/api/instagram/user/posts?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "X-API-KEY": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!postsRes.ok) {
      const errText = await postsRes.text();
      console.error(`[scraper] Scrappa posts request failed (${postsRes.status}):`, errText.slice(0, 200));
      return null;
    }

    const postsData = await postsRes.json();

    const posts: ScrapedPost[] = (postsData.posts || []).map((p: any) => {
      const shortcode = p.shortcode || p.code || p.id || "";
      const mediaType = (p.media_type || "").toUpperCase();
      const isVideo = mediaType === "VIDEO" || p.is_video === true;

      // Scrappa returns media as an array of { type, video_url, thumbnail_url }
      let videoUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      if (Array.isArray(p.media) && p.media.length > 0) {
        const firstMedia = p.media[0];
        if (firstMedia.video_url) videoUrl = firstMedia.video_url;
        if (firstMedia.thumbnail_url) thumbnailUrl = firstMedia.thumbnail_url;
      }

      // Fallback to top-level fields
      if (!videoUrl && p.video_url) videoUrl = p.video_url;
      if (!thumbnailUrl && p.thumbnail_url) thumbnailUrl = p.thumbnail_url;

      return {
        igPostId: p.id || shortcode,
        shortcode,
        caption: typeof p.caption === "string" ? p.caption : (p.caption?.text || null),
        videoUrl,
        thumbnailUrl,
        mediaType: isVideo ? "VIDEO" : "IMAGE",
        permalink: p.permalink || `https://www.instagram.com/p/${shortcode}/`,
        timestamp: p.taken_at || (p.taken_at_timestamp
          ? new Date(p.taken_at_timestamp * 1000).toISOString()
          : new Date().toISOString()),
        likes: p.like_count || p.likes || 0,
        comments: p.comment_count || p.comments || 0,
        views: p.play_count || p.video_view_count || p.views || null,
      };
    });

    return {
      username,
      fullName: user.full_name || user.name || username,
      bio: user.biography || user.bio || null,
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || null,
      followers: user.follower_count || user.followers || 0,
      following: user.following_count || user.following || 0,
      postsCount: user.media_count || user.posts_count || posts.length,
      isVerified: user.is_verified || false,
      posts,
    };
  } catch (err) {
    console.error("[scraper] Scrappa fallback failed:", err);
    return null;
  }
}

/**
 * Main entry point: scrape a public Instagram profile.
 * Tries direct HTML scraping first, falls back to Scrappa API if configured.
 */
export async function scrapeInstagramProfile(
  username: string
): Promise<ScrapedProfile | null> {
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  if (!clean) return null;

  // Try direct HTML scrape first
  const result = await scrapeViaHTML(clean);
  if (result && result.posts.length > 0) return result;

  // Fallback to Scrappa API
  const scrappaResult = await scrapeViaScrappa(clean);
  if (scrappaResult) return scrappaResult;

  return null;
}
