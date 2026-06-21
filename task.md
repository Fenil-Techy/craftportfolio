# Production Roadmap — Execution Tracker

---

## Phase 1 — Critical Bugs ✅

- [x] 1.1 · Fix double Hero render in workspace/layout.tsx
- [x] 1.2 · Fix system prompt `{userInput}` placeholder
- [x] 1.3 · Replace `frameId` random int with UUID
- [x] 1.4 · Delete `SaveMessages` dead code
- [x] 1.5 · Fix `setLoading` never resets on image load error
- [x] 1.6 · Fix border radius not applied in ImageSetting
- [x] 1.7 · Fix metadata title/description in layout.tsx
- [x] 1.8 · Fix `project_list` null user crash + remove @ts-ignore
- [x] 1.9 · Remove unused `encoder` variable in AI route
- [x] 1.10 · Clean up eslint-disable suppressions + type OnSaveContext

---

## Phase 2 — Security Hardening ✅

- [x] 2.1 · Authenticate `/api/ai-model`
- [x] 2.2 · Authenticate `/api/chats`
- [x] 2.3 · Authenticate `/api/imagekit-upload`
- [x] 2.4 · Add rate limiting (Upstash) on AI + project creation endpoints
- [x] 2.5 · Move `projectId` + `frameId` generation server-side
- [x] 2.6 · Remove `allow-same-origin` from iframe sandbox *(intentionally reverted — editor requires DOM access)*
- [x] 2.7 · Validate `model` against server-side allowlist in AI route
- [x] 2.8 · Add `designCode` size limit in PUT /api/frames
- [x] 2.9 · Add server-side file type + size validation in imagekit-upload
- [x] 2.10 · Validate message array structure (Zod) in chat + AI endpoints
- [x] 2.11 · Add security headers in next.config.ts
- [x] 2.12 · Audit NEXT_PUBLIC_ env vars exposure — created .env.example template

---

## Phase 3 — Performance ✅

- [x] 3.1 · Fix N+1 query in `/api/project_list` — 41 DB round-trips → 3 batch queries
- [x] 3.2 · Add DB indexes on `createdBy`, `projectId`, `frameId` columns — applied via drizzle-kit push
- [x] 3.3 · Dynamic import `react-syntax-highlighter` — ~70KB off initial bundle
- [x] 3.4 · Debounce color pickers + opacity slider in settings panel — 50ms batched re-renders
- [x] 3.5 · Add 5-min TTL to `localStorage` project cache — eliminates stale ghost projects
- [x] 3.6 · Increase streaming re-render threshold 500 → 2000 chars — ~24 iframe re-paints → ~6
- [x] 3.10 · Optimize Unsplash image URLs in system prompt — 4K → 800px params added

---

## Bonus fixes

- [x] 4.8 · Prevent double-submit on project creation button
- [x] 4.11 · Add `language="html"` + `atomOneDark` theme to ViewCodeBlock
- [x] Accessibility: Added `title` attr to preview iframe
- [x] Bug fix: Safe optional chaining on `chats[0].chatMessage[0].content` in sidebar
- [x] Bug fix: Restored `allow-same-origin` on iframe sandbox so stored designCode loads correctly

---

## Phase 4 — UX Polish ✅

- [x] 4.1 · Auto-scroll chat to latest message
- [x] 4.2 · Ctrl+Enter / Cmd+Enter to send
- [x] 4.3 · "Generating..." empty state overlay with animated skeleton bars
- [x] 4.4 · Fix broken collapsed sidebar icon buttons (wired to /workspace)
- [x] 4.5 · Slide-up + fade-in animation on mobile chat overlay
- [x] 4.6 · Animated 3-dot typing indicator (replaces static "Thinking...")
- [x] 4.7 · Fix hardcoded max credits — created `config/credits.ts`
- [x] 4.9 · Input validation + character counter on Hero (min 10 / max 2000)
- [x] 4.12 · Toast on AI generation failure
- [x] 4.14 · Copy to clipboard button on assistant messages (hover reveal)
- ~~4.10~~ deferred (needs DB schema migration)
- ~~4.13~~ deferred (L complexity, belongs to Phase 5)

---

## Phase 5 — AI Improvements ✅

- [x] 5.1 · Fix System Prompt Template and Make It Dynamic
- [x] 5.2 · Add Abort Controller for SSE Stream
- [x] 5.3 · Add Context Window Management (Message Summarization)
- [x] 5.4 · Add Stream Timeout
- [x] 5.8 · Multi-Model Fallback Chain
- ~~5.5~~ deferred
- ~~5.6~~ deferred
- ~~5.7~~ deferred
- ~~5.9~~ deferred
- ~~5.10~~ deferred

---

## Phase 6 — Scaling Infrastructure ✅

- [x] 6.1 · Add Drizzle DB Migration Workflow (programmatic migration scripts configured)
- [x] 6.2 · Change `createdBy` FK from Email to User ID (completed database type migration + API routes updated)
- [x] 6.3 · Normalize Chat Messages (One Row Per Message) (normalized to `messages` table, custom SQL migration data-transfer completed)
- [x] 6.4 · Add Connection Pooling with PgBouncer or Neon Pooled URL (DIRECT_DATABASE_URL configured)
- [x] 6.6 · Add Proper Error Monitoring (Sentry Next.js integration configured client and server-side)
- [x] 6.7 · Add Usage Analytics (created `generation_logs` table, logs duration/model/tokens on endpoint)
- [x] 6.8 · Implement Webhook-Based Credit Sync with Clerk (Clerk webhook endpoint created via svix signature verification)
- [x] 6.9 · Add CDN for Static Assets (remotePatterns configured in nextConfig for Clerk, ImageKit, Unsplash)
- [x] 6.10 · Add A/B Testing Infrastructure (Installed `posthog-js` and integrated identify checks)
- ~~6.5~~ deferred/unnecessary (Visual editor relies on SSE streaming, client timeout increased to 5min)

---

## Phase 7 — Monetization ✅

- [x] 7.1 · Credit System tiers setup in config/credits.ts, config/schema.ts, types/user.ts, lib/user-helper.ts
- [x] 7.2 · Migrate billing from Stripe to Razorpay (order/verify endpoints, pricing script integration)
- [x] 7.3 · Pro badge, model gating (Qwen 3 235B) in model config, Hero selector, sidebar UI, and backend AI model route
- [x] 7.5 · Attribution watermark in system prompt and client-side HTML injections (Iframe preview, download/view code)
- [x] Install razorpay npm package
- [x] Code type check and verification (npx tsc --noEmit)
- [ ] 7.4 · Referral system (bonus credits for referrer on signup) — deferred

---

## Phase 8 — Operational Essentials

> 🧊 Enterprise tasks (8.1 GDPR, 8.2 SOC2, 8.3 SSO, 8.4 White-label, 8.5 Audit logs, 8.10 Data residency) are FROZEN — do not start until app has paying users.

- [x] 8.6 · Admin dashboard — user list, credit adjustment, last 50 gen logs (gated to your Clerk ID)
- [x] 8.7 · Minimal test suite — unit tests for credit logic + Razorpay sig verification (Vitest)
- [x] 8.8 · CI/CD — GitHub Actions: lint + tsc + unit tests on every push
- [x] 8.9 · Uptime monitoring — BetterUptime or UptimeRobot free tier (no code needed)




