import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { caption, scheduledFor, status } = body as {
      caption?: string;
      scheduledFor?: string;
      status?: string;
    };

    const post = await prisma.scheduledPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
    }

    if (["published", "publishing"].includes(post.status)) {
      return NextResponse.json({ error: "Cannot edit a post that is already publishing/published" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (caption !== undefined) data.caption = caption;
    if (scheduledFor !== undefined) data.scheduledFor = new Date(scheduledFor);
    if (status !== undefined) {
      if (!["draft", "scheduled"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = status;
    }

    const updated = await prisma.scheduledPost.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err) {
    console.error("Update scheduled post error:", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.scheduledPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
    }
    if (["published", "publishing"].includes(post.status)) {
      return NextResponse.json({ error: "Cannot delete a post that is already publishing/published" }, { status: 400 });
    }

    await prisma.scheduledPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete scheduled post error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
