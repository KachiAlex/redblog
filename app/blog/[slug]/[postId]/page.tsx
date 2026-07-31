import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, truncate } from "@/lib/utils";
import { PostEmbed } from "@/components/post-embed";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; postId: string };
}) {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      creator: {
        include: {
          blogPage: true,
        },
      },
    },
  });

  if (!post) return { title: "Post not found — Handle" };

  const title = post.embedTitle || truncate(post.caption || "Instagram Reel", 80);
  return {
    title: `${title} — @${post.creator.igUsername}`,
    description: truncate(post.caption || "Watch this Instagram Reel.", 160),
    openGraph: {
      title,
      description: truncate(post.caption || "", 160),
      images: post.thumbnailUrl ? [post.thumbnailUrl] : [],
      type: "article",
    },
  };
}

export default async function IndividualPostPage({
  params,
}: {
  params: { slug: string; postId: string };
}) {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      creator: {
        include: {
          blogPage: true,
          posts: {
            where: { id: { not: params.postId } },
            orderBy: { publishedAt: "desc" },
            take: 3,
          },
        },
      },
    },
  });

  if (!post) notFound();

  const blogPage = post.creator.blogPage;
  const relatedPosts = post.creator.posts;

  return (
    <div>
      {/* Back bar */}
      <div style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ display: "flex", height: "56px", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href={`/blog/${params.slug}`}
            className="font-mono-label"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--gray)" }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            ← Back to @{post.creator.igUsername}
          </Link>
        </div>
      </div>

      <article style={{ padding: "48px 0" }}>
        <div className="wrap" style={{ maxWidth: "680px" }}>
          {/* Meta */}
          <span className="font-mono-label" style={{ fontSize: "12px", color: "var(--gray)" }}>
            {formatDate(post.publishedAt).toUpperCase()}
          </span>

          {/* Title */}
          <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "clamp(28px, 4vw, 40px)", marginTop: "12px", lineHeight: 1.15 }}>
            {post.embedTitle || truncate(post.caption || "Untitled Post", 100)}
          </h1>

          {/* Video Embed */}
          <div style={{ marginTop: "32px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ position: "relative", aspectRatio: "9/16", maxHeight: "70vh", margin: "0 auto" }}>
              {post.embedHtml ? (
                <PostEmbed embedHtml={post.embedHtml} />
              ) : post.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.thumbnailUrl} alt={post.caption || "Instagram post"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", background: "var(--bg-raised)" }}>
                  <Play style={{ width: "56px", height: "56px", color: "var(--gray)" }} />
                </div>
              )}
            </div>
          </div>

          {/* Fallback link if embed unavailable */}
          {!post.embedHtml && (
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid var(--line)", background: "var(--bg-raised)", borderRadius: "4px", padding: "12px 16px", fontSize: "13px", color: "var(--gray)" }} className="font-mono-label">
              <Play style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              <span>
                Inline playback unavailable.{" "}
                <a href={post.permalink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--red-bright)", textDecoration: "underline" }}>
                  Watch on Instagram
                </a>
              </span>
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <div style={{ marginTop: "32px" }}>
              <p style={{ fontSize: "16px", color: "#c4beb1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {post.caption}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <ExternalLink style={{ width: "14px", height: "14px" }} />
              View on Instagram
            </a>
            <a
              href={`https://instagram.com/${post.creator.igUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Follow creator →
            </a>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section style={{ borderTop: "1px solid var(--line)", padding: "48px 0 80px" }}>
          <div className="wrap">
            <span className="eyebrow">More from @{post.creator.igUsername}</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginTop: "24px" }} id="related-grid">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/blog/${params.slug}/${rp.id}`} className="card-dark" style={{ overflow: "hidden", padding: 0 }}>
                  <div style={{ position: "relative", aspectRatio: "9/16", overflow: "hidden", background: "var(--bg-raised)" }}>
                    {rp.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rp.thumbnailUrl} alt={rp.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                        <Play style={{ width: "28px", height: "28px", color: "var(--gray)" }} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "16px" }}>
                    <p className="font-serif-display" style={{ fontSize: "14px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {truncate(rp.caption || "Untitled post", 60)}
                    </p>
                    <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", marginTop: "4px", display: "block" }}>
                      {formatDate(rp.publishedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          #related-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

