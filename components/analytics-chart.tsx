"use client";

import { useMemo } from "react";

type DataPoint = {
  date: string;
  views: number;
};

export function AnalyticsChart({ data }: { data: DataPoint[] }) {
  const maxViews = useMemo(() => Math.max(...data.map((d) => d.views), 1), [data]);

  if (data.length === 0) {
    return (
      <div style={{ height: "192px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray)", fontSize: "14px" }}>
        No analytics data yet. Share your blog to start collecting views.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "192px", alignItems: "flex-end", gap: "2px", overflowX: "auto" }}>
      {data.map((point, i) => {
        const height = (point.views / maxViews) * 100;
        return (
          <div
            key={i}
            style={{ position: "relative", flex: 1, minWidth: "8px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}
          >
            <div
              style={{
                width: "100%",
                borderRadius: "2px 2px 0 0",
                background: "var(--red-bright)",
                height: `${Math.max(height, 2)}%`,
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            />
          </div>
        );
      })}
    </div>
  );
}

