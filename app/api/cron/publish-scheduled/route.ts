import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import {
  createMediaContainer,
  getContainerStatus,
  publishMediaContainer,
} from "@/lib/instagram";
import { toAbsoluteUrl } from "@/lib/images";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const APP_BASE_URL =
  process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

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

/**
 * Phase 1: For each due scheduled post, create an Instagram media container
 * and move it to "publishing" status with the containerId stored. Instagram
 * then processes the image asynchronously. We do NOT block waiting for it —
 * the next cron tick's Phase 2 will check the status.
 */
async function startPublishingDuePosts(): Promise<number> {
  const duePosts = await prisma.scheduledPost.findMany({
    where: { status: "scheduled", scheduledFor: { lte: new Date() } },
    include: { creator: true },
  });

  if (duePosts.length === 0) return 0;
  console.log(`[cron:publish] Starting ${duePosts.length} due post(s)`);

  let started = 0;
  for (const post of duePosts) {
    try {
      if (!post.imageFilePath) {
        throw new Error("No generated image available for this post");
      }

      const token = decrypt(post.creator.accessToken);
      const imageUrl = toAbsoluteUrl(post.imageFilePath, APP_BASE_URL);

      const container = await createMediaContainer(
        post.creator.igUserId,
        token,
        imageUrl,
        post.caption
      );

      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "publishing", containerId: container.id, error: null },
      });

      started++;
      console.log(`[cron:publish] Created container ${container.id} for post ${post.id}`);
    } catch (err: any) {
      console.error(`[cron:publish] Failed to start post ${post.id}:`, err.message);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error: err.message },
      });
    }
  }
  return started;
}

/**
 * Phase 2: For each post currently in "publishing" status, check whether
 * Instagram has finished processing the media container. If FINISHED, publish
 * it to the feed. If ERROR, mark failed. If still IN_PROGRESS, leave it for
 * the next tick.
 */
async function checkAndPublishInProgressPosts(): Promise<{ published: number; failed: number }> {
  const inProgress = await prisma.scheduledPost.findMany({
    where: { status: "publishing", containerId: { not: null } },
    include: { creator: true },
  });

  if (inProgress.length === 0) return { published: 0, failed: 0 };
  console.log(`[cron:publish] Checking ${inProgress.length} in-progress post(s)`);

  let published = 0;
  let failed = 0;
  for (const post of inProgress) {
    try {
      const token = decrypt(post.creator.accessToken);
      const statusRes = await getContainerStatus(post.containerId!, token);
      const statusCode = statusRes.status_code;

      if (statusCode === "FINISHED") {
        const publishedMedia = await publishMediaContainer(
          post.creator.igUserId,
          token,
          post.containerId!
        );
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: "published",
            igMediaId: publishedMedia.id,
            publishedAt: new Date(),
          },
        });
        published++;
        console.log(`[cron:publish] Published post ${post.id} (media ${publishedMedia.id})`);
      } else if (statusCode === "ERROR") {
        throw new Error("Instagram reported an error processing the media container");
      }
      // else: still IN_PROGRESS — leave for next tick
    } catch (err: any) {
      console.error(`[cron:publish] Failed to publish post ${post.id}:`, err.message);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error: err.message },
      });
      failed++;
    }
  }
  return { published, failed };
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const started = await startPublishingDuePosts();
    const { published, failed } = await checkAndPublishInProgressPosts();
    return NextResponse.json({ success: true, started, published, failed });
  } catch (err: any) {
    console.error("[cron:publish] Fatal error:", err.message);
    return NextResponse.json({ error: "Publish cycle failed", detail: err.message }, { status: 500 });
  }
}
