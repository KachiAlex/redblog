"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Search, Instagram } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    sessionStorage.setItem("pending_scan_username", username.trim());
    setSubmitted(true);
    window.location.href = "/api/auth/login";
  }

  return (
    <div>
      <Navbar />

      {/* Hero / Input */}
      <header style={{ padding: "80px 0 48px", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ maxWidth: "640px", textAlign: "center", margin: "0 auto" }}>
          <span className="eyebrow">Connect your Instagram</span>
          <h1
            className="font-serif-display"
            style={{
              fontStyle: "italic",
              fontSize: "clamp(36px, 5vw, 52px)",
              marginTop: "14px",
              lineHeight: 1.1,
            }}
          >
            Connect your Instagram,
            <br />
            get your video blog.
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
            Enter your Instagram handle, authorize RedBlog via Instagram&apos;s
            official API, and we&apos;ll turn your Reels into a permanent,
            searchable blog — fully compliant, no scraping.
          </p>

          {!submitted ? (
            <form onSubmit={handleConnect} style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--bg-raised)", border: "1px solid var(--line)", borderRadius: "4px", padding: "0 16px" }}>
                <span className="font-mono-label" style={{ fontSize: "15px", color: "var(--gray)" }}>@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
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
                disabled={!username.trim()}
                className="btn btn-primary"
                style={{ padding: "14px 24px", opacity: !username.trim() ? 0.5 : 1 }}
              >
                <Instagram style={{ width: "16px", height: "16px" }} />
                Connect &amp; Scan →
              </button>
            </form>
          ) : (
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
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Search style={{ width: "20px", height: "20px", color: "var(--red-bright)" }} />
                <span className="font-mono-label" style={{ fontSize: "13px", color: "var(--red-bright)" }}>REDIRECTING TO INSTAGRAM</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--paper)", lineHeight: 1.5 }}>
                You&apos;re being redirected to Instagram to authorize RedBlog.
                After you approve, we&apos;ll automatically fetch your Reels and
                create your blog.
              </p>
              <p style={{ fontSize: "12px", color: "var(--gray)", marginTop: "12px" }}>
                If nothing happens, <a href="/api/auth/login" style={{ color: "var(--red-bright)", textDecoration: "underline" }}>click here</a>.
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: "32px",
              padding: "16px 20px",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              background: "var(--bg-raised)",
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--gray)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--paper)" }}>How it works:</strong>
              <br />
              1. Enter your Instagram handle above
              <br />
              2. Click Connect — you&apos;ll be redirected to Instagram&apos;s official OAuth page
              <br />
              3. Authorize RedBlog to access your media
              <br />
              4. We fetch your Reels via the Graph API and create your blog
            </p>
          </div>

          <div
            className="font-mono-label"
            style={{
              fontSize: "11.5px",
              color: "var(--gray)",
              letterSpacing: "0.04em",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "24px",
            }}
          >
            <span>OFFICIAL INSTAGRAM API</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>READ-ONLY ACCESS</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>NO PASSWORDS STORED</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>FULLY COMPLIANT</span>
          </div>
        </div>
      </header>

      {/* Already connected? */}
      <section style={{ padding: "60px 0" }}>
        <div className="wrap" style={{ maxWidth: "640px", textAlign: "center" }}>
          <span className="eyebrow">Already connected?</span>
          <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "28px", marginTop: "12px", marginBottom: "20px" }}>
            View your blog or dashboard.
          </h2>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn btn-ghost">
              Go to Dashboard →
            </Link>
            <Link href="/blog" className="btn btn-ghost">
              Browse Blogs →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
