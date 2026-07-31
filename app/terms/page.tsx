import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Terms of Service — RedBlog",
  description: "Terms and conditions for using RedBlog.",
};

export default function TermsPage() {
  return (
    <div>
      <Navbar />
      <div className="wrap" style={{ padding: "80px 0", maxWidth: "720px" }}>
        <span className="eyebrow">Legal</span>
        <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "40px", marginTop: "12px", marginBottom: "32px" }}>
          Terms of Service
        </h1>

        <div style={{ color: "#c9c4b8", fontSize: "15px", lineHeight: 1.7 }}>
          <p style={{ marginBottom: "24px" }}>Last updated: July 31, 2025</p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: "16px" }}>
            By using RedBlog, you agree to these Terms of Service. If you do not agree, please do not use the platform.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>2. Service Description</h2>
          <p style={{ marginBottom: "16px" }}>
            RedBlog is a platform that creates blog archives from Instagram Reels. Users can scan public Instagram profiles or connect their own accounts via OAuth to generate a permanent, searchable blog.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>3. User Responsibilities</h2>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "16px" }}>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>You may only scan public Instagram profiles</li>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>You are responsible for content you publish through RedBlog</li>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>You must comply with Instagram&apos;s Terms of Service and Platform Policy</li>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>You may not use RedBlog to harass, impersonate, or violate others&apos; rights</li>
          </ul>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>4. Intellectual Property</h2>
          <p style={{ marginBottom: "16px" }}>
            Instagram content displayed on RedBlog belongs to the original creators. RedBlog provides a platform for archiving and displaying this content. We do not claim ownership of user content.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>5. Acceptable Use</h2>
          <p style={{ marginBottom: "16px" }}>
            You agree not to: (a) scrape private or protected content, (b) redistribute content without attribution, (c) use the service for commercial purposes without a paid plan, (d) attempt to circumvent rate limits or security measures.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>6. Termination</h2>
          <p style={{ marginBottom: "16px" }}>
            We reserve the right to terminate accounts that violate these terms. You may delete your account at any time from Settings.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>7. Disclaimer</h2>
          <p style={{ marginBottom: "16px" }}>
            RedBlog is provided &quot;as is&quot; without warranties. We do not guarantee uninterrupted service availability. Instagram API access may change at Meta&apos;s discretion.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>8. Limitation of Liability</h2>
          <p style={{ marginBottom: "16px" }}>
            RedBlog shall not be liable for indirect, incidental, or consequential damages arising from use of the service.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>9. Changes to Terms</h2>
          <p style={{ marginBottom: "16px" }}>
            We may update these terms periodically. Continued use of RedBlog after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
