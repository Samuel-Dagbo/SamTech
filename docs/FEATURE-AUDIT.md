# SamTech Labs — Feature Audit Matrix (post-migration, Day 183/session 2026-10-28)

Auditor methodology: every claim below was verified by reading the actual source files in this
repository (`src/**`) and probing the deployed app (`https://samtechlabs.vercel.app`) with
HTTP-level checks. No status was assigned from a file name or button label alone.

Verified baseline before any implementation work:

- `npx tsc --noEmit` → PASS (0 errors) · `npm run lint` → PASS · `npm run build` → PASS
- Production probes: `/`, `/about`, `/work`, `/work/[slug]`, `/login`, `/api/health` → 200
- Legacy Express/Render findings L1–L14 from `docs/MODERNIZATION-PLAN.md` (re-verified 2026-10-28)

Statuses: PASS / PARTIAL / FAIL / NOT VERIFIED / NOT APPLICABLE.

---

## A. Public company website

| # | Feature | Status | Existing implementation | Problems found | Required change | Verification |
|---|---|---|---|---|---|---|
| A1 | Home page | PARTIAL | `(site)/page.tsx` — DB-backed via `getPublicContent()`, hero, CTAs, testimonials (top 3), brands, featured projects, CTA banner | Stray empty JSX expression containers (`{ }`); stats row hardcodes copy and pulls `yearsExperience` blindly; shows ALL projects when none featured | Clean stray expressions; keep defaults honest (existing data only) | Build + live GET 200 + visual review ✓ |
| A2 | About page | PASS | `(site)/about` — all profile-managed sections render; timeline + gallery + brand wall | None blocking (FAQs intentionally shown on `/contact`, which satisfies "where available") | — | Live 200 + content reflects CMS writes |
| A3 | Services page | PASS | `(site)/services` — DB services, ordered | No publication semantics (all services always public) | Add `published` with `$ne: false` legacy-safe semantics | Live 200 + CMS round-trip |
| A4 | Work listing | PASS | `(site)/work` — alternating layout, featured badge, links | Same stray JSX artifacts | Cleanup | Live 200 ✓ |
| A5 | Project detail `/work/[slug]` | PASS | Server-side slug resolution, OG metadata, metrics, PSR (problem/solution/result), screenshots | Falls back to bundled content on DB failure (deliberate + logged, per plan §5) | None (documented behaviour) | hard-refresh resolves server-side ✓ |
| A6 | Testimonials page | PASS | DB-backed, ordered | Publication semantics (as A3) | Same `published` approach | Live 200 ✓ |
| A7 | Contact page + form | PARTIAL | Full form with honeypot, accessible errors, WhatsApp/email alternatives; submission persists; notification best-effort | **No `subject` field** (spec §3 requires name/email/subject/message) | Add subject to form, Zod schema, model, persistence | POST test + DB record check |
| A8 | 404 page | PASS | Custom branded not-found | — | — | Route probe |
| A9 | SEO (titles, OG/Twitter, canonical base, sitemap, robots) | PASS | Root `metadataBase: APP_URL`; dynamic sitemap incl. DB slugs; robots disallows private areas | Sitemap lists projects without publication filter (fine while no published field exists; align after A3/A5 change) | Align sitemap with `published` query | curl sitemap/robots ✓ |

## B. Contact & inquiry workflow

| # | Feature | Status | Existing implementation | Problems found | Required change | Verification |
|---|---|---|---|---|---|---|
| B1 | `POST /api/contact` | PASS | Zod validation, origin check, honeypot, rate limit 5/10min, Mongo persist, Mailjet best-effort notify that never fails the request | — | — | local POST probes (valid 201 / invalid 422 / honeypot fake-success) |
| B2 | Subject field | FAIL | Absent everywhere | Spec-required | Add `subject` (required, 2–120) end-to-end | Validation + persist test |
| B3 | Status model `new/read/replied/archived` | PARTIAL | Model supports `new/read/archived` only | Missing `replied` | Add enum value (additive & legacy-safe) | Migration-safe schema check |
| B4 | Admin inbox | FAIL | None (legacy AdminMessages.jsx is gone; old bug L5 not reproducible but requiring a rebuild) | No UI, no status transitions, no search/pagination | Build `/workspace/admin/messages` with search, filters, pagination, status transitions (new→read→replied→archived→read), unread counter | UI workflow test incl. persistence |
| B5 | Notification email failure handling | PASS | Delivery failure logged, submission still 201 | — | — | verified in code + config-false path |

