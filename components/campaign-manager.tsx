"use client";

import { useState } from "react";
import { Sparkles, Trash2, RefreshCw, Check, X, Clock, ImageOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ScheduledPost = {
  id: string;
  caption: string;
  imagePrompt: string | null;
  imageFilePath: string | null;
  scheduledFor: string;
  status: string;
  error: string | null;
};

type Campaign = {
  id: string;
  context: string;
  cadence: string;
  tone: string | null;
  startDate: string;
  endDate: string;
  status: string;
  posts: ScheduledPost[];
};

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

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--gray)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  display: "block",
  marginBottom: "8px",
};

function statusColor(status: string) {
  switch (status) {
    case "published":
      return "#22c55e";
    case "scheduled":
      return "#0ea5e9";
    case "publishing":
      return "#f59e0b";
    case "failed":
      return "var(--red-bright)";
    case "canceled":
      return "var(--gray)";
    default:
      return "var(--gray)";
  }
}

export function CampaignManager({
  creatorId,
  igUsername,
  initialCampaigns,
}: {
  creatorId: string;
  igUsername: string;
  initialCampaigns: Campaign[];
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showWizard, setShowWizard] = useState(false);

  function handleCreated(campaign: Campaign) {
    setCampaigns((prev) => [campaign, ...prev]);
    setShowWizard(false);
  }

  function handleUpdated(updated: Campaign) {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDeleted(id: string) {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <span className="eyebrow">AI content studio</span>
          <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "32px", marginTop: "8px" }}>
            AI Studio
          </h1>
          <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
            GENERATE & SCHEDULE DAYS, WEEKS, OR MONTHS OF POSTS FROM A SINGLE BRIEF
          </span>
        </div>
        {!showWizard && (
          <button onClick={() => setShowWizard(true)} className="btn btn-primary">
            <Sparkles style={{ width: "14px", height: "14px" }} />
            New Campaign
          </button>
        )}
      </div>

      {showWizard && (
        <CampaignWizard
          creatorId={creatorId}
          igUsername={igUsername}
          onCreated={handleCreated}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {campaigns.length === 0 && !showWizard ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }} className="card-dark">
          <Sparkles style={{ width: "28px", height: "28px", color: "var(--red-bright)", marginBottom: "16px" }} />
          <h2 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "22px", marginBottom: "12px" }}>
            No campaigns yet.
          </h2>
          <p style={{ color: "var(--gray)", fontSize: "14px", marginBottom: "24px", maxWidth: "420px" }}>
            Describe what you want to post about and let AI draft a full week or month of
            captions and images for your feed.
          </p>
          <button onClick={() => setShowWizard(true)} className="btn btn-primary">
            <Sparkles style={{ width: "14px", height: "14px" }} />
            Start your first campaign
          </button>
        </div>
      ) : (
        campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        ))
      )}
    </div>
  );
}

function CampaignWizard({
  creatorId,
  igUsername,
  onCreated,
  onCancel,
}: {
  creatorId: string;
  igUsername: string;
  onCreated: (campaign: Campaign) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const inTwoWeeks = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [context, setContext] = useState("");
  const [cadence, setCadence] = useState("daily");
  const [tone, setTone] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(inTwoWeeks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!context.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, context, cadence, tone: tone || undefined, startDate, endDate }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated(data.campaign);
      } else {
        setError(data.error || "Failed to generate campaign");
      }
    } catch {
      setError("Failed to generate campaign. Please try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleGenerate} className="card-dark" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="font-serif-display" style={{ fontSize: "20px" }}>New Campaign</h2>
        <button type="button" onClick={onCancel} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}>
          <X style={{ width: "12px", height: "12px" }} /> Cancel
        </button>
      </div>

      <div>
        <label style={labelStyle}>What should these posts be about?</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Promote my new pottery collection launching this month, share behind-the-scenes studio content, and highlight customer testimonials..."
          rows={4}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Cadence</label>
          <select value={cadence} onChange={(e) => setCadence(e.target.value)} style={inputStyle}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tone (optional)</label>
          <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Playful, professional..." style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>End date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} required />
        </div>
      </div>

      {error && (
        <div style={{ border: "1px solid rgba(232,64,44,0.3)", background: "rgba(232,64,44,0.08)", borderRadius: "4px", padding: "12px 16px", fontSize: "13px", color: "var(--red-bright)" }} className="font-mono-label">
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button type="submit" disabled={loading || !context.trim()} className="btn btn-primary" style={{ opacity: loading || !context.trim() ? 0.6 : 1 }}>
          <Sparkles style={{ width: "14px", height: "14px" }} />
          {loading ? `Generating for @${igUsername}...` : "Generate Posts"}
        </button>
      </div>
    </form>
  );
}

function CampaignCard({
  campaign,
  onUpdated,
  onDeleted,
}: {
  campaign: Campaign;
  onUpdated: (campaign: Campaign) => void;
  onDeleted: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState(campaign.posts);

  function updatePost(post: ScheduledPost) {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
  }

  function removePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleApprove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled" }),
      });
      const data = await res.json();
      if (data.success) onUpdated(data.campaign);
    } catch {
      // no-op, user can retry
    }
    setBusy(false);
  }

  async function handleCancel() {
    if (!confirm("Cancel this campaign? Any draft or scheduled (unpublished) posts will be removed.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "canceled" }),
      });
      const data = await res.json();
      if (data.success) onUpdated(data.campaign);
    } catch {
      // no-op
    }
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this campaign permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) onDeleted(campaign.id);
    } catch {
      // no-op
    }
    setBusy(false);
  }

  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="card-dark" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span className="badge-dark" style={{ background: "rgba(232,64,44,0.15)", color: "var(--red-bright)" }}>
              ● {campaign.status.toUpperCase()}
            </span>
            <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", textTransform: "uppercase" }}>
              {campaign.cadence} · {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
            </span>
          </div>
          <p style={{ fontSize: "14px", marginTop: "10px", lineHeight: 1.5 }}>{campaign.context}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          {campaign.status === "draft" && draftCount > 0 && (
            <button onClick={handleApprove} disabled={busy} className="btn btn-primary" style={{ fontSize: "12px", padding: "8px 14px" }}>
              <Check style={{ width: "12px", height: "12px" }} /> Schedule All
            </button>
          )}
          {["draft", "scheduled"].includes(campaign.status) && (
            <button onClick={handleCancel} disabled={busy} className="btn btn-ghost" style={{ fontSize: "12px", padding: "8px 14px" }}>
              Cancel
            </button>
          )}
          <button onClick={handleDelete} disabled={busy} className="btn btn-ghost" style={{ fontSize: "12px", padding: "8px 14px", color: "var(--red-bright)" }}>
            <Trash2 style={{ width: "12px", height: "12px" }} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            editable={["draft", "scheduled"].includes(campaign.status) && ["draft", "scheduled"].includes(post.status)}
            onUpdated={updatePost}
            onDeleted={removePost}
          />
        ))}
      </div>
    </div>
  );
}

