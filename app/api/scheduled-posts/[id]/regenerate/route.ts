import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { regenerateCaption, generateImage } from "@/lib/ai";
import { saveGeneratedImage } from "@/lib/images";

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
    });

    let imageFilePath = post.imageFilePath;
    if (regenerateImage !== false) {
      try {
        const imageBuffer = await generateImage(imagePrompt);
        const saved = saveGeneratedImage(imageBuffer, `${post.id}-${Date.now()}`);
        imageFilePath = saved.filePath;
      } catch (imgErr) {
        console.error("Image regeneration failed:", imgErr);
      }
    }

    const updated = await prisma.scheduledPost.update({
      where: { id: params.id },
      data: { caption, imagePrompt, imageFilePath },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err) {
    console.error("Regenerate post error:", err);
    const message = err instanceof Error ? err.message : "Regeneration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