## C. Admin CMS (owner, founder-gated)

| # | Feature | Status | Existing implementation | Problems found | Required change |
|---|---|---|---|---|---|
| C1 | Overview dashboard with real stats | FAIL | Workspace home renders a static "Phases" module list — no data | Spec §4 requires live counts (projects, drafts, services, testimonials, unread messages, activity, invitations, staff) | Build stats service + cards |
| C2 | Front page editor (hero/tagline/availability/years) | FAIL | Profile model has all fields; no editor | Legacy L13 persists | Build editor |
| C3 | Profile editor | FAIL | Same | — | Build editor (name, role, tagline, intro, images, location, WhatsApp, email, yearsExperience, availability) |
| C4 | Social links editor (incl. `resumeUrl`) | FAIL | Fields exist in model | — | Build editor |
| C5 | Brands editor | FAIL | `brands: string[]` in model | Legacy L10 (cannot empty a list) — rebuild must accept empty | Build editor allowing empty list |
| C6 | About editor (about* fields + techStack + timeline + faq) | FAIL | Model has everything; no editor (L13) | — | Build editors incl. repeatable rows |
| C7 | Services CRUD (+ published, benefits, technologies) | FAIL | Legacy SPA copies deleted with migration | No admin CRUD at all | Build API + UI |
| C8 | Projects CRUD (+ featured/feature, order/reorder, published, URL validation) | FAIL | Same | — | Build API + UI, URL validation, private-repo caution note |
| C9 | Testimonials CRUD (+ published) | FAIL | Same | — | Build API + UI |
| C10 | Messages inbox (see B4) | FAIL | — | — | Included in C9 build |
| C11 | CMS authorization | FAIL→by build | `rbac.ts` defined `cms.manage` but nothing consumes it | CMS absence | Every CMS API/web page gated by `cms.manage` (founder) + audit entries |

## D. Staff invitations & account management

| # | Feature | Status | Existing implementation | Problems found | Required change | Verification |
|---|---|---|---|---|---|---|
| D1 | Create invitation (dup guard, TTL 72h, hash-only storage) | PASS | `services/invitations.ts` + `POST /api/workspace/invitations` | UI sends only `role: team_member` (no department, no scopes) | Extend invite with department + scopes | Existing test script + unit checks |
| D2 | Resend (invalidates old token) | PARTIAL | Service complete (`resendInvitation` regenerates tokenHash+expiry, 60s throttle) | **API route `/api/workspace/invitations/[id]` does not exist — the Team page buttons POST to it and always fail** | Add route handler | Live POST via UI |
| D3 | Revoke | PARTIAL | Service complete (`revokeInvitation`) | Same missing route | Same | Same |
| D4 | Accept flow (validate→password→account, atomic tx, session) | PASS | `checkInvitationToken` + `acceptInvitation` (used/expired/revoked/account-exists rejection, transactional) | — | — | Reason messages on `/invite/accept` verified live (invalid link path) |
| D5 | Suspend/reactivate (kills sessions, no self-suspend) | PASS | `services/team.ts` | — | — | Code-verified + API test |
| D6 | Role change (no self-role-change, founder preservation) | PASS | `services/team.ts` | UI lacks confirmation dialog for a significant action | Add confirm | Code test |
| D7 | Owner-only visibility of team admin | PASS | Team page + nav gated by `team.manage` | — | — | Status-403 path verified in code |

## E. Authentication

| # | Feature | Status | Existing implementation | Problems found | Required change |
|---|---|---|---|---|---|
| E1 | Login (generic errors, timing-safe enumerate, dual rate limits) | PASS | login route w/ dummy bcrypt compare + per-IP 20/15m + per-account 5/15m | — | — |
| E2 | Sessions: DB-backed opaque tokens, HMAC at rest, HTTP-only Secure SameSite=lax, 7d, TTL index, revocation | PASS | `session.ts`, `models/session.ts` | — | — |
| E3 | Proxy redirect for `/workspace` unauth, and `/login` when authed | PASS | `proxy.ts` (cookie-presence UX only) + real layout guard | — | — |
| E4 | Password change API (current-password check, revoke sessions, audit) | PASS | `POST /api/auth/password` | **No UI anywhere calls it** | Build change-password form on `/workspace/profile` |
| E5 | Forgot/reset flow (single-use 60min token, supersedes prior tokens, revoke-all on reset, enumeration-safe responses) | PASS | `services/password-reset.ts` | — | — |
| E6 | `/invite/accept` page + form | PASS | Server-side token check before rendering form | — | — |

