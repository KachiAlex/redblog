import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const creators = await prisma.creator.findMany({
      include: {
        _count: { select: { posts: true } },
        blogPage: true,
      },
      orderBy: { connectedAt: "desc" },
    });

    const totalPosts = await prisma.post.count();
    const totalBlogPages = await prisma.blogPage.count();
    const totalViews = await prisma.analytics.aggregate({ _sum: { pageViews: true } });

    const recentCreators = creators.slice(0, 10).map((c) => ({
      id: c.id,
      igUsername: c.igUsername,
      igUserId: c.igUserId,
      connectedAt: c.connectedAt.toISOString(),
      tokenExpiry: c.tokenExpiry?.toISOString() || null,
      postCount: c._count.posts,
      blogSlug: c.blogPage?.slug || null,
    }));

    return NextResponse.json({
      stats: {
        totalCreators: creators.length,
        totalPosts,
        totalBlogPages,
        totalViews: totalViews._sum.pageViews || 0,
      },
      creators: recentCreators,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
