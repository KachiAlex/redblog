import Link from "next/link";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { PostsView } from "@/components/posts-view";

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
      <div style={{ flex: 1, overflowX: "hidden" }} className="dash-content-wrap">
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
                Connect Instagram →
              </Link>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} id="posts-stats">
                {[
                  { label: "Total", value: creator.posts.length },
                  { label: "Videos", value: creator.posts.filter((p) => p.mediaType === "VIDEO").length },
                  { label: "Images", value: creator.posts.filter((p) => p.mediaType === "IMAGE").length },
                  { label: "Carousels", value: creator.posts.filter((p) => p.mediaType === "CAROUSEL_ALBUM").length },
                ].map((stat) => (
                  <div key={stat.label} className="card-dark" style={{ padding: "16px 20px" }}>
                    <p className="font-serif-display" style={{ fontSize: "28px" }}>{stat.value}</p>
                    <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Posts grid/list view */}
              <PostsView
                posts={creator.posts.map((p) => ({
                  id: p.id,
                  caption: p.caption,
                  thumbnailUrl: p.thumbnailUrl,
                  videoUrl: p.videoUrl,
                  permalink: p.permalink,
                  mediaType: p.mediaType,
                  publishedAt: p.publishedAt.toISOString(),
                  embedHtml: p.embedHtml,
                }))}
                blogSlug={creator.blogPage?.slug}
              />
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #posts-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-content-wrap { padding-bottom: 80px !important; }
        }
        @media (max-width: 480px) {
          #posts-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

