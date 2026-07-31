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
        <span
          className="font-mono-label"
          style={{ fontSize: "11px", color: "var(--gray)", letterSpacing: "0.04em" }}
        >
          BUILT ON THE OFFICIAL INSTAGRAM GRAPH API — NO SCRAPING, NO REHOSTING
        </span>
      </div>
    </footer>
  );
}

