const { PrismaClient } = require("@prisma/client");
const { encrypt, decrypt } = require("../lib/crypto");
const {
  getMedia,
  getOEmbed,
  refreshLongLivedToken,
  createMediaContainer,
  getContainerStatus,
  publishMediaContainer,
} = require("../lib/instagram");
const { downloadVideo } = require("../lib/scraper");
const { toAbsoluteUrl } = require("../lib/images");

const prisma = new PrismaClient();
const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const PUBLISH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

async function syncCreatorPosts(creator) {
  if (creator.scannedFrom === "scan" || creator.accessToken === "scanned_no_token") {
    console.log(`[worker] Skipping scanned creator @${creator.igUsername} (no OAuth token)`);
    return;
  }

  try {
    let token = decrypt(creator.accessToken);

    // Check if token needs refresh (expires within 7 days)
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
            data: {
              accessToken: encrypt(token),
              tokenExpiry: newExpiry,
            },
          });
          console.log(`[worker] Refreshed token for @${creator.igUsername}`);
        } catch (err) {
          console.error(
            `[worker] Token refresh failed for @${creator.igUsername}:`,
            err.message
          );
        }
      }
    }

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
          let videoFilePath = null;
          try {
            const oembed = await getOEmbed(item.permalink, token);
            embedHtml = oembed.html || null;
            embedTitle = oembed.title || null;
          } catch {
            // Graceful degradation — oEmbed may fail
          }

          if (item.media_url && item.media_type === "VIDEO") {
            try {
              const downloaded = await downloadVideo(item.media_url, item.id);
              if (downloaded) {
                videoFilePath = process.env.VERCEL
                  ? `/api/videos/${item.id}.mp4`
                  : downloaded.filePath;
              }
            } catch {
              // Video download may fail — continue with just the URL
            }
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
              videoFilePath,
              mediaType: item.media_type,
              source: "oauth",
              publishedAt: new Date(item.timestamp),
            },
          });
          newCount++;
          console.log(
            `[worker] New post synced for @${creator.igUsername}: ${item.id}`
          );
        }
      }
    }

    if (newCount > 0) {
      console.log(
        `[worker] @${creator.igUsername}: ${newCount} new post(s) synced`
      );
    }
  } catch (err) {
    console.error(
      `[worker] Sync failed for @${creator.igUsername}:`,
      err.message
    );
  }
}

async function pollAllCreators() {
  console.log(`[worker] Polling cycle started at ${new Date().toISOString()}`);
  const creators = await prisma.creator.findMany();
  console.log(`[worker] Found ${creators.length} creator(s) to poll`);

  for (const creator of creators) {
    await syncCreatorPosts(creator);
  }

  console.log(`[worker] Polling cycle complete`);
}

async function publishScheduledPost(post) {
  const creator = post.creator;
  try {
    if (!post.imageFilePath) {
      throw new Error("No generated image available for this post");
    }

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: { status: "publishing", error: null },
    });

    const token = decrypt(creator.accessToken);
    const imageUrl = toAbsoluteUrl(post.imageFilePath, APP_BASE_URL);

    const container = await createMediaContainer(
      creator.igUserId,
      token,
      imageUrl,
      post.caption
    );

    // Poll the container until Instagram has finished ingesting the image.
    let statusCode = "IN_PROGRESS";
    for (let attempt = 0; attempt < 10 && statusCode === "IN_PROGRESS"; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await getContainerStatus(container.id, token);
      statusCode = statusRes.status_code;
    }

    if (statusCode !== "FINISHED") {
      throw new Error(`Media container did not finish processing (status: ${statusCode})`);
    }

    const published = await publishMediaContainer(creator.igUserId, token, container.id);

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: {
        status: "published",
        igMediaId: published.id,
        publishedAt: new Date(),
      },
    });

    console.log(`[worker] Published scheduled post ${post.id} for @${creator.igUsername}`);
  } catch (err) {
    console.error(`[worker] Failed to publish scheduled post ${post.id}:`, err.message);
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: { status: "failed", error: err.message },
    });
  }
}

async function publishDuePosts() {
  const duePosts = await prisma.scheduledPost.findMany({
    where: { status: "scheduled", scheduledFor: { lte: new Date() } },
    include: { creator: true },
  });

  if (duePosts.length === 0) return;

  console.log(`[worker] Found ${duePosts.length} scheduled post(s) due for publishing`);
  for (const post of duePosts) {
    await publishScheduledPost(post);
  }
}

async function main() {
  console.log("[worker] ReelBlog polling worker started");
  console.log(`[worker] Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
  console.log(`[worker] Publish interval: ${PUBLISH_INTERVAL_MS / 1000}s`);

  // Run immediately on startup
  await pollAllCreators();
  await publishDuePosts();

  // Then poll on interval
  setInterval(pollAllCreators, POLL_INTERVAL_MS);
  setInterval(publishDuePosts, PUBLISH_INTERVAL_MS);
}

main().catch(console.error);
