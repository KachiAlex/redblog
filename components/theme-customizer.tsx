"use client";

import { useState } from "react";
import { Check, Eye, Save, Play, Video, Images } from "lucide-react";
import Link from "next/link";

type BlogSettings = {
  slug: string;
  themePrimary: string;
  themeAccent: string;
  themeLayout: string;
  title: string | null;
  bio: string | null;
};

type PreviewPost = {
  id: string;
  caption: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  mediaType: string;
  permalink: string;
};

export function ThemeCustomizer({
  creatorId,
  igUsername,
  posts,
  initialSettings,
}: {
  creatorId: string;
  igUsername: string;
  posts: PreviewPost[];
  initialSettings: BlogSettings;
}) {
  const [settings, setSettings] = useState<BlogSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/blog-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          themePrimary: settings.themePrimary,
          themeAccent: settings.themeAccent,
          themeLayout: settings.themeLayout,
          title: settings.title,
          bio: settings.bio,
          slug: settings.slug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || "Save failed");
      }
    } catch {
      setError("Save failed. Please try again.");
    }
    setSaving(false);
  }

  const presets = [
    { name: "Sunset", primary: "#ec4899", accent: "#f97316" },
    { name: "Ocean", primary: "#0ea5e9", accent: "#06b6d4" },
    { name: "Forest", primary: "#10b981", accent: "#84cc16" },
    { name: "Royal", primary: "#8b5cf6", accent: "#6366f1" },
    { name: "Crimson", primary: "#ef4444", accent: "#f59e0b" },
    { name: "Mono", primary: "#1e293b", accent: "#64748b" },
  ];

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-raised)",
    border: "1px solid var(--line)",
    borderRadius: "4px",
    padding: "10px 14px",
    color: "var(--paper)",
    fontSize: "14px",
    fontFamily: "var(--font-mono)",
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <span className="eyebrow">Customization</span>
          <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "32px", marginTop: "8px" }}>
            Theme & Customization
          </h1>
          <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
            MAKE YOUR ARCHIVE YOURS. COLORS, LAYOUT, BRANDING.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href={`/blog/${settings.slug}`} className="btn btn-ghost">
            <Eye style={{ width: "14px", height: "14px" }} />
            Preview
          </Link>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ border: "1px solid rgba(232,64,44,0.3)", background: "rgba(232,64,44,0.08)", borderRadius: "4px", padding: "12px 16px", fontSize: "13px", color: "var(--red-bright)" }} className="font-mono-label">
          {error}
        </div>
      )}

      {/* Color Presets */}
      <div className="card-dark" style={{ padding: "24px" }}>
        <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Color Presets</h2>
        <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>Quick-start with a curated palette</span>
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }} id="preset-grid">
          {presets.map((preset) => {
            const active = settings.themePrimary === preset.primary && settings.themeAccent === preset.accent;
            return (
              <button
                key={preset.name}
                onClick={() => setSettings((s) => ({ ...s, themePrimary: preset.primary, themeAccent: preset.accent }))}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "6px",
                  border: active ? "2px solid var(--red-bright)" : "2px solid var(--line)",
                  padding: "12px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  background: "var(--bg-raised)",
                }}
              >
                <div style={{ height: "40px", width: "100%", borderRadius: "4px", background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }} />
                <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", marginTop: "8px", display: "block" }}>{preset.name}</span>
                {active && (
                  <div style={{ position: "absolute", top: "6px", right: "6px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--red-bright)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check style={{ width: "10px", height: "10px", color: "var(--paper)" }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="card-dark" style={{ padding: "24px" }}>
        <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Custom Colors</h2>
        <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>Fine-tune your brand colors</span>
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
          <div>
            <label className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Primary Color</label>
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
              <input type="color" value={settings.themePrimary} onChange={(e) => setSettings((s) => ({ ...s, themePrimary: e.target.value }))} style={{ height: "40px", width: "56px", cursor: "pointer", borderRadius: "4px", border: "1px solid var(--line)", background: "transparent" }} />
              <input type="text" value={settings.themePrimary} onChange={(e) => setSettings((s) => ({ ...s, themePrimary: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Accent Color</label>
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
              <input type="color" value={settings.themeAccent} onChange={(e) => setSettings((s) => ({ ...s, themeAccent: e.target.value }))} style={{ height: "40px", width: "56px", cursor: "pointer", borderRadius: "4px", border: "1px solid var(--line)", background: "transparent" }} />
              <input type="text" value={settings.themeAccent} onChange={(e) => setSettings((s) => ({ ...s, themeAccent: e.target.value }))} style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="card-dark" style={{ padding: "24px" }}>
        <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Layout</h2>
        <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>Choose how your posts are displayed</span>
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} id="layout-grid">
          {[
            { id: "grid", name: "Grid", desc: "3-column card layout" },
            { id: "list", name: "List", desc: "Single-column feed" },
            { id: "masonry", name: "Masonry", desc: "Pinterest-style" },
          ].map((layout) => {
            const active = settings.themeLayout === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => setSettings((s) => ({ ...s, themeLayout: layout.id }))}
                style={{
                  borderRadius: "6px",
                  border: active ? "2px solid var(--red-bright)" : "2px solid var(--line)",
                  padding: "16px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  background: "var(--bg-raised)",
                }}
              >
                <div style={{ marginBottom: "12px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", background: "var(--bg)" }}>
                  {layout.id === "grid" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px" }}>
                      <div style={{ height: "28px", width: "20px", borderRadius: "2px", background: "var(--gray)" }} />
                      <div style={{ height: "28px", width: "20px", borderRadius: "2px", background: "var(--gray)" }} />
                      <div style={{ height: "28px", width: "20px", borderRadius: "2px", background: "var(--gray)" }} />
                    </div>
                  )}
                  {layout.id === "list" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ height: "10px", width: "72px", borderRadius: "2px", background: "var(--gray)" }} />
                      <div style={{ height: "10px", width: "72px", borderRadius: "2px", background: "var(--gray)" }} />
                      <div style={{ height: "10px", width: "72px", borderRadius: "2px", background: "var(--gray)" }} />
                    </div>
                  )}
                  {layout.id === "masonry" && (
                    <div style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
                      <div style={{ height: "40px", width: "20px", borderRadius: "2px", background: "var(--gray)" }} />
                      <div style={{ height: "28px", width: "20px", borderRadius: "2px", background: "var(--gray)" }} />
                      <div style={{ height: "34px", width: "20px", borderRadius: "2px", background: "var(--gray)" }} />
                    </div>
                  )}
                </div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{layout.name}</p>
                <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>{layout.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blog Info */}
      <div className="card-dark" style={{ padding: "24px" }}>
        <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Blog Information</h2>
        <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>Customize your blog&apos;s identity</span>
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Blog URL Slug</label>
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="font-mono-label" style={{ fontSize: "14px", color: "var(--gray)" }}>redblog.app/</span>
              <input type="text" value={settings.slug} onChange={(e) => setSettings((s) => ({ ...s, slug: e.target.value }))} style={inputStyle} placeholder="yourhandle" />
            </div>
          </div>
          <div>
            <label className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Blog Title</label>
            <input type="text" value={settings.title || ""} onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))} style={{ ...inputStyle, marginTop: "8px" }} placeholder="My Reel Blog" />
          </div>
          <div>
            <label className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bio</label>
            <textarea value={settings.bio || ""} onChange={(e) => setSettings((s) => ({ ...s, bio: e.target.value }))} rows={3} style={{ ...inputStyle, marginTop: "8px", resize: "none", fontFamily: "var(--font-sans)" }} placeholder="A short description of your blog..." />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="card-dark" style={{ overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid var(--line)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 className="font-serif-display" style={{ fontSize: "20px" }}>Live Preview</h2>
          <Link href={`/blog/${settings.slug}`} className="btn btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>
            <Eye style={{ width: "12px", height: "12px" }} />
            Open full page
          </Link>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)", background: "var(--bg)" }}>
            {/* Simulated blog header */}
            <div style={{ padding: "24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--paper)",
                  fontFamily: "var(--font-serif)",
                  background: `linear-gradient(135deg, ${settings.themePrimary}, ${settings.themeAccent})`,
                  flexShrink: 0,
                }}
              >
                {igUsername.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="font-serif-display" style={{ fontSize: "20px", fontStyle: "italic" }}>
                  {settings.title || `@${igUsername}`}
                </h3>
                {settings.bio ? (
                  <p style={{ fontSize: "13px", color: "var(--gray)", marginTop: "4px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                    {settings.bio}
                  </p>
                ) : (
                  <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
                    {posts.length} POSTS
                  </span>
                )}
              </div>
            </div>

            {/* Simulated posts grid */}
            <div style={{ padding: "16px" }}>
              {posts.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--gray)", fontSize: "13px" }}>
                  No posts synced yet. Connect your Instagram to populate your blog.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {posts.slice(0, 6).map((post) => (
                    <div key={post.id} style={{ position: "relative", aspectRatio: "9/16", borderRadius: "6px", overflow: "hidden", background: "var(--bg-raised)" }}>
                      {post.thumbnailUrl || post.videoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.thumbnailUrl || post.videoUrl || undefined}
                          alt={post.caption || "Post"}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                          <Play style={{ width: "20px", height: "20px", color: "var(--gray)" }} />
                        </div>
                      )}
                      {/* Type badge */}
                      <div style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        background: "rgba(0,0,0,0.7)",
                        borderRadius: "3px",
                        padding: "3px 6px",
                        display: "flex",
                        alignItems: "center",
                      }}>
                        {post.mediaType === "VIDEO" ? (
                          <Video style={{ width: "10px", height: "10px", color: "var(--paper)" }} />
                        ) : (
                          <Images style={{ width: "10px", height: "10px", color: "var(--paper)" }} />
                        )}
                      </div>
                      {/* Play overlay for videos */}
                      {post.mediaType === "VIDEO" && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "rgba(232,64,44,0.85)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <Play style={{ width: "14px", height: "14px", color: "white", fill: "white" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #preset-grid { grid-template-columns: repeat(3, 1fr) !important; }
          #layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

