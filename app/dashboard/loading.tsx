import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflowX: "hidden" }}>
        <div className="wrap" style={{ padding: "32px 0" }}>
          <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="skeleton-dark" style={{ height: "56px", width: "56px", borderRadius: "12px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="skeleton-dark" style={{ height: "24px", width: "160px" }} />
              <div className="skeleton-dark" style={{ height: "16px", width: "112px" }} />
            </div>
          </div>
          <div style={{ marginBottom: "32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-dark" style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="skeleton-dark" style={{ height: "16px", width: "80px" }} />
                    <div className="skeleton-dark" style={{ height: "32px", width: "64px" }} />
                  </div>
                  <div className="skeleton-dark" style={{ height: "48px", width: "48px", borderRadius: "12px" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="card-dark" style={{ overflow: "hidden" }}>
            <div style={{ borderBottom: "1px solid var(--line)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="skeleton-dark" style={{ height: "20px", width: "128px" }} />
              <div className="skeleton-dark" style={{ height: "16px", width: "192px" }} />
            </div>
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
                  <div className="skeleton-dark" style={{ height: "64px", width: "64px", borderRadius: "8px" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="skeleton-dark" style={{ height: "16px", width: "75%" }} />
                    <div className="skeleton-dark" style={{ height: "12px", width: "25%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

