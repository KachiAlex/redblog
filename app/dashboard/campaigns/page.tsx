import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { CampaignManager } from "@/components/campaign-manager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const creator = await prisma.creator.findFirst({
    orderBy: { connectedAt: "desc" },
  });

  const campaigns = creator
    ? await prisma.campaign.findMany({
        where: { creatorId: creator.id },
        include: { posts: { orderBy: { scheduledFor: "asc" } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflowX: "hidden" }} className="dash-content-wrap">
        <div className="wrap" style={{ padding: "32px 0" }}>
          {!creator ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
              <span className="eyebrow" style={{ marginBottom: "16px" }}>No account connected</span>
              <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "24px", marginBottom: "12px" }}>
                Connect Instagram first.
              </h2>
              <p style={{ color: "var(--gray)", fontSize: "14px", marginBottom: "24px" }}>
                The AI Studio needs a connected Instagram account to schedule and publish posts.
              </p>
              <Link href="/scan" className="btn btn-primary">
                Connect Instagram →
              </Link>
            </div>
          ) : (
            <CampaignManager
              creatorId={creator.id}
              igUsername={creator.igUsername}
              initialCampaigns={JSON.parse(JSON.stringify(campaigns))}
            />
          )}
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