## F. Roles & permissions

| # | Feature | Status | Existing implementation | Problems | Required change |
|---|---|---|---|---|---|
| F1 | RBAC registry enforced server-side | PASS | `rbac.ts` + `requirePermission()` on APIs | — | — |
| F2 | Department roles (secretary/marketing/developer/tester) & multi-scope assignments | FAIL | Only founder/team_member, fixed maps | No per-user `scopes`, no `department` | Additive `department` + `scopes: Permission[]` on User; `can()` → user-aware resolution; least privilege (staff never auto-gain `team.*`, `cms.*`, `messages.manage`, `audit.view`) |
| F3 | No privilege escalation | PASS | change-role founder guard + route guards | Add: role grant limited to founder; no self-scope edit; scopes grantable subset only from founder UI | Server-enforced scope grants logged in audit |

## G. Staff workspace (portal)

| # | Feature | Status | Existing implementation | Problems | Required change |
|---|---|---|---|---|---|
| G1 | Dashboard with real, permission-filtered data | FAIL | Placeholder text cards | No data path | Build: assigned tasks (due/overdue/blocked), recent announcements, unread count, upcoming calendar items, my recent activity; founder gets pending invitations + unread messages + audit tails |
| G2 | Tasks system (CRUD, assignees, priority, due, comments, status, search/filter, completion tracking) | FAIL | Raw phrases only inside `rbac.ts` | No model/API/UI | Build Task model + service + `/workspace/tasks` + `/workspace/tasks/[id]` |
| G3 | Announcements (draft/published, pinned, audience, read tracking, edit/archive) | FAIL | — | — | Build model/service/API/UI + unread tracking |
| G4 | Marketing content calendar (posts: platform/status/planned date/URLs/results) | FAIL | — | — | Build content-post model/service/API/UI at `/workspace/calendar` |
| G5 | Internal resources & meeting notes | FAIL | — | — | Build resource model (categories incl. meeting notes) + API/UI |
| G6 | Staff directory (permitted fields only) | FAIL | Team page is founder-only | Staff can't see directory | Directory view for all staff (name/title/department/role + work email; nothing private) |
| G7 | Profile self-service + password change | FAIL | API exists (E4) | No page | Build `/workspace/profile` (name, title display, department display, password change) |
| G8 | Audit log viewer (founder) | FAIL | Model + recording exist | No view | Build `/workspace/admin/audit-logs` with pagination/filters |
| G9 | Audit coverage for new content/task/announcement ops | PARTIAL | Auth+team ops recorded | Content ops not yet (CMS absent) | Record on every CMS/task/announcement/resource/calendar mutation |

## H. Security

| # | Feature | Status | Evidence | Required change |
|---|---|---|---|---|
| H1 | No legacy seed/cleanup endpoints, no hardcoded admin creds, no destructive seed | PASS | New codebase has none (only founder bootstrap CLI). Legacy `POST /api/content/cleanup-projects` and seed code lives in the legacy backend repo — explicitly out of this repo and retired by architecture | Documented in final report; consider legacy repo archive/README (no code here) |
| H2 | Zod validation on every Route Handler | PASS (verified per-route) | All 8 handlers parse via Zod | New handlers follow the same |
| H3 | Rate limiting (login, invitations, contact, invite-accept, password) | PASS in-memory | per-instance documented (plan §5); acceptable at current volume; Upstash adapter noted as config follow-up | Keep + doc |
| H4 | CSRF: SameSite=lax cookies + Origin check on all mutations | PASS | `isSameOrigin` on every POST/DELETE route | New routes must reuse `isSameOrigin` |
| H5 | Open redirects prevented | PASS | `sanitizeNext` (relative internal only) | Keep in all future redirects |
| H6 | Security headers (nosniff, frame-deny, referrer, permissions, CSP lax) | PASS w/ documented gap | `next.config.ts` + CSP `unsafe-inline` (documented Phase 6 hardening) | Keep; nonce CSP follow-up |
| H7 | No secretsclient-side; server-only modules; no GET mutations; no stack traces in responses | PASS | Verified imports (`server-only`), error paths, all mutations POST | New code same |
| H8 | Mass-assignment protection | PASS in existing routes | Handlers select fields explicitly | New CMS routes MUST whitelist fields, never spread `req.body` |
| H9 | Legacy weak JWT secret (L4) | N/A in this codebase | New app uses opaque session tokens never persisted raw | Verify SESSION_SECRET strength (64-hex locally) + rotation at deployment |
| H10 | Dead env var `VITE_API_BASE_URL` (present in Vercel prod env) | PARTIAL | Leftover from Vite era; new code never reads it | Safe to delete in Vercel dashboard (ask owner before touching — flagged) |

