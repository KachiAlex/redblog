import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "40px 0" }}>
      <div
        className="wrap"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          className="font-serif-display"
          style={{ fontStyle: "italic", fontSize: "16px" }}
        >
          RedBlog
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <Link href="/privacy" className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>
            Privacy
          </Link>
          <Link href="/terms" className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>
            Terms
          </Link>
          <span
            className="font-mono-label"
            style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.04em" }}
          >
            INSTAGRAM ARCHIVE PLATFORM
          </span>
        </div>
      </div>
    </footer>
  );
}

