# SamTech Labs — Modernization Plan (Phase 1)

> Audit findings, target architecture, phased implementation plan and risk register.
> Status: Phase 1 complete · Phase 2 (Next.js foundation + public site) in progress.
> This file is the source of truth for the migration. Update it as phases complete.

---

## 1. Verified audit findings (legacy system)

All findings below were re-verified against source on 2026-10-28 (not taken from docs):

| # | Finding | Evidence | Severity |
|---|---|---|---|
| L1 | Frontend `.env` API base is missing the `/api` suffix → every live fetch 404s → the deployed site silently renders bundled fallback content | `SamTech _frontend/.env` (confirmed); live probe: `GET /content/profile` → 404, `GET /api/content/profile` → 200 | Critical |
| L2 | Public `POST /api/seed-admin` deletes all admins and recreates hardcoded credentials | `Samtech_backend/routes/authRoutes.js:10-23` (re-confirmed) | Critical |
| L3 | Hardcoded admin credentials + slug in source (`samtech-admin / samtech_ticotico / samtech`) | `seed.js:22-27`, `authRoutes.js:14-16` | Critical |
| L4 | Weak JWT secret (15 chars), JWT in localStorage, 8h life, no revocation | `Samtech_backend/.env`, `AdminPortal.jsx` | High |
| L5 | Admin messages inbox fetches without auth token → always empty; "Archive" sets status `read`, never `archived` | `AdminMessages.jsx:37-45,147-154` | High |
| L6 | Express 4 async handlers without try/catch → validation errors hang requests / unhandled rejections | `contentController.js` (most handlers) | High |
| L7 | Public unauthenticated `POST /api/content/cleanup-projects` | `contentRoutes.js:34` | Medium |
| L8 | Error middleware returns raw `err.message` to clients | `server.js:26-29` | Medium |
| L9 | Images/CV stored as base64 data URLs inside Mongo documents (10 MB body limit is load-bearing) | `utils/image.js`, `AdminSocial.jsx`, `server.js:17` | Medium |
| L10 | `AdminBrands` cannot clear list to empty; overview "Social Links" card shows brands count; HomePage reads non-existent `testimonial.avatar/role` | `AdminBrands.jsx:86`, `AdminOverview.jsx:70-71`, `HomePage.jsx:157-167` | Low |
| L11 | No route guard on `/admin/*` (UI only; API 401s), no rate limiting, no security headers, CORS fallback `*` | `AdminLayout.jsx`, `server.js:12-16` | Medium |
| L12 | Dead code: `AdminDashboard.jsx` (17.8 kB legacy monolith), `Skeleton.jsx`, `SectionTitle.jsx`, `utils/file.js`; unused endpoints `projects/:slug`, `cleanup-projects`; README documents an env-based login that no code reads | grep-verified | Low |
| L13 | `Profile.techStack / experienceTimeline / faqItems` have no admin editor (seed-only) | `AdminAbout.jsx` | Low |
| L14 | Legacy admin model has no email field → cannot be auto-migrated into new staff accounts | `Models/Admin.js` | Info |

Legacy `/api/health` on Render is live and healthy (probed 200). Old site stays operational during migration; cutover happens only after verification (§6).

## 2. Target architecture

Single Next.js 16 (App Router) application deployed on Vercel, Node runtime, MongoDB Atlas via Mongoose.

```
samtech-labs/                        (this app; separate git repo)
├─ docs/                             plan, migration + deployment docs
├─ src/
│  ├─ app/
│  │  ├─ (site)/                     public website (route group)
│  │  │  ├─ layout.tsx               header/footer/CTA shell (force-dynamic)
│  │  │  ├─ page.tsx                 home
│  │  │  ├─ about, work, work/[slug], services, testimonials, contact
│  │  ├─ api/
│  │  │  ├─ contact/route.ts         public contact submissions
│  │  │  └─ health/route.ts          db-aware health probe
│  │  ├─ login/  invite/accept/      (Phase 3)
│  │  ├─ workspace/                  (Phases 4–5) dashboard, tasks, projects,
│  │  │                              announcements, team, resources, settings, admin
│  │  ├─ layout.tsx  not-found.tsx  sitemap.ts  robots.ts  icon.svg
│  ├─ components/ui/                 small token-first UI kit (no runtime deps)
│  ├─ components/site/               public-site components
│  ├─ lib/
│  │  ├─ env.ts                      server-only, lazy-validated env
│  │  ├─ db.ts                       cached mongoose connection (serverless-safe)
│  │  ├─ content.ts                  public content service (react cache + fallback)
│  │  ├─ http.ts  rate-limit.ts      response helpers, origin check, abuse control
│  │  ├─ mail/mailjet.ts             transactional email client (REST, no SDK)
│  │  └─ validation/                 zod schemas
│  ├─ models/                        mongoose models (existing + new)
│  └─ data/fallback-content.ts       bundled content snapshot (kept from Vite app)
```

## 3. Key decisions and rationale

