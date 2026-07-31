import Link from "next/link";

export function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(18,16,20,0.86)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
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
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "var(--red-bright)",
              display: "inline-block",
            }}
          />
          RedBlog
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            fontSize: "14.5px",
          }}
          className="hidden md:flex"
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
          <Link href="/scan" style={{ color: "var(--red-bright)", transition: "color 0.2s" }}>
            Scan a handle
          </Link>
          <Link href="/dashboard" className="btn btn-ghost">
            Log in
          </Link>
        </div>

        <Link href="/scan" className="btn btn-primary">
          Connect Instagram →
        </Link>
      </div>
    </nav>
  );
}

