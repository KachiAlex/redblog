import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AnalyticsChart } from "@/components/analytics-chart";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const creator = await prisma.creator.findFirst({
    include: {
      blogPage: true,
      posts: {
        orderBy: { publishedAt: "desc" },
        take: 10,
      },
      analytics: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
    orderBy: { connectedAt: "desc" },
  });

  const totalViews = creator?.analytics.reduce((sum, a) => sum + a.pageViews, 0) || 0;
  const last30Days = creator?.analytics || [];

  const dailyData = last30Days
    .reverse()
    .map((a) => ({
      date: formatDate(a.date),
      views: a.pageViews,
    }));

  const topPosts = (creator?.posts || [])
    .map((p) => ({
      id: p.id,
      caption: p.caption,
      thumbnailUrl: p.thumbnailUrl,
      publishedAt: p.publishedAt.toISOString(),
      permalink: p.permalink,
    }))
    .slice(0, 5);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflowX: "hidden" }} className="dash-content-wrap">
        <div className="wrap" style={{ padding: "32px 0" }}>
          <div style={{ marginBottom: "32px" }}>
            <span className="eyebrow">Performance metrics</span>
            <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "32px", marginTop: "8px" }}>
              Analytics
            </h1>
            <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
              TRACK YOUR BLOG&apos;S PERFORMANCE AND AUDIENCE ENGAGEMENT
            </span>
          </div>

          {/* Stats Cards */}
          <div style={{ marginBottom: "32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} id="analytics-stats">
            <div className="card-dark" style={{ padding: "24px" }}>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Views</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px" }}>{totalViews}</p>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", marginTop: "4px", display: "block" }}>All time</span>
            </div>
            <div className="card-dark" style={{ padding: "24px" }}>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Last 30 Days</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px" }}>
                {last30Days.reduce((s, a) => s + a.pageViews, 0)}
              </p>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", marginTop: "4px", display: "block" }}>Page views</span>
            </div>
            <div className="card-dark" style={{ padding: "24px" }}>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Published Posts</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px" }}>
                {creator?.posts.length || 0}
              </p>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", marginTop: "4px", display: "block" }}>Synced from IG</span>
            </div>
            <div className="card-dark" style={{ padding: "24px" }}>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Avg. Views / Post</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px" }}>
                {creator && creator.posts.length > 0
                  ? Math.round(totalViews / creator.posts.length)
                  : 0}
              </p>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", marginTop: "4px", display: "block" }}>Per post average</span>
            </div>
          </div>

          {/* Chart */}
          <div className="card-dark" style={{ marginBottom: "32px", padding: "24px" }}>
            <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Traffic (Last 30 Days)</h2>
            <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
              Daily page views on your blog
            </span>
            <div style={{ marginTop: "24px" }}>
              <AnalyticsChart data={dailyData} />
            </div>
          </div>

          {/* Top Posts */}
          <div className="card-dark" style={{ overflow: "hidden" }}>
            <div style={{ borderBottom: "1px solid var(--line)", padding: "16px 24px" }}>
              <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Recent Posts</h2>
              <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                Your latest synced content
              </span>
            </div>
            <div>
              {topPosts.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--gray)", fontSize: "14px" }}>
                  No posts synced yet.
                </div>
              ) : (
                topPosts.map((post, i) => (
                  <div key={post.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
                    <span className="font-mono-label" style={{ fontSize: "14px", color: "var(--gray)", width: "24px" }}>#{i + 1}</span>
                    <div style={{ width: "44px", height: "44px", flexShrink: 0, borderRadius: "6px", overflow: "hidden", background: "var(--bg-raised)" }}>
                      {post.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : null}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "13.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {post.caption ? post.caption.slice(0, 60) + "..." : "Untitled post"}
                      </p>
                      <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info note */}
          {totalViews === 0 && (
            <div style={{ marginTop: "24px", border: "1px solid var(--line)", background: "var(--bg-raised)", borderRadius: "4px", padding: "12px 16px", fontSize: "13px", color: "var(--gray)" }} className="font-mono-label">
              Analytics tracking starts once your blog receives its first visitors. Share your blog URL to start collecting data.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #analytics-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-content-wrap { padding-bottom: 80px !important; }
        }
        @media (max-width: 480px) {
          #analytics-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