## I. Data & migration safety

| # | Feature | Status | Evidence | Required change |
|---|---|---|---|---|
| I1 | No drops/deletes of existing collections; additive only | PASS (design) | Bootstrap script refuses existing founder; no destructive code in repo | All new work additive |
| I2 | Legacy base64 media preserved | PASS | Content service passes `data:` URLs through to `<img>` tags; `next/image` avoided for data URLs | Keep plain `<img>` semantics |
| I3 | Serverless-safe DB connection (cached global) | PASS | `db.ts` retries and caches; health reports state | New services reuse `connectDB()` |
| I4 | Pagination on large collections | PARTIAL | Invitations capped at 200; messages/sitemap unpaginated | Add to inbox + audit viewer |
| I5 | Indexes on uniques (email, tokenHash, slug) | PASS | users/sessions/invitations/password-resets unique; post-audit: add on new collections | Add on new collections |
| I6 | Cloudinary media storage | NOT APPLICABLE (not configured) | No CLOUDINARY_* env/keys; spec says "where configured" | Skip; extensible later; image inputs accept validated HTTPS URLs, data URLs preserved |

## J. UX/quality

| # | Feature | Status | Evidence |
|---|---|---|---|
| J1 | Reusable UI kit (button/input/toast/card/badges), consistent tokens | PASS | `components/ui/*`, tokens in `globals.css` |
| J2 | Accessible forms (labels, field errors, autocomplete, honeypot invisible) | PASS | Verified in auth+contact forms |
| J3 | Confirmations for destructive actions | PARTIAL | None yet in team table | Add for delete/revoke/suspend/role-change actions in new + existing UI |
| J4 | Loading/empty/error states | PASS (public) / NA (CMS) | Workspace placeholders; CMS built in this cycle |
| J5 | No dead buttons | FAIL → fix | Team Resend/Revoke dead routes (D2/D3) | Fix + verify |

---

## Confirmed legacy-resolution (from MODERNIZATION-PLAN L1–L14)

- **L1 (missing /api suffix)** — RESOLVED by architecture: `content.ts` reads MongoDB directly; there is no HTTP content API to mis-configure. Stale `VITE_API_BASE_URL` env remains in Vercel (H10) — recommend delete.
- **L2/L3 (seed-admin + hardcoded creds)** — RESOLVED: absent from new codebase; founder exists only via CLI bootstrap.
- **L4** — RESOLVED by opaque sessions (no JWT).
- **L5 (inbox unauth/archive bug)** — legacy admin retired; rebuild (C10) with correct auth + status engine.
- **L6 (hanging async)** — RESOLVED: all handlers wrapped in try/catch.
- **L7** — RESOLVED: endpoint does not exist here.
- **L8 (raw err.message)** — RESOLVED: `logServerError` + generic client messages.
- **L9 (base64 in Mongo)** — ACCEPTED per plan §7/§9.8 pending Cloudinary decision.
- **L10 (per-item legacy UI bugs)** — superseded by rebuild, ensure no-empty-list etc.
- **L11** — RESOLVED: real layout guard + rate limits + headers; CSP hardening noted.
- **L12 (dead code)** — legacy files gone with SPA removal; new tree grep-clean.
- **L13** — resolved by CMS build (C6): techStack/timeline/FAQ editors.
- **L14** — irrelevant now (email-native users model).

## Implementation order for this cycle (priority)

1. **B4/D2/D3** — missing invitation action route (working buttons) + confirm dialogs (J3, D6)
2. **F2** — RBAC scopes + department (blocks invite form, directory, least-privilege modules)
3. **B2/B3** — contact subject + replied status (model/schema/form/route)
4. **C1–C10** — CMS APIs + pages + overview stats + inbox (publish semantics A3/A5/A6 + sitemap alignment)
5. **G1–G9** — workspace modules: dashboard, tasks, announcements, resources, calendar, profile, directory, audit viewer
6. **QA + deploy + final report** (J/§18/§20)
