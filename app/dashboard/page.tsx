import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { connected?: string };
}) {
  const creators = await prisma.creator.findMany({
    include: {
      posts: {
        orderBy: { publishedAt: "desc" },
        take: 5,
      },
      _count: { select: { posts: true } },
      blogPage: true,
    },
    orderBy: { connectedAt: "desc" },
  });

  const connected = searchParams.connected === "1";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflowX: "hidden" }} className="dash-content-wrap">
        <div className="wrap" style={{ padding: "32px 0" }}>
          {connected && (
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid rgba(232,64,44,0.3)",
                background: "rgba(232,64,44,0.08)",
                borderRadius: "4px",
                padding: "12px 16px",
                fontSize: "14px",
                color: "var(--red-bright)",
              }}
            >
              <CheckCircle2 style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              <span>Your Instagram account is connected. We&apos;ve synced your recent posts.</span>
            </div>
          )}

          {creators.length === 0 ? (
            <NotConnectedState />
          ) : (
            <DashboardContent creators={creators.map((c) => ({
              id: c.id,
              igUsername: c.igUsername,
              igProfilePic: c.igProfilePic,
              connectedAt: c.connectedAt.toISOString(),
              scannedFrom: c.scannedFrom,
              blogPage: c.blogPage ? { slug: c.blogPage.slug } : null,
              posts: c.posts.map((p) => ({
                id: p.id,
                caption: p.caption,
                thumbnailUrl: p.thumbnailUrl,
                permalink: p.permalink,
                publishedAt: p.publishedAt.toISOString(),
              })),
              _count: { posts: c._count.posts },
            }))} />
          )}
        </div>
      </div>
    </div>
  );
}

function NotConnectedState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
      <span className="eyebrow" style={{ marginBottom: "16px" }}>No blog connected</span>
      <h2
        className="font-serif-display"
        style={{ fontStyle: "italic", fontSize: "32px", marginBottom: "12px" }}
      >
        Connect your Instagram to begin.
      </h2>
      <p style={{ color: "var(--gray)", fontSize: "15px", maxWidth: "380px", marginBottom: "28px", lineHeight: 1.6 }}>
        Once connected, RedBlog automatically syncs your Reels and develops them into a permanent, searchable archive. It takes less than a minute.
      </p>
      <Link href="/scan" className="btn btn-primary">
        Connect Instagram →
      </Link>
    </div>
  );
}

