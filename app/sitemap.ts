import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let blogSitemap: MetadataRoute.Sitemap = [];
  let postSitemap: MetadataRoute.Sitemap = [];

  try {
    const blogPages = await prisma.blogPage.findMany({
      include: {
        creator: {
          select: {
            igUsername: true,
            posts: {
              orderBy: { publishedAt: "desc" },
              take: 1,
              select: { publishedAt: true },
            },
          },
        },
      },
    });

    blogSitemap = blogPages.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.creator.posts[0]?.publishedAt || blog.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const allPosts = await prisma.post.findMany({
      include: {
        creator: {
          include: { blogPage: true },
        },
      },
    });

    postSitemap = allPosts
      .filter((p) => p.creator.blogPage)
      .map((post) => ({
        url: `${baseUrl}/blog/${post.creator.blogPage!.slug}/${post.id}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
  } catch {
    // DB may not be available during build — return static pages only
  }

  return [...staticPages, ...blogSitemap, ...postSitemap];
}
