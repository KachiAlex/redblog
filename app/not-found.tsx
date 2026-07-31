import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "32px",
      }}
    >
      <span className="eyebrow" style={{ marginBottom: "16px" }}>
        Error 404
      </span>
      <h1
        className="font-serif-display"
        style={{
          fontStyle: "italic",
          fontSize: "clamp(48px, 8vw, 80px)",
          lineHeight: 1,
          marginBottom: "16px",
        }}
      >
        Out of <em style={{ color: "var(--red-bright)" }}>frame</em>.
      </h1>
      <p
        style={{
          color: "var(--gray)",
          fontSize: "15px",
          maxWidth: "380px",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: "32px",
        }}
      >
        This page never made it to the contact sheet. It may have been moved,
        deleted, or never exposed in the first place.
      </p>
      <Link href="/" className="btn btn-primary">
        ← Back to RedBlog
      </Link>
    </div>
  );
}