function PostCard({
  post,
  editable,
  onUpdated,
  onDeleted,
}: {
  post: ScheduledPost;
  editable: boolean;
  onUpdated: (post: ScheduledPost) => void;
  onDeleted: (id: string) => void;
}) {
  const [caption, setCaption] = useState(post.caption);
  const [scheduledFor, setScheduledFor] = useState(post.scheduledFor.slice(0, 16));
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/scheduled-posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, scheduledFor: new Date(scheduledFor).toISOString() }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdated(data.post);
        setDirty(false);
      }
    } catch {
      // no-op
    }
    setSaving(false);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/scheduled-posts/${post.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        onUpdated(data.post);
        setCaption(data.post.caption);
      }
    } catch {
      // no-op
    }
    setRegenerating(false);
  }

  async function handleDelete() {
    if (!confirm("Remove this post from the campaign?")) return;
    try {
      const res = await fetch(`/api/scheduled-posts/${post.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) onDeleted(post.id);
    } catch {
      // no-op
    }
  }

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ aspectRatio: "1", background: "var(--bg-raised)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {post.imageFilePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageFilePath} alt="Generated post" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ImageOff style={{ width: "24px", height: "24px", color: "var(--gray)" }} />
        )}
      </div>
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span className="badge-dark" style={{ background: "transparent", border: `1px solid ${statusColor(post.status)}`, color: statusColor(post.status), fontSize: "10px" }}>
            {post.status.toUpperCase()}
          </span>
          {editable && (
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={handleRegenerate} disabled={regenerating} title="Regenerate" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray)" }}>
                <RefreshCw style={{ width: "14px", height: "14px", animation: regenerating ? "spin 1s linear infinite" : "none" }} />
              </button>
              <button onClick={handleDelete} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red-bright)" }}>
                <Trash2 style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          )}
        </div>

        {editable ? (
          <textarea
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setDirty(true);
            }}
            rows={4}
            style={{ ...inputStyle, fontSize: "12px", resize: "vertical", fontFamily: "inherit", padding: "8px 10px" }}
          />
        ) : (
          <p style={{ fontSize: "12px", color: "var(--gray)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{caption}</p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock style={{ width: "12px", height: "12px", color: "var(--gray)" }} />
          {editable ? (
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => {
                setScheduledFor(e.target.value);
                setDirty(true);
              }}
              style={{ ...inputStyle, fontSize: "11px", padding: "6px 8px" }}
            />
          ) : (
            <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>
              {formatDate(post.scheduledFor)}
            </span>
          )}
        </div>

        {post.error && (
          <p style={{ fontSize: "11px", color: "var(--red-bright)" }}>{post.error}</p>
        )}

        {editable && dirty && (
          <button onClick={handleSave} disabled={saving} className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 10px", alignSelf: "flex-start" }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        )}
      </div>
    </div>
  );
}
