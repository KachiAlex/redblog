"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export function DisconnectButton({ creatorId }: { creatorId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDisconnect() {
    if (!confirm("Are you sure? This will permanently delete your account, tokens, and blog page.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId }),
      });
      const data = await res.json();

      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Failed to disconnect");
      }
    } catch {
      setError("Failed to disconnect. Please try again.");
    }

    setLoading(false);
  }

  return (
    <>
      {error && (
        <p style={{ fontSize: "12px", color: "var(--red-bright)", marginTop: "8px" }}>
          {error}
        </p>
      )}
      <button
        onClick={handleDisconnect}
        disabled={loading}
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
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          transition: "all 0.2s",
        }}
      >
        <LogOut style={{ width: "14px", height: "14px" }} />
        {loading ? "Disconnecting..." : "Disconnect"}
      </button>
    </>
  );
}
