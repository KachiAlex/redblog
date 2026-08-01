"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface RescanButtonProps {
  username: string;
}

export function RescanButton({ username }: RescanButtonProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleRescan() {
    setScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/scan-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Rescan failed" });
      } else {
        setResult({
          success: true,
          message: `${data.postsSaved} posts found. ${data.videosHosted} videos hosted.`,
        });
        // Reload the page after a short delay to show new posts
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setScanning(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <button
        onClick={handleRescan}
        disabled={scanning}
        className="btn btn-ghost"
        style={{
          fontSize: "12px",
          padding: "8px 16px",
          opacity: scanning ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <RefreshCw
          style={{
            width: "13px",
            height: "13px",
            animation: scanning ? "spin 1s linear infinite" : "none",
          }}
        />
        {scanning ? "Scanning..." : "Rescan"}
      </button>

      {result?.success && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--red-bright)",
          }}
        >
          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
          {result.message} Reloading...
        </span>
      )}

      {result && !result.success && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--red-bright)",
          }}
        >
          <AlertCircle style={{ width: "14px", height: "14px" }} />
          {result.message}
        </span>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
