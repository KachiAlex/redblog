"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/theme", label: "Theme", icon: Palette },
  { href: "/dashboard/posts", label: "Posts", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          borderRight: "1px solid var(--line)",
          background: "var(--bg)",
          position: "sticky",
          top: 0,
          flexShrink: 0,
        }}
        className="dash-sidebar-desktop"
      >
        <div style={{ padding: "28px 24px" }}>
          <Link
            href="/"
            className="font-serif-display"
            style={{
              fontStyle: "italic",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <img
              src="/logo-mark.svg"
              alt="RedBlog"
              style={{ width: "18px", height: "25px" }}
            />
            RedBlog
          </Link>
        </div>

        <nav style={{ padding: "0 12px" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  marginBottom: "2px",
                  background: active ? "var(--bg-raised)" : "transparent",
                  color: active ? "var(--paper)" : "var(--gray)",
                  borderLeft: active
                    ? "2px solid var(--red-bright)"
                    : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <Icon style={{ width: "16px", height: "16px" }} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="dash-sidebar-mobile" style={{ display: "none" }}>
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "8px 4px",
                fontSize: "10px",
                color: active ? "var(--paper)" : "var(--gray)",
                flex: 1,
                borderTop: active ? "2px solid var(--red-bright)" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <Icon style={{ width: "18px", height: "18px" }} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <style>{`
        .dash-sidebar-desktop { display: block !important; }
        .dash-sidebar-mobile { display: none !important; }
        @media (max-width: 768px) {
          .dash-sidebar-desktop { display: none !important; }
          .dash-sidebar-mobile {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg);
            borderTop: 1px solid var(--line);
            zIndex: 50;
            paddingBottom: env(safe-area-inset-bottom, 0px);
          }
        }
      `}</style>
    </>
  );
}
