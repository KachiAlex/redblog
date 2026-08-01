# RedBlog — Agent Notes

## Stack
- **Framework:** Next.js 14 (App Router) on Vercel
- **DB:** Neon Postgres via Prisma (`prisma/schema.prisma`)
- **Auth:** Instagram OAuth (long-lived tokens, encrypted at rest with `TOKEN_ENCRYPTION_KEY`)
- **AI:** OpenAI (GPT + DALL-E) primary; DeepSeek, Moonshot, Together AI optional
- **Image storage:** Vercel Blob (production) / local filesystem (dev)
- **Scheduled publishing:** Vercel Cron Jobs → protected API routes

## Commands
```bash
npm run dev          # local dev server
npm run build        # prisma generate + next build
npm run db:push      # push schema to Neon
npm run db:studio    # Prisma Studio
npm run worker       # local worker (NOT used in production — cron jobs replace it)
```

## Environment variables
See `.env.example` for the full list. Critical ones:
- `DATABASE_URL` / `DIRECT_DATABASE_URL` — Neon pooled + direct
- `INSTAGRAM_CLIENT_ID` / `INSTAGRAM_CLIENT_SECRET` / `INSTAGRAM_REDIRECT_URI`
- `TOKEN_ENCRYPTION_KEY` — encrypts OAuth tokens; must be stable across deploys
- `APP_BASE_URL` — public URL; used to build absolute image URLs for Instagram
- `OPENAI_API_KEY` — text + image generation
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store token (production image storage)
- `CRON_SECRET` — shared secret authenticating Vercel Cron requests

## Cron jobs (production)
Defined in `vercel.json`. Both routes verify `Authorization: Bearer <CRON_SECRET>`.
- `*/15 * * * *` → `/api/cron/sync-creators` — polls creators' Instagram posts
- `*/5 * * * *` → `/api/cron/publish-scheduled` — publishes due scheduled posts

### Publish state machine
Scheduled posts move through these statuses:
```
draft → scheduled → publishing → published
                                  ↘ failed
```
The publish cron runs an **async** two-phase flow to avoid blocking:
1. **Phase 1:** due `scheduled` posts → create Instagram media container → store `containerId`, set `publishing`
2. **Phase 2:** `publishing` posts → check container status → if `FINISHED`, publish to feed; if `ERROR`, mark `failed`; if `IN_PROGRESS`, leave for next tick

This replaces the old `worker/poll-worker.js` blocking 30s polling loop, which doesn't fit Vercel's serverless model.

## Image storage
- **Production (Vercel):** `saveGeneratedImage()` uploads to Vercel Blob and returns a permanent public URL. This is required because `/tmp` is ephemeral and not shared across invocations — Instagram fetches the Blob URL directly at publish time.
- **Local dev:** images are written to `public/generated/` and served by `/api/generated-images/[filename]`.

## Instagram publishing prerequisites
- Connected Instagram account must be a **Business/Creator** account.
- OAuth scope `instagram_business_content_publish` must be granted (reconnect if connected before this scope was added).
- The image URL passed to `createMediaContainer` must be publicly reachable (Vercel Blob URLs are).
