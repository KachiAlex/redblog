import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, themePrimary, themeAccent, themeLayout, title, bio, slug } = body;

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId required" }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (themePrimary !== undefined) updateData.themePrimary = themePrimary;
    if (themeAccent !== undefined) updateData.themeAccent = themeAccent;
    if (themeLayout !== undefined) updateData.themeLayout = themeLayout;
    if (title !== undefined) updateData.title = title;
    if (bio !== undefined) updateData.bio = bio;
    if (slug !== undefined) {
      const cleanSlug = slugify(slug);
      if (cleanSlug) {
        const existing = await prisma.blogPage.findFirst({
          where: { slug: cleanSlug, NOT: { creatorId } },
        });
        if (existing) {
          return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
        }
        updateData.slug = cleanSlug;
      }
    }

    const updated = await prisma.blogPage.update({
      where: { creatorId },
      data: updateData,
    });

    return NextResponse.json({ success: true, blogPage: updated });
  } catch (err) {
    console.error("Theme update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
