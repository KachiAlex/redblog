import { prisma } from "@/lib/db";
import { formatDate, relativeTime } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — RedBlog",
  description: "Platform administration and monitoring",
};

export default async function AdminPage() {
  const creators = await prisma.creator.findMany({
    include: {
      _count: { select: { posts: true } },
      blogPage: true,
    },
    orderBy: { connectedAt: "desc" },
  });

  const totalPosts = await prisma.post.count();
  const totalBlogPages = await prisma.blogPage.count();
  const totalViews = await prisma.analytics.aggregate({ _sum: { pageViews: true } });

  const stats = [
    { label: "Total Creators", value: creators.length },
    { label: "Total Posts", value: totalPosts },
    { label: "Blog Pages", value: totalBlogPages },
    { label: "Total Views", value: totalViews._sum.pageViews || 0 },
  ];

  return (
    <div>
      <Navbar />

      <div className="wrap" style={{ padding: "32px 0 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <span className="eyebrow">Platform administration</span>
          <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "32px", marginTop: "8px" }}>
            Admin Panel
          </h1>
          <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
            PLATFORM OVERVIEW AND CREATOR MANAGEMENT
          </span>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: "32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} id="admin-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="card-dark" style={{ padding: "24px" }}>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{stat.label}</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Compliance Status */}
        <div className="card-dark" style={{ marginBottom: "32px", padding: "24px", borderColor: "rgba(232,64,44,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="eyebrow">Compliance Status: Active</span>
          </div>
          <p style={{ color: "#a9a396", fontSize: "14px", marginTop: "12px", lineHeight: 1.6 }}>
            All content served via official Instagram Graph API and oEmbed endpoints. No scraping, no rehosting.
          </p>
          <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {["Graph API: Operational", "oEmbed: Operational", "Token Encryption: AES-256-GCM", "OAuth 2.0: Enforced"].map((item) => (
              <span key={item} className="badge-dark" style={{ background: "rgba(232,64,44,0.12)", color: "var(--red-bright)" }}>
                ● {item}
              </span>
            ))}
          </div>
        </div>

        {/* Creators Table */}
        <div className="card-dark" style={{ overflow: "hidden", marginBottom: "32px" }}>
          <div style={{ borderBottom: "1px solid var(--line)", padding: "16px 24px" }}>
            <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Connected Creators</h2>
            <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
              {creators.length} creator(s) on the platform
            </span>
          </div>
          {creators.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--gray)", fontSize: "14px" }}>
              No creators connected yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)" }}>
                    {["Creator", "Posts", "Connected", "Token", "Blog"].map((h) => (
                      <th key={h} className="font-mono-label" style={{ padding: "12px 24px", textAlign: h === "Blog" ? "right" : "left", fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator) => {
                    const tokenExpired = creator.tokenExpiry && creator.tokenExpiry < new Date();
                    const tokenExpiringSoon = creator.tokenExpiry && creator.tokenExpiry > new Date() && creator.tokenExpiry.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                    return (
                      <tr key={creator.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "linear-gradient(135deg, var(--red), var(--red-bright))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, color: "var(--paper)", fontFamily: "var(--font-serif)", flexShrink: 0 }}>
                              {creator.igUsername.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: "13.5px" }}>@{creator.igUsername}</p>
                              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>{creator.igUserId}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 500 }}>{creator._count.posts}</span>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>{relativeTime(creator.connectedAt)}</span>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          {tokenExpired ? (
                            <span className="badge-dark" style={{ background: "rgba(232,64,44,0.15)", color: "var(--red-bright)" }}>● Expired</span>
                          ) : tokenExpiringSoon ? (
                            <span className="badge-dark" style={{ background: "var(--bg-raised)", color: "var(--gray)" }}>● Expiring</span>
                          ) : (
                            <span className="badge-dark" style={{ background: "rgba(232,64,44,0.12)", color: "var(--red-bright)" }}>● Active</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          {creator.blogPage ? (
                            <Link href={`/blog/${creator.blogPage.slug}`} className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 12px" }}>
                              <ExternalLink style={{ width: "12px", height: "12px" }} /> View
                            </Link>
                          ) : (
                            <span style={{ fontSize: "11px", color: "var(--gray)" }}>No blog</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }} id="admin-sysinfo">
          <div className="card-dark" style={{ padding: "24px" }}>
            <h3 className="font-serif-display" style={{ fontSize: "18px", marginBottom: "16px" }}>Worker Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SysRow label="Polling Interval" value="15 minutes" />
              <SysRow label="Token Auto-Refresh" value="Enabled" />
              <SysRow label="oEmbed Fallback" value="Enabled" />
            </div>
          </div>
          <div className="card-dark" style={{ padding: "24px" }}>
            <h3 className="font-serif-display" style={{ fontSize: "18px", marginBottom: "16px" }}>Security</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SysRow label="Token Encryption" value="AES-256-GCM" />
              <SysRow label="OAuth Flow" value="Instagram Graph API" />
              <SysRow label="Password Storage" value="None (OAuth only)" />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          #admin-stats { grid-template-columns: repeat(2, 1fr) !important; }
          #admin-sysinfo { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SysRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
      <span style={{ color: "var(--gray)" }}>{label}</span>
      <span className="font-mono-label" style={{ color: "var(--red-bright)" }}>{value}</span>
    </div>
  );
}

