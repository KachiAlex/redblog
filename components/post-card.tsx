"use client";

import { useState, useRef } from "react";
import { Play, Video } from "lucide-react";
import Link from "next/link";
import { truncate, relativeTime } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    caption: string | null;
    thumbnailUrl: string | null;
    videoFilePath: string | null;
    videoUrl: string | null;
    permalink: string;
    publishedAt: string;
    embedTitle: string | null;
    tags: string[];
  };
  blogSlug: string;
}

export function PostCard({ post, blogSlug }: PostCardProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = post.videoFilePath || (post.videoUrl ? `/api/video-proxy/${post.id}` : null);

  function handlePlayClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPlaying(true);
    setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 100);
  }

  return (
    <article className="card-dark" style={{ overflow: "hidden", padding: 0 }}>
      {/* Thumbnail / Video preview */}
      <div style={{ position: "relative", aspectRatio: "9/16", overflow: "hidden", background: "var(--bg-raised)" }}>
        {playing && videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={post.thumbnailUrl || undefined}
            controls
            playsInline
            autoPlay
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : post.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnailUrl}
            alt={post.caption || "Instagram post"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
            <Play style={{ width: "40px", height: "40px", color: "var(--gray)" }} />
          </div>
        )}

        {/* Play overlay — click to play inline */}
        {!playing && videoSrc && (
          <button
            onClick={handlePlayClick}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            aria-label="Play video"
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease",
            }}>
              <Play style={{ width: "20px", height: "20px", color: "var(--paper)" }} />
            </div>
          </button>
        )}

        {/* Hosted badge */}
        {post.videoFilePath && (
          <span className="badge-dark" style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(232, 64, 44, 0.85)", color: "var(--paper)", backdropFilter: "blur(4px)" }}>
            <Video style={{ width: "10px", height: "10px" }} />
            Hosted
          </span>
        )}
      </div>

      {/* Post Info */}
      <div style={{ padding: "20px" }}>
        <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>
          {relativeTime(post.publishedAt)}
        </span>
        <h2 className="font-serif-display" style={{ fontSize: "16px", marginTop: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {post.embedTitle || (post.caption ? truncate(post.caption, 80) : "Untitled post")}
        </h2>
        {post.caption && (
          <p style={{ marginTop: "8px", fontSize: "13px", color: "#a9a396", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {truncate(post.caption, 150)}
          </p>
        )}
        {post.tags.length > 0 && (
          <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="font-mono-label" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "3px", background: "var(--bg-raised)", color: "var(--gray)", border: "1px solid var(--line)" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href={`/blog/${blogSlug}/${post.id}`}
            className="font-mono-label"
            style={{ fontSize: "12px", color: "var(--red-bright)", borderBottom: "1px solid var(--red-bright)", paddingBottom: "2px" }}
          >
            Read more
          </Link>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: "11px", padding: "4px 10px" }}
          >
            IG
          </a>
        </div>
      </div>
    </article>
  );
}
