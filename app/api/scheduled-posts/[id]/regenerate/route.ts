import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { regenerateCaption, generateImage, AiError } from "@/lib/ai";
import { saveGeneratedImage } from "@/lib/images";

function friendlyErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AiError) return err.message;
  return fallback;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { instructions, regenerateImage } = body as {
      instructions?: string;
      regenerateImage?: boolean;
    };

    const post = await prisma.scheduledPost.findUnique({
      where: { id: params.id },
      include: { creator: true, campaign: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
    }
    if (["published", "publishing"].includes(post.status)) {
      return NextResponse.json({ error: "Cannot regenerate a post that is already publishing/published" }, { status: 400 });
    }

    const { caption, imagePrompt } = await regenerateCaption({
      context: post.campaign?.context || post.caption,
      tone: post.campaign?.tone || undefined,
      igUsername: post.creator.igUsername,
      instructions,
      textProvider: post.campaign?.textProvider,
    });

    let imageFilePath = post.imageFilePath;
    let warning: string | undefined;
    if (regenerateImage !== false && post.campaign?.imageProvider !== "none") {
      try {
        const imageBuffer = await generateImage(imagePrompt, post.campaign?.imageProvider);
        if (imageBuffer) {
          const saved = saveGeneratedImage(imageBuffer, `${post.id}-${Date.now()}`);
          imageFilePath = saved.filePath;
        }
      } catch (imgErr) {
        console.error("Image regeneration failed:", imgErr);
        warning = `${friendlyErrorMessage(imgErr, "The image couldn't be regenerated.")} The caption was updated, but the previous image was kept.`;
      }
    }

    const updated = await prisma.scheduledPost.update({
      where: { id: params.id },
      data: { caption, imagePrompt, imageFilePath },
    });

    return NextResponse.json({ success: true, post: updated, warning });
  } catch (err) {
    console.error("Regenerate post error:", err);
    return NextResponse.json(
      { error: friendlyErrorMessage(err, "Couldn't regenerate this post right now. Please try again in a moment.") },
      { status: 500 }
    );
  }
}
