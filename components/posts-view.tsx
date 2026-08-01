"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, ExternalLink, Film, LayoutGrid, List, Video, Images } from "lucide-react";
import { formatDate, relativeTime, truncate } from "@/lib/utils";

interface PostData {
  id: string;
  caption: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  permalink: string;
  mediaType: string;
  publishedAt: string;
  embedHtml: string | null;
}

interface PostsViewProps {
  posts: PostData[];
  blogSlug?: string;
}

export function PostsView({ posts, blogSlug }: PostsViewProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <>
      {/* View toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
          {posts.length} POST(S)
        </span>
        <div style={{ display: "flex", gap: "4px", border: "1px solid var(--line)", borderRadius: "4px", padding: "2px" }}>
          <button
            onClick={() => setView("grid")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "3px",
              border: "none",
              cursor: "pointer",
              background: view === "grid" ? "var(--bg-raised)" : "transparent",
              color: view === "grid" ? "var(--paper)" : "var(--gray)",
              transition: "all 0.15s",
            }}
          >
            <LayoutGrid style={{ width: "14px", height: "14px" }} />
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "3px",
              border: "none",
              cursor: "pointer",
              background: view === "list" ? "var(--bg-raised)" : "transparent",
              color: view === "list" ? "var(--paper)" : "var(--gray)",
              transition: "all 0.15s",
            }}
          >
            <List style={{ width: "14px", height: "14px" }} />
            List
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div id="posts-grid-view" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              className="card-dark post-grid-card"
              style={{
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
            >
              <Link
                href={blogSlug ? `/blog/${blogSlug}/${post.id}` : "#"}
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
              >
                {/* Thumbnail */}
                <div style={{
                  position: "relative",
                  aspectRatio: "9/16",
                  background: "var(--bg)",
                  overflow: "hidden",
                }}>
                  {post.thumbnailUrl || post.videoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnailUrl || post.videoUrl || undefined}
                      alt={post.caption ? truncate(post.caption, 40) : "Instagram post"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Play style={{ width: "24px", height: "24px", color: "var(--gray)" }} />
                    </div>
                  )}
                  {/* Type badge */}
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.7)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    {post.mediaType === "VIDEO" ? (
                      <Video style={{ width: "12px", height: "12px", color: "var(--paper)" }} />
                    ) : (
                      <Images style={{ width: "12px", height: "12px", color: "var(--paper)" }} />
                    )}
                  </div>
                  {/* Hover overlay */}
                  <div className="post-grid-overlay" style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "12px",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                  }}>
                    <p style={{ fontSize: "12px", color: "var(--paper)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {post.caption ? truncate(post.caption, 80) : "Untitled post"}
                    </p>
                    <span className="font-mono-label" style={{ fontSize: "10px", color: "var(--gray)", marginTop: "4px" }}>
                      {relativeTime(new Date(post.publishedAt))}
                    </span>
                  </div>
                </div>
                {/* Footer */}
                <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="font-mono-label" style={{ fontSize: "10px", color: "var(--gray)" }}>
                    {formatDate(new Date(post.publishedAt))}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {blogSlug && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "var(--gray)" }}>
                        <Film style={{ width: "10px", height: "10px" }} />
                      </span>
                    )}
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "flex", alignItems: "center", color: "var(--gray)" }}
                    >
                      <ExternalLink style={{ width: "10px", height: "10px" }} />
                    </a>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* List view (table) */}
      {view === "list" && (
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
                {posts.map((post) => (
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
                            {relativeTime(new Date(post.publishedAt))}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span className="badge-dark" style={{ background: "var(--bg-raised)", color: "var(--gray)" }}>
                        {post.mediaType === "VIDEO" ? "Video" : post.mediaType === "CAROUSEL_ALBUM" ? "Carousel" : "Image"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                        {formatDate(new Date(post.publishedAt))}
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
                        {blogSlug && (
                          <Link
                            href={`/blog/${blogSlug}/${post.id}`}
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
      )}

      <style>{`
        .post-grid-card:hover {
          transform: translateY(-4px);
          border-color: var(--red-bright) !important;
        }
        .post-grid-card:hover img {
          transform: scale(1.05);
        }
        .post-grid-card:hover .post-grid-overlay {
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          #posts-grid-view {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          #posts-grid-view {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </>
  );
}
