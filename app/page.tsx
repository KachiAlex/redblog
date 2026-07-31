import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div>
      <Navbar />

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
          <div style={{ position: "relative", height: "460px" }} className="filmstrip" aria-hidden="true">
            <FilmFrame className="f1 anim-drift1" label="IG_0511" tag="REEL" z={1} />
            <FilmFrame className="f3 anim-drift3" label="IG_0512" tag="REEL" z={1} />
            <FilmFrame className="f2 anim-drift2" label="POST_047" tag="LIVE" z={2} published />
          </div>
        </div>
      </header>

      <hr className="rule" />

      {/* PROCESS */}
      <section id="process" style={{ padding: "110px 0" }}>
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
      <section id="example" style={{ padding: "0 0 110px" }}>
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
                @surewordradio, developed.
              </h3>
              <p style={{ color: "#5a5548", fontSize: "14.5px", lineHeight: 1.6, maxWidth: "340px", marginBottom: "22px" }}>
                Three weeks of Reels, twelve blog entries, one archive that
                outlives the feed. This is what a connected account looks like
                once RedBlog has been running for a month.
              </p>
              <Link
                href="/blog"
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <ExamplePost title="Sunday service clip" date="JUL 27" gradient="linear-gradient(160deg,#3a3630,#17151a)" />
              <ExamplePost title="Studio setup walk-through" date="JUL 22" gradient="linear-gradient(160deg,#5c2420,#17151a)" />
              <ExamplePost title="Behind the broadcast" date="JUL 18" gradient="linear-gradient(160deg,#2a3630,#17151a)" />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "0 0 120px" }}>
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
        @media (max-width: 920px) {
          #hero-grid { grid-template-columns: 1fr !important; }
          .filmstrip { height: 340px !important; margin-top: 20px; }
          .steps-grid { grid-template-columns: 1fr !important; }
          #example-card { grid-template-columns: 1fr !important; }
          #plans-grid { grid-template-columns: 1fr !important; }
        }
        :focus-visible { outline: 2px solid var(--red-bright); outline-offset: 2px; }
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
}: {
  className: string;
  label: string;
  tag: string;
  z: number;
  published?: boolean;
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
          background: published
            ? "linear-gradient(160deg,#5c2420,#17151a 65%)"
            : "linear-gradient(160deg,#3a3630,#17151a 70%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
          }}
        />
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

function ExamplePost({ title, date, gradient }: { title: string; date: string; gradient: string }) {
  return (
    <div
      style={{
        background: "var(--bg)",
        borderRadius: "4px",
        overflow: "hidden",
        aspectRatio: "9/16",
        position: "relative",
      }}
    >
      <div style={{ width: "100%", height: "72%", position: "relative", overflow: "hidden", background: gradient }}>
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

