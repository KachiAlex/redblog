import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { prisma } from "@/lib/db";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch all blog pages with their creators and recent posts
  const blogPages = await prisma.blogPage.findMany({
    include: {
      creator: {
        select: {
          id: true,
          igUsername: true,
          igProfilePic: true,
          posts: {
            select: {
              id: true,
              caption: true,
              thumbnailUrl: true,
              publishedAt: true,
              mediaType: true,
            },
            orderBy: { publishedAt: "desc" },
            take: 3,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Collect all posts across all blogs, sorted by date
  const allPosts = blogPages
    .flatMap((bp) =>
      bp.creator.posts.map((p) => ({
        ...p,
        blogSlug: bp.slug,
        igUsername: bp.creator.igUsername,
      }))
    )
    .filter((p) => p.publishedAt)
    .sort((a, b) => (b.publishedAt!.getTime() - a.publishedAt!.getTime()))
    .slice(0, 6);

  // Keep kreatixtech as the featured blog for the "live example" section
  const kreatixCreator = blogPages.find(
    (bp) => bp.creator.igUsername === "kreatixtech"
  )?.creator;
  const livePosts = (kreatixCreator?.posts ?? [])
    .filter((p) => p.publishedAt)
    .slice(0, 3);
  const blogSlug = kreatixCreator
    ? blogPages.find((bp) => bp.creatorId === kreatixCreator.id)?.slug || "kreatixtech"
    : "kreatixtech";
  return (
    <div>
      <Navbar />
      <ScrollReveal />

      {/* HERO */}
      <header style={{ padding: "100px 0 60px", position: "relative" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "56px", alignItems: "center" }} id="hero-grid">
          <div>
            <span className="eyebrow">An archive, developed from your own reels</span>
            <h1
              className="font-serif-display"
              style={{
                fontSize: "clamp(42px, 5.2vw, 66px)",
                lineHeight: 1.03,
                letterSpacing: "-0.01em",
                margin: "18px 0 22px",
              }}
            >
              Every reel,
              <br />
              developed into{" "}
              <em style={{ fontStyle: "italic", color: "var(--red-bright)" }}>
                print
              </em>
              .
            </h1>
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.65,
                color: "#c9c4b8",
                maxWidth: "480px",
                marginBottom: "34px",
              }}
            >
              Connect your Instagram account and RedBlog turns your Reels into a
              permanent, searchable blog — hosted by you, credited to you,
              indexed by Google. Using Instagram&apos;s official API, fully
              compliant. It&apos;s your own footage, developed a second time.
            </p>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "38px", flexWrap: "wrap" }}>
              <a href="/scan" className="btn btn-primary" style={{ padding: "14px 24px", fontSize: "13px" }}>
                Connect Instagram →
              </a>
              <Link href="/blog" className="btn btn-ghost" style={{ padding: "14px 22px", fontSize: "13px", borderColor: "var(--red-bright)", color: "var(--red-bright)" }}>
                Browse blogs →
              </Link>
              <Link href="#example" className="btn btn-ghost" style={{ padding: "14px 22px", fontSize: "13px" }}>
                See a live blog
              </Link>
            </div>
            <div
              className="font-mono-label"
              style={{
                fontSize: "11.5px",
                color: "var(--gray)",
                letterSpacing: "0.04em",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span>OFFICIAL INSTAGRAM API</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>READ-ONLY ACCESS</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>NO PASSWORDS STORED</span>
            </div>
          </div>

          {/* Filmstrip */}
          <div style={{ position: "relative", height: "460px" }} className="filmstrip reveal" aria-hidden="true">
            <FilmFrame className="f1 anim-drift1" label="IG_0511" tag="REEL" z={1} img="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=533&fit=crop" />
            <FilmFrame className="f3 anim-drift3" label="IG_0512" tag="REEL" z={1} img="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=533&fit=crop" />
            <FilmFrame className="f2 anim-drift2" label="POST_047" tag="LIVE" z={2} published img="https://images.unsplash.com/photo-1492691527719-9d1eab7b9317?w=300&h=533&fit=crop" />
          </div>
        </div>
      </header>

      <hr className="rule" />

      {/* PROCESS */}
      <section id="process" style={{ padding: "110px 0" }} className="reveal">
        <div className="wrap">
          <div style={{ maxWidth: "560px", marginBottom: "64px" }}>
            <span className="eyebrow">The process — three passes</span>
            <h2
              className="font-serif-display"
              style={{ fontStyle: "italic", fontSize: "36px", marginTop: "14px", lineHeight: 1.2 }}
            >
              From vertical scroll
              <br />
              to permanent page.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              background: "var(--line)",
              border: "1px solid var(--line)",
            }}
            className="steps-grid"
          >
            <Step
              num="01 — CONNECT"
              title="Authorize your account"
              desc="Enter your Instagram handle and authorize RedBlog via Instagram's official OAuth. Read-only access — no passwords, no posting, nothing beyond your own media."
            />
            <Step
              num="02 — DEVELOP"
              title="Reels become entries"
              desc="We fetch your Reels through the Instagram Graph API and process each into a titled, dated blog entry with the video hosted and playable."
            />
            <Step
              num="03 — PRINT"
              title="Your archive goes live"
              desc="Published at your own redblog.app address — permanent, embeddable elsewhere, indexed by search engines, and themed however you like."
            />
          </div>
        </div>
      </section>

      {/* LIVE EXAMPLE */}
      <section id="example" style={{ padding: "0 0 110px" }} className="reveal">
        <div className="wrap">
          <div
            className="card-paper"
            style={{
              padding: "44px 40px",
              display: "grid",
              gridTemplateColumns: "0.85fr 1.15fr",
              gap: "44px",
            }}
            id="example-card"
          >
            <div>
              <span className="eyebrow" style={{ color: "var(--red)" }}>
                A live blog
              </span>
              <h3
                className="font-serif-display"
                style={{ fontSize: "30px", margin: "14px 0 12px", lineHeight: 1.15 }}
              >
                @kreatixtech, developed.
              </h3>
              <p style={{ color: "#5a5548", fontSize: "14.5px", lineHeight: 1.6, maxWidth: "340px", marginBottom: "22px" }}>
                {livePosts.length > 0
                  ? "Real Reels from @kreatixtech, auto-transcribed and published as a permanent blog archive. This is what RedBlog does — your content, developed a second time."
                  : "Connect your Instagram account and RedBlog turns your Reels into a permanent, searchable blog — hosted by you, credited to you, indexed by Google."}
              </p>
              <Link
                href={livePosts.length > 0 ? `/blog/${blogSlug}` : "/blog"}
                className="font-mono-label"
                style={{
                  fontSize: "12px",
                  borderBottom: "1px solid var(--ink)",
                  paddingBottom: "2px",
                }}
              >
                View the full archive →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="example-posts-grid">
              {livePosts.length > 0 ? (
                livePosts.map((post) => (
                  <Link key={post.id} href={`/blog/${blogSlug}/${post.id}`} style={{ textDecoration: "none" }}>
                    <ExamplePost
                      title={post.caption ? post.caption.slice(0, 40) + (post.caption.length > 40 ? "…" : "") : "Untitled"}
                      date={post.publishedAt ? relativeTime(post.publishedAt.toISOString()).toUpperCase() : ""}
                      img={post.thumbnailUrl || undefined}
                    />
                  </Link>
                ))
              ) : (
                <>
                  <ExamplePost title="Sunday service clip" date="JUL 27" img="https://images.unsplash.com/photo-1604516524119-4b9c75d7e4f4?w=300&h=533&fit=crop" />
                  <ExamplePost title="Studio setup walk-through" date="JUL 22" img="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=533&fit=crop" />
                  <ExamplePost title="Behind the broadcast" date="JUL 18" img="https://images.unsplash.com/photo-1492691527719-9d1eab7b9317?w=300&h=533&fit=crop" />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY ARCHIVED — posts from all blogs */}
      {allPosts.length > 0 && (
        <section id="recent" style={{ padding: "0 0 110px" }} className="reveal">
          <div className="wrap">
            <div style={{ maxWidth: "560px", marginBottom: "40px" }}>
              <span className="eyebrow">Fresh from the archive</span>
              <h2
                className="font-serif-display"
                style={{ fontStyle: "italic", fontSize: "36px", marginTop: "14px", lineHeight: 1.2 }}
              >
                Recently developed.
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} id="recent-grid">
              {allPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.blogSlug}/${post.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      aspectRatio: "9/16",
                      position: "relative",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    className="example-post-card"
                  >
                    <div style={{ width: "100%", height: "72%", position: "relative", overflow: "hidden", background: "var(--bg-raised)" }}>
                      {post.thumbnailUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={post.thumbnailUrl}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                          loading="lazy"
                        />
                      )}
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: 0,
                          height: 0,
                          borderTop: "6px solid transparent",
                          borderBottom: "6px solid transparent",
                          borderLeft: "10px solid rgba(246,241,231,0.85)",
                          transform: "translate(-35%,-50%)",
                          zIndex: 2,
                        }}
                      />
                    </div>
                    <div
                      className="font-mono-label"
                      style={{ padding: "10px", fontSize: "9.5px", color: "#c9c4b8" }}
                    >
                      {post.caption ? post.caption.slice(0, 40) + (post.caption.length > 40 ? "..." : "") : "Untitled"}
                      <span style={{ opacity: 0.55, marginTop: "3px", display: "block" }}>
                        @{post.igUsername} &middot; {relativeTime(post.publishedAt!.toISOString()).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <Link href="/blog" className="btn btn-ghost" style={{ padding: "12px 22px", fontSize: "13px" }}>
                Browse all blogs
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      <section id="pricing" style={{ padding: "0 0 120px" }} className="reveal">
        <div className="wrap">
          <div style={{ maxWidth: "520px", marginBottom: "56px" }}>
            <span className="eyebrow">Pricing — pick a plan</span>
            <h2
              className="font-serif-display"
              style={{ fontStyle: "italic", fontSize: "36px", marginTop: "14px" }}
            >
              Simple, per blog.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} id="plans-grid">
            <Plan
              tag="Contact sheet"
              price="Free"
              priceSuffix=""
              features={["1 connected account", "Up to 20 archived posts", "Redblog.app subdomain", "Standard theme"]}
              cta="Start free"
              ctaHref="/scan"
              featured={false}
            />
            <Plan
              tag="Creator"
              price="₦4,500"
              priceSuffix="/mo"
              features={["Unlimited archived posts", "Custom domain", "Full theme control", "Auto-publish on new Reels"]}
              cta="Connect Instagram"
              ctaHref="/scan"
              featured={true}
            />
            <Plan
              tag="Agency"
              price="Custom"
              priceSuffix=""
              features={["Multiple connected accounts", "White-label for clients", "API access", "Priority support"]}
              cta="Talk to us"
              ctaHref="/scan"
              featured={false}
            />
          </div>
        </div>
      </section>

      <Footer />

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1024px) {
          #hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .filmstrip { height: 380px !important; margin-top: 20px; }
          #example-card { grid-template-columns: 1fr !important; }
          #plans-grid { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; }
          #recent-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .example-posts-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #recent-grid { grid-template-columns: 1fr !important; max-width: 240px; margin: 0 auto; }
          .filmstrip { height: 280px !important; transform: scale(0.75); transform-origin: center; }
          .example-posts-grid { grid-template-columns: 1fr !important; max-width: 240px; margin: 0 auto; }
          #example-card { padding: 28px 20px !important; gap: 24px !important; }
        }
        @media (max-width: 480px) {
          .filmstrip { transform: scale(0.6); transform-origin: center; }
        }
        :focus-visible { outline: 2px solid var(--red-bright); outline-offset: 2px; }

        /* Scroll reveal */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        /* Example post hover */
        .example-post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.35);
        }
        .example-post-card:hover img {
          transform: scale(1.08);
        }

        /* Step card hover */
        .steps-grid > div {
          transition: background 0.3s ease;
        }
        .steps-grid > div:hover {
          background: var(--bg-raised) !important;
        }

        /* Plan card hover */
        #plans-grid > div {
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        #plans-grid > div:hover {
          transform: translateY(-4px);
        }

        /* Button shine */
        .btn-primary {
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .btn-primary:hover::after {
          left: 100%;
        }
      `}</style>
    </div>
  );
}

function FilmFrame({
  className,
  label,
  tag,
  z,
  published,
  img,
}: {
  className: string;
  label: string;
  tag: string;
  z: number;
  published?: boolean;
  img?: string;
}) {
  const positions: Record<string, React.CSSProperties> = {
    f1: { top: "8px", left: "0", transform: "rotate(-9deg)" },
    f2: { top: "70px", left: "150px", transform: "rotate(6deg)" },
    f3: { top: "20px", left: "290px", transform: "rotate(-4deg)" },
  };
  const posKey = className.split(" ")[0];

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        width: "172px",
        aspectRatio: "9/16",
        background: "var(--paper)",
        borderRadius: "2px",
        boxShadow: "0 22px 44px rgba(0,0,0,0.45)",
        padding: "9px 9px 34px",
        zIndex: z,
        ...positions[posKey],
      }}
    >
      {published && (
        <span
          className="font-mono-label"
          style={{
            position: "absolute",
            top: "-24px",
            left: "0",
            fontSize: "9.5px",
            letterSpacing: "0.08em",
            color: "var(--red-bright)",
          }}
        >
          → PUBLISHED
        </span>
      )}
      {/* Sprockets */}
      <div style={{ position: "absolute", top: 0, bottom: 0, width: "9px", left: "-9px" }}>
        {[...Array(6)].map((_, i) => (
          <span key={i} style={{ display: "block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--bg)", margin: "11px auto" }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, width: "9px", right: "-9px" }}>
        {[...Array(6)].map((_, i) => (
          <span key={i} style={{ display: "block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--bg)", margin: "11px auto" }} />
        ))}
      </div>
      {/* Shot */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "1px",
          position: "relative",
          overflow: "hidden",
          background: "var(--bg)",
        }}
      >
        {img && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.9,
            }}
            loading="lazy"
          />
        )}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: "13px solid rgba(246,241,231,0.85)",
            transform: "translate(-40%,-50%)",
            zIndex: 2,
          }}
        />
        {published && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(92,36,32,0.3), rgba(23,21,26,0.5))" }} />
        )}
      </div>
      {/* Label */}
      <div
        className="font-mono-label"
        style={{
          position: "absolute",
          bottom: "10px",
          left: "9px",
          right: "9px",
          fontSize: "9.5px",
          color: "var(--ink)",
          opacity: published ? 0.85 : 0.55,
          letterSpacing: "0.03em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{label}</span>
        <span>{tag}</span>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ background: "var(--bg)", padding: "38px 32px 44px" }}>
      <span
        className="font-mono-label"
        style={{ fontSize: "12px", color: "var(--red-bright)", letterSpacing: "0.06em", marginBottom: "22px", display: "block" }}
      >
        {num}
      </span>
      <h3
        className="font-serif-display"
        style={{ fontSize: "22px", marginBottom: "12px", letterSpacing: "0.01em" }}
      >
        {title}
      </h3>
      <p style={{ color: "#a9a396", fontSize: "14.5px", lineHeight: 1.65 }}>
        {desc}
      </p>
    </div>
  );
}

function ExamplePost({ title, date, img }: { title: string; date: string; img?: string }) {
  return (
    <div
      style={{
        background: "var(--bg)",
        borderRadius: "4px",
        overflow: "hidden",
        aspectRatio: "9/16",
        position: "relative",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      className="example-post-card"
    >
      <div style={{ width: "100%", height: "72%", position: "relative", overflow: "hidden", background: "var(--bg-raised)" }}>
        {img && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            loading="lazy"
          />
        )}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderLeft: "10px solid rgba(246,241,231,0.85)",
            transform: "translate(-35%,-50%)",
            zIndex: 2,
          }}
        />
      </div>
      <div
        className="font-mono-label"
        style={{ padding: "10px", fontSize: "9.5px", color: "#c9c4b8" }}
      >
        {title}
        <span style={{ opacity: 0.55, marginTop: "3px", display: "block" }}>{date}</span>
      </div>
    </div>
  );
}

function Plan({
  tag,
  price,
  priceSuffix,
  features,
  cta,
  ctaHref,
  featured,
}: {
  tag: string;
  price: string;
  priceSuffix: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${featured ? "var(--red-bright)" : "var(--line)"}`,
        borderRadius: "6px",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        background: featured ? "var(--bg-raised)" : "transparent",
      }}
    >
      <span
        className="font-mono-label"
        style={{
          fontSize: "11px",
          color: featured ? "var(--red-bright)" : "var(--gray)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {tag}
      </span>
      <div
        className="font-serif-display"
        style={{ fontSize: "38px", margin: "14px 0 4px" }}
      >
        {price}
        {priceSuffix && (
          <span
            className="font-mono-label"
            style={{ fontSize: "13px", color: "var(--gray)" }}
          >
            {priceSuffix}
          </span>
        )}
      </div>
      <ul style={{ listStyle: "none", margin: "22px 0 28px", flex: 1, padding: 0 }}>
        {features.map((f, i) => (
          <li
            key={f}
            style={{
              fontSize: "13.5px",
              color: "#c9c4b8",
              padding: "8px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
            }}
          >
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`btn ${featured ? "btn-primary" : "btn-ghost"}`}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {cta}
      </Link>
    </div>
  );
}

