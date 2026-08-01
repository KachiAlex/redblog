import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, relativeTime, truncate } from "@/lib/utils";
import { Play, ExternalLink, ArrowLeft, Video } from "lucide-react";

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
}: {
  params: { slug: string };
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

  const { creator, creator: { posts } } = blogPage;

  return (
    <div>
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
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "20px" }}>
                <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                  {posts.length} REELS
                </span>
                <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                  SINCE {formatDate(creator.connectedAt).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Posts Feed */}
      <main style={{ padding: "48px 0 80px" }}>
        <div className="wrap">
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} id="posts-grid">
              {posts.map((post) => (
                <article key={post.id} className="card-dark" style={{ overflow: "hidden", padding: 0 }}>
                  {/* Thumbnail / Video preview */}
                  <div style={{ position: "relative", aspectRatio: "9/16", overflow: "hidden", background: "var(--bg-raised)" }}>
                    {post.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.thumbnailUrl} alt={post.caption || "Instagram post"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                        <Play style={{ width: "40px", height: "40px", color: "var(--gray)" }} />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play style={{ width: "20px", height: "20px", color: "var(--paper)" }} />
                      </div>
                    </div>
                    {/* Hosted badge */}
                    {post.videoFilePath && (
                      <span className="badge-dark" style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(232, 64, 44, 0.85)", color: "var(--paper)", backdropFilter: "blur(4px)" }}>
                        <Video style={{ width: "10px", height: "10px" }} />
                        Hosted
                      </span>
                    )}
                  </div>

                  {/* Post Info */}
                  <div style={{ padding: "20px" }}>
                    <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>
                      {relativeTime(post.publishedAt)}
                    </span>
                    <h2 className="font-serif-display" style={{ fontSize: "16px", marginTop: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {post.embedTitle || (post.caption ? truncate(post.caption, 80) : "Untitled post")}
                    </h2>
                    {post.caption && (
                      <p style={{ marginTop: "8px", fontSize: "13px", color: "#a9a396", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                        {truncate(post.caption, 150)}
                      </p>
                    )}
                    <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Link
                        href={`/blog/${blogPage.slug}/${post.id}`}
                        className="font-mono-label"
                        style={{ fontSize: "12px", color: "var(--red-bright)", borderBottom: "1px solid var(--red-bright)", paddingBottom: "2px" }}
                      >
                        Read more →
                      </Link>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                      >
                        <ExternalLink style={{ width: "12px", height: "12px" }} />
                        IG
                      </a>
                    </div>
                  </div>
                </article>
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

