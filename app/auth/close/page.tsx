"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ClosePopupContent() {
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const error = params.get("error");
  const detail = params.get("detail");

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        { type: "oauth_callback", success, error, detail },
        window.location.origin
      );
      setTimeout(() => window.close(), 100);
    } else {
      window.location.href = success ? "/dashboard?connected=1" : `/?error=${error || "unknown"}`;
    }
  }, [success, error, detail]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)", color: "var(--paper)", fontFamily: "var(--font-mono)" }}>
      <div style={{ textAlign: "center" }}>
        {success ? (
          <>
            <div style={{ width: "40px", height: "40px", border: "3px solid var(--red-bright)", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: "14px", color: "var(--gray)" }}>Connection successful. Closing...</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: "14px", color: "var(--red-bright)", marginBottom: "8px" }}>Connection failed</p>
            {detail && <p style={{ fontSize: "12px", color: "var(--gray)" }}>{detail}</p>}
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function ClosePopupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <ClosePopupContent />
    </Suspense>
  );
}
