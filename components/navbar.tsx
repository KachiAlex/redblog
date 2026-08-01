"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(18,16,20,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        <Link
          href="/"
          className="font-serif-display"
          style={{
            fontStyle: "italic",
            fontSize: "22px",
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <img
            src="/logo-mark.svg"
            alt="RedBlog"
            style={{ width: "22px", height: "31px" }}
          />
          RedBlog
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            fontSize: "14.5px",
          }}
          className="nav-desktop-links"
        >
          <Link href="/#process" style={{ color: "var(--gray)", transition: "color 0.2s" }}>
            How it works
          </Link>
          <Link href="/#example" style={{ color: "var(--gray)", transition: "color 0.2s" }}>
            Example
          </Link>
          <Link href="/#pricing" style={{ color: "var(--gray)", transition: "color 0.2s" }}>
            Pricing
          </Link>
          <Link href="/blog" style={{ color: "var(--gray)", transition: "color 0.2s" }}>
            Explore
          </Link>
          <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: "13px", padding: "8px 16px" }}>
            Log in
          </Link>
          <Link href="/scan" className="btn btn-primary" style={{ fontSize: "13px", padding: "8px 16px" }}>
            Connect Instagram →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="nav-mobile-toggle"
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            padding: "8px",
            color: "var(--paper)",
            cursor: "pointer",
            display: "none",
          }}
        >
          {open ? <X style={{ width: "18px", height: "18px" }} /> : <Menu style={{ width: "18px", height: "18px" }} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="nav-mobile-menu"
          style={{
            borderTop: "1px solid var(--line)",
            background: "var(--bg)",
            padding: "16px 0",
          }}
        >
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Link href="/#process" onClick={() => setOpen(false)} style={{ padding: "12px 0", fontSize: "15px", color: "var(--gray)", borderBottom: "1px solid var(--line)" }}>
              How it works
            </Link>
            <Link href="/#example" onClick={() => setOpen(false)} style={{ padding: "12px 0", fontSize: "15px", color: "var(--gray)", borderBottom: "1px solid var(--line)" }}>
              Example
            </Link>
            <Link href="/#pricing" onClick={() => setOpen(false)} style={{ padding: "12px 0", fontSize: "15px", color: "var(--gray)", borderBottom: "1px solid var(--line)" }}>
              Pricing
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} style={{ padding: "12px 0", fontSize: "15px", color: "var(--gray)", borderBottom: "1px solid var(--line)" }}>
              Explore
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)} style={{ padding: "12px 0", fontSize: "15px", color: "var(--gray)", borderBottom: "1px solid var(--line)" }}>
              Dashboard
            </Link>
            <Link href="/scan" onClick={() => setOpen(false)} className="btn btn-primary" style={{ marginTop: "12px", justifyContent: "center" }}>
              Connect Instagram →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .nav-desktop-links { display: flex !important; }
        .nav-mobile-toggle { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-toggle { display: flex !important; align-items: center; }
        }
      `}</style>
    </nav>
  );
}

