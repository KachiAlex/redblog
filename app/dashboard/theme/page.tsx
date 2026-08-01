import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ThemeCustomizer } from "@/components/theme-customizer";

export const dynamic = "force-dynamic";

export default async function ThemePage() {
  const creator = await prisma.creator.findFirst({
    include: {
      blogPage: true,
      posts: {
        orderBy: { publishedAt: "desc" },
        take: 6,
      },
    },
    orderBy: { connectedAt: "desc" },
  });

  if (!creator || !creator.blogPage) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <DashboardSidebar />
        <div style={{ flex: 1 }}>
          <div className="wrap" style={{ padding: "32px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
              <span className="eyebrow" style={{ marginBottom: "16px" }}>No blog page found</span>
              <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "24px", marginBottom: "12px" }}>
                No blog page found.
              </h2>
              <p style={{ color: "var(--gray)", fontSize: "14px" }}>
                Connect your Instagram to create a blog page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflowX: "hidden" }} className="dash-content-wrap">
        <div className="wrap" style={{ padding: "32px 0" }}>
          <ThemeCustomizer
            creatorId={creator.id}
            igUsername={creator.igUsername}
            posts={creator.posts.map((p) => ({
              id: p.id,
              caption: p.caption,
              thumbnailUrl: p.thumbnailUrl,
              videoUrl: p.videoUrl,
              mediaType: p.mediaType,
              permalink: p.permalink,
            }))}
            initialSettings={{
              slug: creator.blogPage.slug,
              themePrimary: creator.blogPage.themePrimary,
              themeAccent: creator.blogPage.themeAccent,
              themeLayout: creator.blogPage.themeLayout,
              title: creator.blogPage.title,
              bio: creator.blogPage.bio,
            }}
          />
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .dash-content-wrap { padding-bottom: 80px !important; }
        }
      `}</style>
    </div>
  );
}
