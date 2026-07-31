"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Search, Loader2, AlertCircle, CheckCircle2, Video } from "lucide-react";
import Link from "next/link";

interface ScanResult {
  success: boolean;
  username?: string;
  fullName?: string;
  profilePic?: string;
  blogSlug?: string;
  postsFound?: number;
  postsCreated?: number;
  videosDownloaded?: number;
  videosFailed?: number;
  message?: string;
  error?: string;
}

export default function ScanPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />

      {/* Hero / Input */}
      <header style={{ padding: "80px 0 48px", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ maxWidth: "640px", textAlign: "center", margin: "0 auto" }}>
          <span className="eyebrow">Scan any handle</span>
          <h1
            className="font-serif-display"
            style={{
              fontStyle: "italic",
              fontSize: "clamp(36px, 5vw, 52px)",
              marginTop: "14px",
              lineHeight: 1.1,
            }}
          >
            Enter an Instagram handle,
            <br />
            get a video blog.
          </h1>
          <p
            style={{
              color: "var(--gray)",
              fontSize: "16px",
              lineHeight: 1.65,
              marginTop: "16px",
              marginBottom: "36px",
            }}
          >
            Type any public Instagram username below. RedBlog scans their
            content, extracts every video, downloads them, and publishes each
            as a playable blog post — hosted on our platform.
          </p>

          <form onSubmit={handleScan} style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--bg-raised)", border: "1px solid var(--line)", borderRadius: "4px", padding: "0 16px" }}>
              <span className="font-mono-label" style={{ fontSize: "15px", color: "var(--gray)" }}>@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                disabled={loading}
                className="font-mono-label"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--paper)",
                  fontSize: "15px",
                  padding: "14px 8px",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="btn btn-primary"
              style={{ padding: "14px 24px", opacity: loading || !username.trim() ? 0.5 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search style={{ width: "16px", height: "16px" }} />
                  Scan
                </>
              )}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px 20px",
                border: "1px solid var(--red-bright)",
                borderRadius: "4px",
                background: "rgba(232, 64, 44, 0.08)",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                textAlign: "left",
              }}
            >
              <AlertCircle style={{ width: "18px", height: "18px", color: "var(--red-bright)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <span className="font-mono-label" style={{ fontSize: "13px", color: "var(--red-bright)" }}>SCAN FAILED</span>
                <p style={{ fontSize: "14px", color: "var(--paper)", marginTop: "4px", lineHeight: 1.5 }}>{error}</p>
              </div>
            </div>
          )}

          {result && result.success && (
            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                background: "var(--bg-raised)",
                textAlign: "left",
              }}
              className="card-dark"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <CheckCircle2 style={{ width: "22px", height: "22px", color: "var(--red-bright)" }} />
                <span className="font-mono-label" style={{ fontSize: "13px", color: "var(--red-bright)" }}>SCAN COMPLETE</span>
              </div>

              {result.profilePic && (
                <img
                  src={result.profilePic}
                  alt={result.username}
                  style={{ width: "56px", height: "56px", borderRadius: "50%", marginBottom: "16px", objectFit: "cover" }}
                />
              )}

              <h3 className="font-serif-display" style={{ fontSize: "24px", marginBottom: "4px" }}>
                {result.fullName || `@${result.username}`}
              </h3>
              <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                @{result.username}
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "24px" }}>
                <Stat label="Posts Found" value={result.postsFound || 0} />
                <Stat label="Blog Posts Created" value={result.postsCreated || 0} />
                <Stat label="Videos Hosted" value={result.videosDownloaded || 0} />
              </div>

              {result.videosFailed ? (
                <p style={{ fontSize: "12px", color: "var(--gray)", marginTop: "16px" }}>
                  {result.videosFailed} video(s) could not be downloaded — they may be private or restricted.
                </p>
              ) : null}

              {result.blogSlug && (result.postsCreated || 0) > 0 && (
                <Link
                  href={`/blog/${result.blogSlug}`}
                  className="btn btn-primary"
                  style={{ marginTop: "24px" }}
                >
                  <Video style={{ width: "16px", height: "16px" }} />
                  View the blog →
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* How it works */}
      <section style={{ padding: "80px 0" }}>
        <div className="wrap">
          <div style={{ maxWidth: "560px", marginBottom: "48px" }}>
            <span className="eyebrow">How it works</span>
            <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "32px", marginTop: "12px" }}>
              Three steps, no login required.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              background: "var(--line)",
              border: "1px solid var(--line)",
            }}
            className="scan-steps-grid"
          >
            <Step
              num="01 — INPUT"
              title="Enter any handle"
              desc="Type any public Instagram username. No login, no OAuth, no authentication needed — just the handle."
            />
            <Step
              num="02 — EXTRACT"
              title="Videos are scanned"
              desc="RedBlog scans the profile, identifies every video post, and extracts the direct video URLs from each."
            />
            <Step
              num="03 — HOST"
              title="Videos are downloaded"
              desc="Each video file is downloaded and stored on our platform. The blog post plays the video natively — no embeds, no link-outs."
            />
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .scan-steps-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-serif-display" style={{ fontSize: "28px" }}>{value}</div>
      <span className="font-mono-label" style={{ fontSize: "10.5px", color: "var(--gray)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ background: "var(--bg)", padding: "32px 28px" }}>
      <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--red-bright)", letterSpacing: "0.06em", display: "block", marginBottom: "18px" }}>{num}</span>
      <h3 className="font-serif-display" style={{ fontSize: "20px", marginBottom: "10px" }}>{title}</h3>
      <p style={{ color: "#a9a396", fontSize: "14px", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
