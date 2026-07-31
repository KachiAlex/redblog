import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Privacy Policy — RedBlog",
  description: "How RedBlog handles your data and Instagram content.",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Navbar />
      <div className="wrap" style={{ padding: "80px 0", maxWidth: "720px" }}>
        <span className="eyebrow">Legal</span>
        <h1 className="font-serif-display" style={{ fontStyle: "italic", fontSize: "40px", marginTop: "12px", marginBottom: "32px" }}>
          Privacy Policy
        </h1>

        <div style={{ color: "#c9c4b8", fontSize: "15px", lineHeight: 1.7 }}>
          <p style={{ marginBottom: "24px" }}>Last updated: July 31, 2025</p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>1. Overview</h2>
          <p style={{ marginBottom: "16px" }}>
            RedBlog is a platform that transforms Instagram Reels into permanent, searchable blog archives. We respect your privacy and are committed to protecting your data. This policy explains what we collect, how we use it, and your rights.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>2. Data We Collect</h2>
          <p style={{ marginBottom: "12px" }}><strong>Instagram Public Data:</strong> When you scan a public Instagram profile, we collect publicly available information including username, profile picture, bio, post captions, thumbnails, video URLs, and post dates.</p>
          <p style={{ marginBottom: "12px" }}><strong>OAuth Data (Optional):</strong> If you choose to connect via Instagram OAuth, we collect your Instagram user ID, username, profile picture, and an encrypted access token. We do <strong>not</strong> collect or store your Instagram password.</p>
          <p style={{ marginBottom: "12px" }}><strong>Blog Content:</strong> Posts, themes, and settings you configure on RedBlog.</p>
          <p style={{ marginBottom: "12px" }}><strong>Analytics:</strong> Page view counts on blog pages (aggregate, non-identifying).</p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>3. How We Use Your Data</h2>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "16px" }}>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>To create and maintain your blog archive</li>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>To sync new posts from Instagram (OAuth users only)</li>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>To display blog content to visitors</li>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>To track aggregate page views for analytics</li>
            <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>To improve our service</li>
          </ul>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>4. Data Storage &amp; Security</h2>
          <p style={{ marginBottom: "16px" }}>
            Data is stored in a secure PostgreSQL database (Neon) with encryption in transit (SSL/TLS). OAuth access tokens are encrypted at rest using AES-256-GCM encryption. We do not store passwords. Video files are stored temporarily in serverless function storage.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>5. Instagram API Compliance</h2>
          <p style={{ marginBottom: "16px" }}>
            RedBlog uses the official Instagram API for OAuth-connected accounts and public profile scanning for non-OAuth accounts. We comply with Instagram&apos;s Platform Policy and Meta Platform Terms. We do not sell user data or use it for advertising.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>6. Data Retention &amp; Deletion</h2>
          <p style={{ marginBottom: "16px" }}>
            You can delete your account and all associated data at any time from the Dashboard Settings page. Upon deletion, all your posts, blog pages, analytics data, and encrypted tokens are permanently removed from our database.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>7. Your Rights</h2>
          <p style={{ marginBottom: "16px" }}>
            You have the right to access, correct, or delete your personal data. You can exercise these rights by disconnecting your account in Settings or contacting us.
          </p>

          <h2 className="font-serif-display" style={{ fontSize: "22px", marginTop: "32px", marginBottom: "12px", color: "var(--paper)" }}>8. Contact</h2>
          <p style={{ marginBottom: "16px" }}>
            For privacy questions or data requests, contact us through the platform.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