| Decision | Rationale |
|---|---|
| Next 16 + React 19 + Tailwind v4 (CSS-first `@theme` tokens) | Latest supported stack per brief; tokens port the existing sand/clay/forest/ink identity exactly. Turbopack default build. |
| Mongoose 9 with a global-cached connection in `lib/db.ts` | Existing Atlas collections/schemas carry over untouched; one cached connection per Lambda container avoids per-request connects (§8.6/8.7). |
| Custom DB-backed sessions (Phase 3) instead of Auth.js | Sessions must be revocable (suspended staff lose access with a live session) and integrate with the custom invitation flow; opaque random tokens, HMAC-hashed in DB, HTTP-only cookie. No client-side token storage. |
| `bcryptjs` cost 12 for new hashes | Pure-JS (serverless-safe); existing legacy hashes are bcrypt and can be verified transparently, then upgraded on first login. |
| Hand-rolled token-first UI kit now; shadcn-style primitives only where the workspace needs them | Zero extra runtime deps for the public site; consistent with brand; avoids `unsafe-inline`/Radix overhead where unneeded. Revisit for complex workspace widgets. |
| Zod 4 validation on every Route Handler; origin check + in-memory sliding-window rate limiting | Server-side truth for all input. In-memory limiter documented as per-instance only on serverless (works for single-region low traffic); Upstash REST adapter is a documented follow-up config, not a code requirement. |
| Mailjet via direct REST (`POST https://api.mailjet.com/v3.1/send`) | Avoids SDK dependency; single `sendEmail()` service reused by invitations (Phase 4) and optional contact notifications. Never logs tokens or recipient PII beyond address. |
| Public pages are `force-dynamic` with `react/cache`-deduped content fetch | CMS content must reflect edits; one DB read per request shared by layout+page; hard refresh of `/work/[slug]` resolves server-side (fixes old client-side-only lookup). |
| Base64 media **stays** for now | Migration must not block on media (§9.8). Existing data keeps working; `next/image` avoided for `data:` URLs (plain `img`). A storage migration is planned separately (Phase 6, optional). |
| `APP_URL` default `https://samtechlabs.vercel.app` | Real current domain; removes the invented `samtech.dev` canonical. Local dev overrides via `.env.local`. |
| Secret trigger (4-tap footer) **removed** | Brief §7: no hidden buttons as authentication substitutes. Login is a real `/login` route (Phase 3). |
| Old `SamTech _frontend` / `Samtech_backend` folders stay untouched | Keep the deployed legacy site operational until the new app is verified; deletion is a documented post-cutover step. |

## 4. Phase plan

| Phase | Scope | Checkpoint to pass before next phase |
|---|---|---|
| P1 (done) | Audit + this plan | — |
| P2 | Next.js foundation, design system, DB layer, public site migration, contact form + API, SEO/security headers, `.env.example` | Production build passes; smoke tests: every public page renders, live Atlas data present, nested route hard-refresh works, contact POST persists, unauth-safe |
| P3 | Security & auth: User/Session models, founder bootstrap CLI, login/logout, sessions (HTTP-only cookie), proxy.ts route protection, authorization module, audit-log model; remove legacy exposure risk | Unauth access to /workspace redirects; login/logout works; suspended users blocked; rate limits fire |
| P4 | Mailjet invitations + acceptance + team management (founder-only) | Full invitation lifecycle tests incl. expired/revoked/reused tokens |
| P5 | Workspace: dashboard, tasks, projects, announcements, resources, audit views | Role-scoped authorization tests |
| P6 | CMS on the new app (profile/projects/services/testimonials/messages/social), fix legacy bugs L5/L7/L8/L10, tests (vitest units + smoke script), docs, final report | Definition of success §17 |

## 5. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Destructive seed against prod Atlas | Data loss | Legacy `npm run seed` is **never** run against prod in this migration; new app has no destructive seed. Back up before any schema/index change (commands in MIGRATION doc, Phase 3). |
| Legacy admin has no email → founder provisioning | Lockout risk | Founder account created via a **CLI bootstrap script** run by the founder (env-authenticated), never via a public endpoint. Legacy `Admin` collection preserved read-only for reference. |
| Mongoose connection storms on Vercel | Atlas overload / exhaust | Cached global connection, bounded pool; health route reports connection state. |
| In-memory rate limiter resets per serverless instance | Weaker abuse control than ideal | Acceptable for Phase 2–3 volumes; documented; Upstash adapter is a config-only follow-up. |
| CSP + Next inline scripts | Overly permissive `script-src 'unsafe-inline'` initially | Nonce-based CSP documented as Phase 6 hardening with the official guide. |
| Silent fallback masks DB misconfig (recurrence of L1) | Stale site unnoticed | Loud `console.error` on fallback + `/api/health` db-aware probe + Phase 3 workspace fails loudly. |
| Mailjet sender not yet verified | Invitation emails fail | Feature degrades to "delivery-failed" invitation state with retry (Phase 4); docs specify sender verification. |
| Two systems live during migration | Confusion | Old app untouched until P6 cutover; Vercel domain switch is the last step, reversible. |

## 6. Migration safety rules (in force)

1. No destructive commands against Atlas (no `deleteMany`, no `drop`) — ever, from the new app.
2. New collections (`users`, `sessions`, `invitations`, `audit_logs`, `tasks`, `internal_projects`, `announcements`, `resources`) are additive; existing six collections keep their names/documents.
3. Back up Atlas before production index/schema changes: `mongodump --uri "$MONGODB_URI" --out backup-$(date +%F)`.
4. Unique indexes on new collections only, after a duplicate scan.
5. Media move-out (if approved) is a separate, verified, reversible migration with a flag to read old `data:` URLs.

## 7. Test strategy

- **Unit (Phase 6):** Vitest for zod schemas, token hashing/verification, permission map, rate limiter.
- **Smoke (every phase):** production build + `next start` + scripted HTTP checks (pages 200, markers, 404 route, contact POST persisted, protected routes redirect).
- **Manual:** browser pass of key flows; Mailjet deliverability (requires verified sender — cannot be automated here; will be marked explicitly as untested until configured).
