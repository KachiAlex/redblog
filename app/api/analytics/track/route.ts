import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const blogPage = await prisma.blogPage.findUnique({
      where: { slug },
      select: { creatorId: true },
    });

    if (!blogPage) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.analytics.findFirst({
      where: {
        creatorId: blogPage.creatorId,
        postId: null,
        date: today,
      },
    });

    if (existing) {
      await prisma.analytics.update({
        where: { id: existing.id },
        data: { pageViews: { increment: 1 } },
      });
    } else {
      await prisma.analytics.create({
        data: {
          creatorId: blogPage.creatorId,
          postId: null,
          pageViews: 1,
          date: today,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}
