import Link from "next/link";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { formatDate } from "@/lib/utils";
import { ExternalLink, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const creator = await prisma.creator.findFirst({
    include: { blogPage: true },
    orderBy: { connectedAt: "desc" },
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflowX: "hidden" }}>
        <div className="wrap" style={{ padding: "32px 0" }}>
          <div style={{ marginBottom: "32px" }}>
            <span className="eyebrow">Account management</span>
            <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "32px", marginTop: "8px" }}>
              Settings
            </h1>
            <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
              MANAGE YOUR ACCOUNT, CONNECTION, AND SECURITY
            </span>
          </div>

          {!creator ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
              <span className="eyebrow" style={{ marginBottom: "16px" }}>No handle connected</span>
              <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "24px", marginBottom: "12px" }}>
                No account connected.
              </h2>
              <p style={{ color: "var(--gray)", fontSize: "14px", marginBottom: "24px" }}>
                Connect your Instagram to manage settings.
              </p>
              <Link href="/api/auth/login" className="btn btn-primary">
                Connect Instagram →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Account Info */}
              <div className="card-dark" style={{ padding: "24px" }}>
                <h2 className="font-serif-display" style={{ fontSize: "20px", marginBottom: "20px" }}>
                  Connected Account
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Row label="Username" value={`@${creator.igUsername}`} action={
                    <a href={`https://instagram.com/${creator.igUsername}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 12px" }}>
                      <ExternalLink style={{ width: "12px", height: "12px" }} /> Profile
                    </a>
                  } />
                  <Row label="Instagram User ID" value={creator.igUserId} mono />
                  <Row label="Connected Since" value={formatDate(creator.connectedAt)} />
                  <Row label="Blog URL" value={`handle.blog/${creator.blogPage?.slug || "..."}`} action={
                    creator.blogPage ? (
                      <Link href={`/blog/${creator.blogPage.slug}`} className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 12px" }}>
                        <ExternalLink style={{ width: "12px", height: "12px" }} /> Open
                      </Link>
                    ) : undefined
                  } />
                </div>
              </div>

              {/* Security */}
              <div className="card-dark" style={{ padding: "24px" }}>
                <h2 className="font-serif-display" style={{ fontSize: "20px", marginBottom: "20px" }}>
                  Security
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Row label="Token Encryption" value="AES-256-GCM encrypted at rest" badge="Secured" />
                  <Row label="OAuth Token" value={creator.tokenExpiry ? `Expires ${formatDate(creator.tokenExpiry)}` : "No expiry set"} badge="Active" />
                  <Row label="API Compliance" value="Official Instagram Graph API only" badge="Compliant" />
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ border: "1px solid rgba(232,64,44,0.3)", borderRadius: "6px", padding: "24px", background: "rgba(232,64,44,0.04)" }}>
                <h2 className="font-serif-display" style={{ fontSize: "20px", marginBottom: "20px", color: "var(--red-bright)" }}>
                  Danger Zone
                </h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>
                      Disconnect Instagram
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--gray)", marginTop: "4px" }}>
                      Removes your account, tokens, and blog page. This cannot be undone.
                    </p>
                  </div>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      border: "1px solid var(--red-bright)",
                      background: "transparent",
                      color: "var(--red-bright)",
                      borderRadius: "3px",
                      padding: "8px 16px",
                      fontSize: "12.5px",
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <LogOut style={{ width: "14px", height: "14px" }} />
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, action, badge }: { label: string; value: string; mono?: boolean; action?: React.ReactNode; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid var(--line)", gap: "12px" }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: "13px", color: "var(--gray)", marginTop: "2px", fontFamily: mono ? "var(--font-mono)" : "inherit" }}>
          {value}
        </p>
      </div>
      {badge && (
        <span className="badge-dark" style={{ background: "rgba(232,64,44,0.15)", color: "var(--red-bright)" }}>
          ● {badge}
        </span>
      )}
      {action}
    </div>
  );
}

