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
      className="hidden md:block"
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
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--red-bright)",
              display: "inline-block",
            }}
          />
          Handle
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
  );
}
