import Link from "next/link";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore — RedBlog",
  description: "Discover creator blogs powered by RedBlog.",
};

export default async function BlogListPage() {
  const blogPages = await prisma.blogPage.findMany({
    include: {
      creator: {
        select: {
          igUsername: true,
          igProfilePic: true,
          _count: { select: { posts: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <Navbar />

      <section style={{ borderBottom: "1px solid var(--line)", padding: "80px 0 48px" }}>
        <div className="wrap">
          <span className="eyebrow">The archive directory</span>
          <h1
            className="font-serif-display"
            style={{ fontStyle: "italic", fontSize: "clamp(36px, 5vw, 52px)", marginTop: "14px", lineHeight: 1.1 }}
          >
            Explore blogs, developed.
          </h1>
          <p style={{ color: "var(--gray)", fontSize: "16px", marginTop: "12px", maxWidth: "480px" }}>
            Every connected account, archived and indexed. Pick a blog to browse their full reel history.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 0 80px" }}>
        <div className="wrap">
          {blogPages.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
              <span className="eyebrow" style={{ marginBottom: "16px" }}>No blogs connected yet</span>
              <h2
                className="font-serif-display"
                style={{ fontStyle: "italic", fontSize: "28px", marginBottom: "12px" }}
              >
                Be the first contact sheet.
              </h2>
              <p style={{ color: "var(--gray)", fontSize: "15px", maxWidth: "360px", marginBottom: "28px" }}>
                Connect your Instagram and turn your Reels into a permanent, searchable archive.
              </p>
              <Link href="/scan" className="btn btn-primary">
                Connect Instagram →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} id="blog-grid">
              {blogPages.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="card-dark"
                  style={{ padding: "24px", display: "block" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        flexShrink: 0,
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, var(--red), var(--red-bright))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--paper)",
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      {blog.creator.igUsername.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3
                        className="font-serif-display"
                        style={{ fontSize: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        @{blog.creator.igUsername}
                      </h3>
                      <span
                        className="font-mono-label"
                        style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.04em" }}
                      >
                        {blog.creator._count.posts} POSTS
                      </span>
                    </div>
                  </div>
                  {blog.bio && (
                    <p style={{ marginTop: "16px", fontSize: "13.5px", color: "#a9a396", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {truncate(blog.bio, 120)}
                    </p>
                  )}
                  <span
                    className="font-mono-label"
                    style={{
                      marginTop: "16px",
                      display: "inline-block",
                      fontSize: "12px",
                      color: "var(--red-bright)",
                      borderBottom: "1px solid var(--red-bright)",
                      paddingBottom: "2px",
                    }}
                  >
                    Visit archive →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          #blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #blog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

