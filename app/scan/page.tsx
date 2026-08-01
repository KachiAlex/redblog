"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Search, Instagram, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const [username, setUsername] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; detail?: string } | null>(null);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "oauth_callback") return;

      setConnecting(false);
      if (e.data.success) {
        setResult({ success: true });
        setTimeout(() => {
          window.location.href = "/dashboard?connected=1";
        }, 1200);
      } else {
        setResult({ success: false, error: e.data.error, detail: e.data.detail });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    sessionStorage.setItem("pending_scan_username", username.trim());
    setConnecting(true);
    setResult(null);

    const width = 550;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/login",
      "instagram_oauth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      setConnecting(false);
      setResult({ success: false, error: "popup_blocked", detail: "Please allow popups for this site to connect your Instagram." });
    }
  }

  return (
    <div>
      <Navbar />

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

          {!connecting && !result && (
            <form onSubmit={handleConnect} className="scan-form" style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
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
          )}

          {connecting && (
            <div
              style={{
                marginTop: "24px",
                padding: "32px",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                background: "var(--bg-raised)",
                textAlign: "center",
              }}
              className="card-dark"
            >
              <Loader2 style={{ width: "32px", height: "32px", color: "var(--red-bright)", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p className="font-mono-label" style={{ fontSize: "13px", color: "var(--red-bright)", marginBottom: "8px" }}>
                CONNECTING TO INSTAGRAM
              </p>
              <p style={{ fontSize: "14px", color: "var(--gray)", lineHeight: 1.5 }}>
                A popup window opened for you to authorize RedBlog.
                <br />
                Complete the authorization there — this page will update automatically.
              </p>
            </div>
          )}

          {result?.success && (
            <div
              style={{
                marginTop: "24px",
                padding: "32px",
                border: "1px solid rgba(232,64,44,0.3)",
                borderRadius: "6px",
                background: "rgba(232,64,44,0.08)",
                textAlign: "center",
              }}
            >
              <CheckCircle2 style={{ width: "32px", height: "32px", color: "var(--red-bright)", margin: "0 auto 16px" }} />
              <p className="font-mono-label" style={{ fontSize: "13px", color: "var(--red-bright)", marginBottom: "8px" }}>
                CONNECTED SUCCESSFULLY
              </p>
              <p style={{ fontSize: "14px", color: "var(--gray)" }}>
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {result && !result.success && (
            <div
              style={{
                marginTop: "24px",
                padding: "32px",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                background: "var(--bg-raised)",
                textAlign: "center",
              }}
              className="card-dark"
            >
              <AlertCircle style={{ width: "28px", height: "28px", color: "var(--red-bright)", margin: "0 auto 12px" }} />
              <p className="font-mono-label" style={{ fontSize: "13px", color: "var(--red-bright)", marginBottom: "8px" }}>
                CONNECTION FAILED
              </p>
              <p style={{ fontSize: "13px", color: "var(--gray)", marginBottom: "16px" }}>
                {result.detail || result.error || "Something went wrong. Please try again."}
              </p>
              <button
                onClick={() => { setResult(null); setConnecting(false); }}
                className="btn btn-ghost"
                style={{ fontSize: "13px" }}
              >
                <X style={{ width: "14px", height: "14px" }} />
                Try again
              </button>
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
              2. Click Connect — a popup opens with Instagram&apos;s official OAuth page
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .scan-form { flex-direction: column !important; }
          .scan-form button { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
