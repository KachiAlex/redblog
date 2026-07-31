import Link from "next/link";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { formatDate, relativeTime, truncate } from "@/lib/utils";
import { Play, ExternalLink, Film } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const creator = await prisma.creator.findFirst({
    include: {
      blogPage: true,
      posts: {
        orderBy: { publishedAt: "desc" },
      },
    },
    orderBy: { connectedAt: "desc" },
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflowX: "hidden" }}>
        <div className="wrap" style={{ padding: "32px 0" }}>
          <div style={{ marginBottom: "32px" }}>
            <span className="eyebrow">All entries</span>
            <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "32px", marginTop: "8px" }}>
              Posts
            </h1>
            <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
              {creator?.posts.length || 0} POST(S) SYNCED FROM INSTAGRAM
            </span>
          </div>

          {!creator || creator.posts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
              <span className="eyebrow" style={{ marginBottom: "16px" }}>Empty contact sheet</span>
              <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "24px", marginBottom: "12px" }}>
                No posts yet.
              </h2>
              <p style={{ color: "var(--gray)", fontSize: "14px", marginBottom: "24px" }}>
                Connect your Instagram and sync to see your posts here.
              </p>
              <Link href="/scan" className="btn btn-primary">
                Scan any Instagram →
              </Link>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} id="posts-stats">
                {[
                  { label: "Total", value: creator.posts.length },
                  { label: "Videos", value: creator.posts.filter((p) => p.mediaType === "VIDEO").length },
                  { label: "Carousels", value: creator.posts.filter((p) => p.mediaType === "CAROUSEL_ALBUM").length },
                  { label: "Embeds", value: creator.posts.filter((p) => p.embedHtml).length },
                ].map((stat) => (
                  <div key={stat.label} className="card-dark" style={{ padding: "16px 20px" }}>
                    <p className="font-serif-display" style={{ fontSize: "28px" }}>{stat.value}</p>
                    <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Posts table */}
              <div className="card-dark" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--line)" }}>
                        <th className="font-mono-label" style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Post</th>
                        <th className="font-mono-label" style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Type</th>
                        <th className="font-mono-label" style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Published</th>
                        <th className="font-mono-label" style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Embed</th>
                        <th className="font-mono-label" style={{ padding: "12px 24px", textAlign: "right", fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creator.posts.map((post) => (
                        <tr key={post.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "44px", height: "44px", flexShrink: 0, borderRadius: "6px", overflow: "hidden", background: "var(--bg-raised)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {post.thumbnailUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={post.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <Play style={{ width: "14px", height: "14px", color: "var(--gray)" }} />
                                )}
                              </div>
                              <div style={{ minWidth: 0, maxWidth: "280px" }}>
                                <p style={{ fontSize: "13.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {post.caption ? truncate(post.caption, 50) : "Untitled post"}
                                </p>
                                <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>
                                  {relativeTime(post.publishedAt)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <span className="badge-dark" style={{ background: "var(--bg-raised)", color: "var(--gray)" }}>
                              {post.mediaType === "VIDEO" ? "Video" : "Carousel"}
                            </span>
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                              {formatDate(post.publishedAt)}
                            </span>
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            {post.embedHtml ? (
                              <span className="badge-dark" style={{ background: "rgba(232,64,44,0.15)", color: "var(--red-bright)" }}>
                                ● Active
                              </span>
                            ) : (
                              <span className="badge-dark" style={{ background: "var(--bg-raised)", color: "var(--gray)" }}>
                                ○ Fallback
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                              {creator.blogPage && (
                                <Link
                                  href={`/blog/${creator.blogPage.slug}/${post.id}`}
                                  className="btn btn-ghost"
                                  style={{ fontSize: "11px", padding: "6px 12px" }}
                                >
                                  <Film style={{ width: "12px", height: "12px" }} />
                                  View
                                </Link>
                              )}
                              <a
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost"
                                style={{ fontSize: "11px", padding: "6px 12px" }}
                              >
                                <ExternalLink style={{ width: "12px", height: "12px" }} />
                                IG
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #posts-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

