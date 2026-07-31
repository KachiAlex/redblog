# RedBlog — Turn Your Instagram Reels Into a Blog

A compliant Instagram-to-blog platform that lets creators connect their Instagram account and automatically publish their Reels as a beautiful, playable, SEO-friendly blog.

## Key Design Decision: Compliance First

This platform uses **only** Instagram's official Graph API and oEmbed endpoints. It never scrapes, downloads, or rehosts video files. Creators authorize their own accounts via Meta's OAuth — making this a legitimate creator-publishing SaaS, not a scraping tool.

## Tech Stack

- **Frontend:** Next.js 14 (App Router, SSR for SEO), TailwindCSS, Lucide icons
- **Backend:** Next.js API routes (Node.js)
- **Database:** SQLite (via Prisma ORM) — swap to Postgres for production
- **Auth:** Instagram Graph API OAuth 2.0
- **Video:** Instagram oEmbed (Instagram serves/hosts the video; we embed it)
- **Worker:** Node.js polling worker for auto-syncing new posts

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local` and fill in your Meta Developer app credentials:

```env
INSTAGRAM_CLIENT_ID=your_meta_app_client_id
INSTAGRAM_CLIENT_SECRET=your_meta_app_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/callback/instagram
META_APP_ACCESS_TOKEN=your_meta_app_access_token
DATABASE_URL="file:./dev.db"
TOKEN_ENCRYPTION_KEY=your_32_byte_hex_encryption_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Set Up Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com) and create a new app
2. Add the **Instagram Basic Display** product
3. Add `http://localhost:3000/api/auth/callback/instagram` as an OAuth redirect URI
4. Copy your App ID and App Secret into `.env.local`

### 4. Initialize Database

```bash
npx prisma db push
```

### 5. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Run the Polling Worker (optional, for auto-sync)

```bash
npm run worker
```

The worker polls connected creators' accounts every 15 minutes for new posts.

## Project Structure

```
socialblog/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # OAuth redirect
│   │   │   └── callback/instagram/     # OAuth callback + token exchange
│   │   └── sync/route.ts               # Manual sync endpoint
│   ├── blog/
│   │   ├── page.tsx                    # Blog listing (all creators)
│   │   └── [slug]/
│   │       ├── page.tsx                # Creator's blog feed
│   │       └── [postId]/page.tsx       # Individual post page
│   ├── dashboard/
│   │   └── page.tsx                    # Creator dashboard
│   ├── globals.css                     # Global styles + Tailwind
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Landing page
├── components/
│   ├── navbar.tsx                      # Site navbar
│   ├── footer.tsx                      # Site footer
│   ├── dashboard-sidebar.tsx           # Dashboard nav sidebar
│   ├── dashboard-content.tsx           # Dashboard main content (client)
│   └── post-embed.tsx                  # Instagram oEmbed renderer
├── lib/
│   ├── db.ts                           # Prisma client
│   ├── crypto.ts                       # AES-256-GCM token encryption
│   ├── instagram.ts                    # Instagram Graph API + oEmbed
│   └── utils.ts                        # Shared utilities
├── prisma/
│   └── schema.prisma                   # Database schema
├── worker/
│   └── poll-worker.js                  # Auto-sync polling worker
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Features

- **OAuth Login:** Creators connect via Instagram's official OAuth flow
- **Auto-Sync:** Polling worker detects new posts every 15 minutes
- **oEmbed Rendering:** Videos are embedded via Instagram's oEmbed API (compliant)
- **Blog Feed:** Scrollable grid of a creator's Reels with thumbnails
- **Individual Post Pages:** SEO-friendly URLs with OG metadata per post
- **Creator Dashboard:** View synced posts, trigger manual sync, see stats
- **Theme Customization:** Per-creator theme colors and custom slugs
- **Graceful Degradation:** Fallback thumbnails + links when embeds fail
- **Token Encryption:** OAuth tokens encrypted at rest with AES-256-GCM
- **Token Refresh:** Worker auto-refreshes expiring long-lived tokens

## Compliance Notes

- Uses Instagram Graph API `/me/media` for authenticated creators only
- Uses Instagram oEmbed (`graph.facebook.com/v19.0/instagram_oembed`) for embeddable HTML
- Never downloads, stores, or rehosts video files
- Creators explicitly authorize via Meta OAuth consent screen
- OAuth tokens encrypted at rest with AES-256-GCM
- Compliant with Meta Platform Terms and Instagram API Terms of Use
