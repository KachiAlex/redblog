"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, ExternalLink, Play } from "lucide-react";
import { formatDate, relativeTime, truncate } from "@/lib/utils";

type CreatorData = {
  id: string;
  igUsername: string;
  igProfilePic: string | null;
  connectedAt: string;
  blogPage: { slug: string } | null;
  posts: {
    id: string;
    caption: string | null;
    thumbnailUrl: string | null;
    permalink: string;
    publishedAt: string;
  }[];
  _count: { posts: number };
};

export function DashboardContent({ creators }: { creators: CreatorData[] }) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const creator = creators[0];

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: creator.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(
          data.newPosts > 0
            ? `Synced. ${data.newPosts} new post(s) developed.`
            : "Synced. No new posts found."
        );
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setSyncResult("Sync failed. Please try again.");
      }
    } catch {
      setSyncResult("Sync failed. Please try again.");
    }
    setSyncing(false);
  }

  const totalPosts = creator._count.posts;
  const blogUrl = creator.blogPage
    ? `/blog/${creator.blogPage.slug}`
    : null;

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }} id="dash-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--red), var(--red-bright))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 600,
              color: "var(--paper)",
              fontFamily: "var(--font-serif)",
              flexShrink: 0,
            }}
          >
            {creator.igUsername.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif-display" style={{ fontSize: "28px", fontStyle: "italic" }}>
              @{creator.igUsername}
            </h1>
            <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)", letterSpacing: "0.04em" }}>
              CONNECTED {formatDate(creator.connectedAt).toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-ghost"
            style={{ opacity: syncing ? 0.5 : 1 }}
          >
            <RefreshCw style={{ width: "14px", height: "14px", animation: syncing ? "spin 1s linear infinite" : "none" }} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
          {blogUrl && (
            <Link href={blogUrl} className="btn btn-primary">
              <ExternalLink style={{ width: "14px", height: "14px" }} />
              View Archive
            </Link>
          )}
        </div>
      </div>

      {syncResult && (
        <div
          style={{
            marginBottom: "24px",
            border: "1px solid var(--line)",
            background: "var(--bg-raised)",
            borderRadius: "4px",
            padding: "12px 16px",
            fontSize: "13px",
            color: "var(--red-bright)",
          }}
          className="font-mono-label"
        >
          {syncResult}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ marginBottom: "32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} id="stats-grid">
        <div className="card-dark" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Posts</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px" }}>{totalPosts}</p>
            </div>
          </div>
        </div>
        <div className="card-dark" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Blog Views</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px", color: "var(--gray)" }}>—</p>
            </div>
          </div>
        </div>
        <div className="card-dark" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Engagement</span>
              <p className="font-serif-display" style={{ fontSize: "32px", marginTop: "4px", color: "var(--gray)" }}>—</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card-dark" style={{ overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid var(--line)", padding: "16px 24px" }}>
          <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Recent Posts</h2>
          <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
            Your latest synced Instagram content
          </span>
        </div>
        <div>
          {creator.posts.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--gray)", fontSize: "14px" }}>
              No posts yet. Click &quot;Sync Now&quot; to fetch your latest content.
            </div>
          ) : (
            creator.posts.map((post) => (
              <div
                key={post.id}
                style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--line)", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    flexShrink: 0,
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "var(--bg-raised)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {post.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Play style={{ width: "18px", height: "18px", color: "var(--gray)" }} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {post.caption ? truncate(post.caption, 60) : "Untitled post"}
                  </p>
                  <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", display: "block", marginTop: "2px" }}>
                    {relativeTime(post.publishedAt)}
                  </span>
                </div>
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
            ))
          )}
        </div>
        {creator.posts.length > 0 && (
          <div style={{ borderTop: "1px solid var(--line)", padding: "12px 24px", textAlign: "center" }}>
            <Link
              href="/dashboard/posts"
              className="font-mono-label"
              style={{ fontSize: "12px", color: "var(--red-bright)", borderBottom: "1px solid var(--red-bright)", paddingBottom: "2px" }}
            >
              View all posts →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          #stats-grid { grid-template-columns: 1fr !important; }
          #dash-header { flex-direction: column !important; }
        }
      `}</style>
    </>
  );
}

