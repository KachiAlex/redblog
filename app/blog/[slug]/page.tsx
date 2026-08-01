import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, relativeTime, truncate } from "@/lib/utils";
import { Play, ExternalLink, ArrowLeft, Video } from "lucide-react";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { RescanButton } from "@/components/rescan-button";
import { PostCard } from "@/components/post-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blogPage = await prisma.blogPage.findUnique({
    where: { slug: params.slug },
    include: {
      creator: {
        select: { igUsername: true, igProfilePic: true },
      },
    },
  });

  if (!blogPage) return { title: "Blog not found — RedBlog" };

  return {
    title: `@${blogPage.creator.igUsername} — RedBlog`,
    description: `Watch ${blogPage.creator.igUsername}'s Instagram Reels as a playable archive.`,
    openGraph: {
      title: `@${blogPage.creator.igUsername} — RedBlog`,
      description: `Watch ${blogPage.creator.igUsername}'s Instagram Reels as a playable archive.`,
      type: "website",
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { tag?: string };
}) {
  const blogPage = await prisma.blogPage.findUnique({
    where: { slug: params.slug },
    include: {
      creator: {
        select: {
          id: true,
          igUsername: true,
          igProfilePic: true,
          connectedAt: true,
          posts: {
            orderBy: { publishedAt: "desc" },
          },
        },
      },
    },
  });

  if (!blogPage) notFound();

  const { creator, creator: { posts: allPosts } } = blogPage;

  const allTags = Array.from(
    new Set(allPosts.flatMap((p) => p.tags))
  ).sort();

  const activeTag = searchParams?.tag;
  const posts = activeTag
    ? allPosts.filter((p) => p.tags.includes(activeTag))
    : allPosts;

  const gridStyle: React.CSSProperties =
    blogPage.themeLayout === "list"
      ? { display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px", margin: "0 auto" }
      : blogPage.themeLayout === "masonry"
      ? { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", gridAutoFlow: "dense" }
      : { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" };

  return (
    <div>
      <AnalyticsTracker slug={blogPage.slug} />
      {/* Blog Header */}
      <header style={{ borderBottom: "1px solid var(--line)", padding: "48px 0 40px" }}>
        <div className="wrap">
          <Link
            href="/blog"
            className="font-mono-label"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--gray)", marginBottom: "24px" }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            ← All archives
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }} id="blog-header">
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${blogPage.themePrimary}, ${blogPage.themeAccent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 600,
                color: "var(--paper)",
                fontFamily: "var(--font-serif)",
                flexShrink: 0,
              }}
            >
              {creator.igUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1 }}>
                @{creator.igUsername}
              </h1>
              {blogPage.bio && (
                <p style={{ marginTop: "8px", color: "#a9a396", fontSize: "15px", maxWidth: "480px", lineHeight: 1.5 }}>
                  {blogPage.bio}
                </p>
              )}
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                  {posts.length} REELS
                </span>
                <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                  SINCE {formatDate(creator.connectedAt).toUpperCase()}
                </span>
                <RescanButton username={creator.igUsername} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Posts Feed */}
      <main style={{ padding: "48px 0 80px" }}>
        <div className="wrap">
          {/* Tag filter bar */}
          {allTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
              <Link
                href={`/blog/${blogPage.slug}`}
                className="font-mono-label"
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  borderRadius: "3px",
                  border: "1px solid var(--line)",
                  background: !activeTag ? "var(--bg-raised)" : "transparent",
                  color: !activeTag ? "var(--paper)" : "var(--gray)",
                }}
              >
                All
              </Link>
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/${blogPage.slug}?tag=${encodeURIComponent(tag)}`}
                  className="font-mono-label"
                  style={{
                    fontSize: "12px",
                    padding: "6px 12px",
                    borderRadius: "3px",
                    border: "1px solid var(--line)",
                    background: activeTag === tag ? "var(--bg-raised)" : "transparent",
                    color: activeTag === tag ? "var(--paper)" : "var(--gray)",
                  }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
              <span className="eyebrow" style={{ marginBottom: "16px" }}>Empty archive</span>
              <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "24px", marginBottom: "12px" }}>
                No posts yet.
              </h2>
              <p style={{ color: "var(--gray)", fontSize: "14px" }}>
                Posts will appear here once synced from Instagram.
              </p>
            </div>
          ) : (
            <div style={gridStyle} id="posts-grid">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    publishedAt: post.publishedAt.toISOString(),
                  }}
                  blogSlug={blogPage.slug}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: "32px 0" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
            Powered by <Link href="/" style={{ color: "var(--red-bright)" }}>RedBlog</Link>
          </span>
          <a
            href={`https://instagram.com/${creator.igUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-label"
            style={{ fontSize: "12px", color: "var(--gray)" }}
          >
            Follow on Instagram →
          </a>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          #posts-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #posts-grid { grid-template-columns: 1fr !important; }
          #blog-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  );
}

