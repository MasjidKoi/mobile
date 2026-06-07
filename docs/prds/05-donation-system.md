# PRD — Donation System & Donation Dashboard (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native) plus the entire backend donation subsystem it cannot ship without: the donation ledger, SSLCommerz hosted-checkout integration with IPN validation, recurring-donation schedules and sweeps, receipt generation, the dashboard read endpoints, and the admin-side refund and disbursement-recording endpoints. Covers feature-doc **§5 (Donation System)** and **§6 (Donation Dashboard)** in one PRD — §6 is the read-side of the same ledger. The web admin panel's *UI* is untouched; this PRD only delivers the backend endpoints it will consume.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §5–§6, 2026-06-07, reconciled against PRDs 01–04 and 07–09 during synthesis.
> Triage: `ready-for-agent`
> Amends: PRD 01 (the Donate login gate — first of the original two — finally gets its action; first-donation name collection and no-app-level-re-auth ship as PRD 01 specced them; login is **email OTP**, superseding the grill session's phone-OTP assumption). PRD 03 (four new message types on the push subsystem: donation-confirmed, payment-recovery, recurring-nudge, campaign-milestone — PRD 03 anticipated "future donation receipts"). PRD 04 (the sticky Donate bar gets wired; campaign cards join the profile page). PRD 08 (the dormant Generous Giver badge counter activates — its criterion is already encoded in BadgeEngine; activation is data, not code). PRD 09 (the reserved Profile-tab donation-history row and the reserved "donate anonymously by default" privacy setting are both filled by this PRD).
> Corrects: `MasjidKoi_Mobile_Features.md` says the backend is Node.js — it is FastAPI/Python. The doc also lists "saved payment methods (tokenised via SSLCommerz)" as an MVP-safe enhancement — infeasible under the hosted-checkout decision below; quick-donate is a prefilled checkout, never one-tap.

---

## Problem Statement

A worshipper in Bangladesh who wants to give ৳500 to their masjid today hands cash to a committee member or sends bKash to a personal number scribbled on a noticeboard. No receipt. No record. No way to know the roof fund reached its target or that the money arrived at all. For the donor, giving is untraceable; for the masjid, fundraising is word-of-mouth; for anyone trying to give Zakat properly, there is no paper trail of what was given, to whom, when. The app has carried a `Donate` promise through four PRDs — PRD 01 built a login gate whose primary purpose is donating, PRD 04 pinned a sticky Donate bar to every masjid profile, PRD 08 ships a Generous Giver badge that can never be earned, PRD 09 reserved a donation-history row that opens nothing — and the backend has campaign tables with a `raised_amount` column that has never moved. The donate button is the app's core promise, and it is dark.

## Solution

A complete give-money-see-money loop, built on the decision that the **NGO is the merchant of record**: every donation lands in the NGO's single SSLCommerz account, tagged per-masjid in a ledger, and the NGO disburses to masjids outside the system, recording each payout against the balance. A masjid needs *zero* payment setup to start receiving — which is the only model that works across 300,000 masjids.

- **Donating is one screen and one gateway page.** From the sticky Donate bar (PRD 04), a quick-donate shortcut on favourites, or a campaign card: preset amount chips (৳50/100/500/1000 + custom), category (General / Building / Zakat / Sadaqah / Lillah — or a campaign), an anonymity toggle, and an honest fee line ("X Masjid receives ~৳488"). Confirm opens the **SSLCommerz hosted checkout in an in-app WebView** — the user pays by bKash, Nagad, or card inside it; the app never touches payment credentials, which is what the Bangladesh Bank MFS rules require of us anyway.
- **The server-to-server IPN is the only thing that completes a donation.** The WebView redirect is just navigation; the backend validates every IPN against SSLCommerz's validation API and, in one transaction, marks the donation completed, bumps the campaign progress bar, and credits the masjid's ledger balance — idempotently, so a replayed IPN changes nothing. The app polls status and shows the success moment (and the in-app review prompt timing hook) only when the server says so.
- **Recurring is a schedule plus a nudge, not an auto-charge.** Hosted checkout leaves no token to charge server-side, so a weekly ৳100 commitment is a schedule that fires a push each cycle — tap, prefilled checkout, one gateway confirm. The same machinery sweeps stale pending donations into failed and sends the "complete your ৳500 donation?" recovery push. A "last 10 nights" preset is just a bounded nightly schedule.
- **Campaigns ship now.** The backend campaign stack already exists; mobile gets campaign cards with gross-amount progress bars on the masjid profile, donate-to-campaign, and a milestone push when a campaign a user gave to is fully funded.
- **The dashboard closes the loop** (§6): full donation history with filters, lifetime/yearly/per-masjid totals, per-donation acknowledgment PDF receipts and an annual giving summary — issued by the NGO as payment acknowledgments, with tax-deductibility language behind a platform flag the NGO flips only once its NBR status is confirmed — and a recurring-schedule manager with pause/resume/cancel. It lives behind PRD 09's reserved Profile-tab row.
- **Anonymity is concealment, not amnesia.** An anonymous donation hides the donor from the masjid admin and every public surface, while the donor keeps their history and receipts and the platform keeps its audit trail. PRD 09's reserved "donate anonymously by default" setting controls the toggle's initial state.
- **Money out is auditable from day one:** a per-masjid balance (net of fees), admin endpoints to record manual disbursements against it, and admin-only refunds through the existing support-ticket flow — balances may go negative after a post-disbursement refund and offset against future giving.

Gross amounts everywhere the donor looks; gross/fee/net in the ledger; net in the admin's disbursement views. One mental model per audience.

## User Stories

### Starting a donation
1. As a donor, I want a Donate button on every masjid profile (PRD 04's sticky bar), so that giving is never more than one tap from the masjid I'm looking at.
2. As a guest tapping Donate, I want the login sheet at that moment and my donation flow resumed after login, so that the gate costs me only the sign-in (PRD 01's gate and continuation).
3. As a donor whose masjid has donations disabled, I want no Donate button at all, so that I'm never led into a dead end.
4. As a donor, I want preset amount chips (৳50 / ৳100 / ৳500 / ৳1000) plus a custom field, so that I never start from an empty input.
5. As a donor entering a custom amount, I want validation against the ৳10–৳5,00,000 bounds with a clear message, so that I learn limits before the gateway rejects me.
6. As a donor, I want to choose a category — General, Building, Zakat, Sadaqah, Lillah — so that my intention (niyyah) is recorded with my gift.
7. As a donor giving to a campaign, I want the campaign pre-selected when I arrive from its card, so that context carries through.
8. As a donor, I want to see what the masjid will actually receive after gateway fees before I confirm, so that the platform never feels like it skims in secret.
9. As a Zakat giver, I want the fee disclosure visible so I can gross-up my amount myself, so that my full obligation reaches the masjid.
10. As a first-time donor without a profile name, I want to be asked for my name once, inside the flow, so that my receipt carries my legal name (PRD 01's deferral, honoured here).
11. As a donor, I want an "donate anonymously" toggle on the donation screen, defaulting to my setting from PRD 09's privacy section, so that concealment is one tap and my preference is remembered.
12. As a donor, I want to favourite-masjid quick-donate from the home screen to open this same flow prefilled with my last amount and category for that masjid, so that repeat giving is near-instant.

### Paying
13. As a donor, I want the SSLCommerz checkout to open inside the app and let me pay by bKash, Nagad, or card, so that I pay the way I already pay for everything else.
14. As a donor, I want no app-level re-authentication before paying, so that donating stays as short as possible — the gateway verifies the transaction itself (PRD 01).
15. As a donor whose payment succeeds, I want the app to return from the WebView and show a clear "confirming…" state until the server has validated the payment, so that the success screen never lies.
16. As a donor, I want a success moment — receipt summary, the masjid's name, my new contribution to the campaign bar if applicable — so that giving feels acknowledged, not transacted.
17. As a donor whose payment fails at the gateway, I want a failure screen with a retry that reuses everything I entered, so that a gateway hiccup costs me two taps, not a redo.
18. As a donor who closes the WebView mid-payment, I want the donation left pending and recoverable, so that abandonment isn't punishment.
19. As a donor who abandoned a payment, I want one gentle push later — "complete your ৳500 donation to X Masjid?" — deep-linking into a prefilled checkout, so that drop-offs can finish what they meant to do.
20. As a donor, I want an in-app confirmation and an email confirmation immediately after the server confirms, so that I have a durable record outside the app.
21. As a donor on a flaky connection, I want the app to keep polling and eventually resolve my donation's true state from the server, so that "did it go through?" always has an answer.
22. As a donor, I want every amount shown in Bengali numerals when my app language is Bengali (PRD 09), so that money reads the way I read.

### Campaigns
23. As a donor, I want active campaign cards on a masjid's profile with a progress bar, target, and amount raised, so that I can see what my masjid is building.
24. As a donor, I want my ৳500 to move the campaign bar by ৳500 — gross, like my receipt — so that the numbers I see always match.
25. As a campaign donor, I want a push when a campaign I gave to reaches its target, so that I share in the completion.
26. As a donor browsing a fully funded or ended campaign, I want it clearly marked and its donate path closed, so that I never give to a finished cause by accident.

### Recurring giving
27. As a regular giver, I want to set up a weekly or monthly donation of a fixed amount to a masjid, so that consistency doesn't depend on memory.
28. As a recurring giver, I want each cycle to arrive as a push — "your weekly ৳100 to X Masjid is due" — that opens a prefilled checkout needing only the gateway confirm, so that I stay in control of every charge while the app does the remembering.
29. As a recurring giver, I want to understand at setup that each cycle needs my confirmation — this is a reminder, not an auto-debit — so that the product never overpromises what the rails support.
30. As a Ramadan giver, I want a "last 10 nights" preset that schedules a nightly nudge for those dates, so that I never miss Laylat al-Qadr by forgetting.
31. As a recurring giver, I want to pause, resume, or cancel a schedule from the dashboard, so that commitments bend before they break.
32. As a recurring giver who ignores a cycle's nudge, I want the cycle to simply lapse with no penalty and no stacking of missed amounts, so that a quiet week doesn't become a debt.
33. As a recurring giver, I want my schedules listed with masjid, amount, frequency, and next-due date, so that I always know what's committed.

### Donation dashboard (§6)
34. As a donor, I want a Donations row on my Profile tab (PRD 09's reserved slot) opening my giving dashboard, so that my history has a permanent home.
35. As a donor, I want my full donation history, newest first, paginated, so that nothing I gave ever disappears.
36. As a donor, I want to filter history by masjid, category, status, and year, so that I can answer "what did I give to X last year?" in two taps.
37. As a donor, I want each history entry to show masjid, amount, category, date, and status — including pending, failed, and refunded honestly — so that the record is complete, not curated.
38. As a donor, I want lifetime, this-year, and per-masjid totals, so that my giving has a shape I can see.
39. As a donor, I want to download a PDF acknowledgment receipt for any completed donation, so that I hold proof issued by the NGO with its registration details and the transaction reference.
40. As a donor, I want an annual giving summary PDF for any year, so that one document covers a year of giving.
41. As a donor, I want my receipts to claim tax deductibility only if the NGO's approved status is confirmed (platform-flagged), so that no document in my name makes a false legal claim.
42. As an anonymous donor, I want my anonymous gifts fully visible in my own history and receipts, so that concealment from others never means concealment from me.
43. As a donor, I want my dashboard rendered cached-first with an offline banner when stale, so that my history is readable on a dead connection.
44. As a new donor with no history, I want an empty state that points me to give for the first time, so that the screen teaches instead of shrugs.

### Trust, transparency, and money out
45. As a masjid admin, I want a donations view scoped to my masjid — donor names where permitted, "Anonymous donor" where not, with gross/net amounts — so that I know what's been raised for us.
46. As a masjid admin, I want my masjid's current ledger balance (net donations minus recorded disbursements), so that I know what the NGO owes us.
47. As a platform admin, I want per-masjid balances across the platform, so that disbursement runs are driven by data, not requests.
48. As a platform admin, I want to record a manual disbursement (amount, date, method, reference) against a masjid's balance, so that every taka out is written down where auditors can find it.
49. As a platform admin, I want to issue a refund for a specific donation — triggering the gateway refund, marking it refunded, and reversing its campaign and balance effects — so that duplicate payments and disputes have a remediation path.
50. As a platform admin, I want a refund to be possible even when it drives a masjid's balance negative, with the negative balance offsetting future donations, so that already-disbursed funds don't block making a donor whole.
51. As a donor with a problem donation, I want to reach support from the donation's detail view (the existing support-ticket flow), so that disputes start with one tap and full context.
52. As the NGO, I want every donation row to carry gross, fee, and net from the moment of completion, so that reconciliation against SSLCommerz settlement reports is arithmetic, not archaeology.

### Cross-cutting
53. As a donor, I want donation-confirmed, recovery, nudge, and milestone pushes to ride my existing notification preferences (PRD 03/09), so that money notifications obey the same controls as everything else.
54. As a consistent giver, I want my completed donations to feed the Generous Giver badge counter (PRD 08 — months-with-a-donation, never amounts), so that consistency is recognised without giving becoming a leaderboard.
55. As a donor, I want the in-app store-review prompt to be eligible right after a donation success moment (per the cross-cutting polish rules), so that the app asks at its best moment, never its worst.
56. As a user of the donation flow in dark mode, Arabic RTL, or large fonts, I want every screen to respect PRD 09's theme tokens, RTL layout, and font scaling, so that the money path is never the unpolished path.

## Implementation Decisions

**Decisions from the grill session (2026-06-07), all binding:**

- **Merchant of record: the NGO.** One pooled SSLCommerz merchant account; per-masjid attribution lives in our ledger. Masjids onboard with zero payment setup. (LaunchGood model. Per-masjid merchant accounts rejected: operationally impossible at 300k masjids.)
- **Gateway: SSLCommerz hosted checkout in an in-app WebView.** Backend creates the session and hands the mobile app a gateway URL; success/fail/cancel redirect URLs are deep links back into the app. One integration covers bKash, Nagad, and cards; PCI/MFS data never touches our servers (regulatory requirement, not preference). Direct bKash/Nagad APIs rejected for MVP: three integrations, three merchant agreements.
- **The validated IPN is the sole source of truth.** Client redirects are navigation only. Every IPN is verified against the SSLCommerz validation API before any state change. The mobile app polls a status endpoint; "completed" appears only when the server says so.
- **Donation state machine:** `PENDING` (row created before the gateway session is handed out) → `COMPLETED` (validated IPN; same transaction also bumps campaign `raised_amount` and the masjid ledger balance) → `REFUNDED` (admin-initiated only). `PENDING` → `FAILED` on a failed IPN or via the stale-pending sweep; the sweep also emits the one recovery push. Completion is idempotent via a unique gateway transaction ID — a replayed or duplicate IPN is a no-op. These statuses are exactly the existing `DonationStatus` enum.
- **Recurring = schedule + nudge, never auto-charge.** Hosted checkout yields no token, so server-initiated charges are impossible; a schedule fires a push per cycle that opens a prefilled checkout. Missed cycles lapse silently — no stacking. "Last 10 nights" is a date-bounded nightly schedule preset. (Tokenization rejected: cards-only through SSLCommerz while bKash/Nagad dominate; bKash mandate API rejected: a second direct integration.)
- **Login required to donate** — PRD 01's email-OTP gate with post-login continuation. Every donation has an owner; guest donations rejected (orphaned rows, claiming flows, SMS receipts — real scope for an edge the 20-second gate mostly solves).
- **Anonymity is a per-donation visibility flag**, defaulted by PRD 09's setting: hidden from the masjid admin and all public surfaces, fully visible to the donor, resolvable by the platform for disputes and audit. Identity is never actually dropped.
- **Fees are deducted from the donation and disclosed pre-confirm.** Each donation stores gross / fee / net. Donor-facing numbers (history, totals, campaign progress) are **gross**; net appears only in NGO/masjid admin views. (NGO absorbing fees rejected: unfunded liability that scales with success. Donor-covers-fees checkbox rejected for MVP: the fee isn't knowable until the payment method is chosen inside the hosted page.)
- **Campaign progress updates atomically** — a single `raised_amount` increment in the completion transaction, decrement on refund, idempotent by transaction ID. No read-modify-write, no recompute-on-read.
- **Disbursement (MVP): ledger + manual recording.** Per-masjid balance = net completed donations − recorded disbursements. The NGO pays outside the system and records amount/date/method/reference. Balances may go negative after refunds. No payout API.
- **Receipts are NGO acknowledgments, not tax instruments.** NGO name, registration number, transaction ID, gross amount, masjid, category, date. Tax-deductibility wording renders only behind a platform-settings flag the NGO flips after confirming NBR approval. The annual document is a "giving summary" with the same gating. PDF generation is offloaded off the event loop per the backend's concurrency rules.
- **Refunds are admin-only**, entered through the existing support-ticket flow: admin triggers the gateway refund (or records a manual reversal), the donation becomes `REFUNDED`, and its campaign/balance effects reverse.
- **Campaigns are IN this MVP**, overriding the SDD's cut — the backend campaign stack already exists; mobile adds cards, progress, and donate-to-campaign. The `CAMPAIGN` category and `raised_amount` wiring would otherwise be dead code.

**Modules (backend follows the repository → service → route law):**

- **DonationLedger** *(deep — the core)*: the donation and disbursement models and the service owning the state machine, gross/fee/net arithmetic, atomic campaign/balance updates, transaction-ID idempotency, refund reversal with negative balances, and balance computation. Narrow interface (record-pending / complete / fail / refund / balance-of); everything money-correctness depends on lives behind it.
- **SslcommerzGateway** *(deep adapter)*: create-session → gateway URL, validate-IPN → verdict, refund. One stable interface hiding all gateway HTTP and credentials; swappable for a sandbox or a mock.
- **RecurringScheduleService** *(deep)*: schedule model plus two APScheduler sweeps (the scheduler and the announcement-publishing sweep precedent already exist): due-cycles → nudge pushes; stale pendings → `FAILED` + one recovery push. Pure date/cycle logic behind a simple interface.
- **ReceiptGenerator** *(deep)*: per-donation acknowledgment PDF and annual summary, executor-offloaded, tax-language flag honoured.
- **Donations router + IPN webhook** *(shallow)*: checkout-init, the IPN endpoint, donation status polling, history/totals dashboard endpoints, recurring CRUD, masjid-scoped and platform-scoped admin views, refund and disbursement-recording endpoints. HTTP in, service calls out, nothing else.
- **Mobile — DonationFlow**: amount chips, category/campaign, anonymity toggle, fee disclosure, WebView checkout with deep-link returns, status polling, success/failure/recovery states.
- **Mobile — DonationDashboard**: history with filters, totals, receipt download/share via the OS sheet, recurring manager. Mounts at PRD 09's reserved Profile row.
- **Mobile — Campaign surfaces**: campaign card + progress bar on the masjid profile (PRD 04's page), campaign detail, donate-to-campaign entry.

**Contracts and constraints:**

- Amounts are BDT only, validated server-side at ৳10–৳5,00,000 per transaction; decimal money columns, never floats.
- The donation row references its campaign optionally; category `CAMPAIGN` if and only if a campaign is attached.
- The IPN endpoint is unauthenticated by necessity but trusts nothing: every notification is re-verified against the validation API, and store-ID/amount/currency must match the pending row.
- New push message types — donation-confirmed, payment-recovery, recurring-nudge, campaign-milestone — ride PRD 03's token registry and fan-out, and obey PRD 09's notification controls.
- Donation completion emits the event PRD 08's BadgeEngine already listens for (Generous Giver months-counter).
- Masjid admin donation views apply the anonymity mask in the query layer, not the client.

## Backend Design

Concrete design for the backend subsystem, agreed 2026-06-07 (post-grill synthesis). Follows the repository → service → route law and the existing model conventions (bare-UUID GoTrue `user_id` with no FK, `String + CheckConstraint` enums, timezone-aware timestamps).

### Attribution — which donation belongs to what

Every donation row carries three attribution columns, resolved at creation and immutable after:

```
Donation
├── user_id      (always set — who gave; bare UUID from the GoTrue JWT, login-gated)
├── masjid_id    (always set — who receives; FK → masjids)
├── campaign_id  (nullable   — FK → masjid_campaigns)
└── category     (DonationCategory)
```

| Donation type | masjid_id | campaign_id | category |
|---|---|---|---|
| General donation to a masjid | from the request path | NULL | general/building/zakat/sadaqah/lillah (donor picks) |
| Campaign donation | **derived from the campaign row**, never client-supplied | set | forced to `CAMPAIGN` |

- DB CHECK: `(category = 'campaign') = (campaign_id IS NOT NULL)` — mismatched pairs are unrepresentable.
- Create-time integrity in the service: campaign must exist, be Active, within its date range, and belong to an Active masjid with `donations_enabled = true`. The masjid_id is copied from the campaign, so a client can never aim a campaign donation at the wrong masjid.
- All aggregation (masjid raised, user gave, campaign progress) is GROUP BY on these columns.
- Gateway correlation: the donation's UUID is the SSLCommerz `tran_id`; the IPN echoes it back, so IPN → donation lookup is by primary key, and `val_id`/amount/store-id from the validation API must match the row before any state changes.

### Schema — four new tables + one settings key

**donations** — the ledger's atom:

| Column | Type | Notes |
|---|---|---|
| donation_id | UUID PK | doubles as the gateway tran_id |
| user_id | UUID, NOT NULL, indexed | GoTrue identity, no FK (UserProfile convention) |
| masjid_id | UUID FK → masjids, NOT NULL, indexed | **ondelete=RESTRICT, not CASCADE** — financial records outlive masjid removal (soft status exists) |
| campaign_id | UUID FK → masjid_campaigns, NULL, indexed | ondelete=RESTRICT |
| category | String(20) + CHECK | existing DonationCategory values |
| status | String(20) + CHECK, default pending | existing DonationStatus values |
| gross_amount | Numeric(12,2), CHECK 10–500000 | what the donor paid |
| fee_amount | Numeric(12,2), default 0 | actual fee from the validated IPN |
| net_amount | Numeric(12,2), CHECK net = gross − fee | credited to the masjid |
| is_anonymous | Boolean, default false | visibility flag only |
| gateway_session_key | Text, NULL | |
| gateway_val_id | String, NULL, **UNIQUE** | the idempotency key — a replayed IPN no-ops here |
| gateway_payment_method | String, NULL | bkash/nagad/card brand |
| completed_at, refunded_at | DateTime(tz), NULL | |
| created_at, updated_at | standard | |

Indexes: `(user_id, created_at DESC)` history · `(masjid_id, status)` balances/admin · partial `(campaign_id)` where not null · `(status, created_at)` stale-pending sweep.

**recurring_schedules** — schedule_id PK · user_id · masjid_id FK · campaign_id NULL FK · category · amount · frequency (weekly/monthly/nightly) · start_date/end_date (end set only for the last-10-nights preset) · next_due_at (indexed) · status (active/paused/cancelled) · timestamps. **No FK from donations to schedules** — a nudge-completed donation is an ordinary donation; the schedule is purely a reminder engine (per the no-auto-charge decision).

**disbursements** — disbursement_id PK · masjid_id FK indexed · amount CHECK > 0 · method (bank/bkash/cash) · reference · disbursed_on · recorded_by_id · notes · created_at. **Balance is derived, never stored:** SUM(net of completed donations) − SUM(disbursements) per masjid — one aggregate, no drift, negative allowed by construction.

**donation_receipt_counters** — gapless per-year receipt numbers (e.g. MK-2026-000123) for PDFs; auditors dislike UUIDs.

**Platform settings** — new key `tax_deductible_receipts_enabled` (default false) gating the NBR wording.

**Campaigns** — no structural change; `raised_amount` gains its first writers: atomic `UPDATE … SET raised_amount = raised_amount + :gross` on completion, `− :gross` on refund, in the same transaction as the status flip.

### State machine (all transitions in the donation service, one transaction each)

```
create checkout  →  PENDING      (row inserted BEFORE the gateway session call;
                                  session-create failure → FAILED)
validated IPN ok →  COMPLETED    (fee/net set, campaign counter bumped,
                                  completed_at; idempotent on val_id)
IPN fail/cancel  →  FAILED
sweep (>24h old) →  FAILED       (+ one recovery push, flagged to never repeat)
admin refund     →  REFUNDED     (gateway refund → reverse campaign counter;
                                  only from COMPLETED)
```

Illegal transitions raise. FAILED is terminal — retry is a new donation, prefilled client-side.

### Module map (names by convention, one per layer)

| Layer | Additions | Responsibility |
|---|---|---|
| models | donation, recurring_schedule, disbursement | above; registered for autogenerate |
| repositories | one per model | raw queries only — incl. the atomic counter UPDATE and the balance aggregate |
| services | donation service (**DonationLedger**) · sslcommerz client (**SslcommerzGateway**, sibling of the GoTrue client) · recurring schedule service · receipt service | state machine + money math · gateway HTTP (async) · cycle logic · PDF via executor |
| routers | donations (user + IPN) · admin additions for refund/disbursement (the support.py dual-router pattern) | HTTP only |
| schemas / dependencies | per convention, separate Create/Response models | |
| core | two APScheduler jobs on the existing scheduler | recurring nudges (15-min cadence on next_due_at) · stale-pending sweep (hourly) |

### API contract

User-facing (JWT-gated):

```
POST   /masjids/{masjid_id}/donations          → create PENDING + gateway URL
POST   /campaigns/{campaign_id}/donations      → same, campaign-attributed
GET    /donations/{donation_id}                → status (the poll target; owner-only)
GET    /donations/{donation_id}/receipt        → PDF (completed only)
GET    /me/donations?masjid_id&category&status&year&cursor
GET    /me/donations/summary                   → lifetime / yearly / per-masjid totals
GET    /me/donations/annual-report?year        → giving-summary PDF
POST   /me/recurring-schedules                 → create (incl. last-10-nights preset)
GET    /me/recurring-schedules
PATCH  /me/recurring-schedules/{id}            → pause / resume / amount
DELETE /me/recurring-schedules/{id}            → cancel
```

Gateway (unauthenticated, rate-limited, validates everything):

```
POST   /payments/sslcommerz/ipn                → the only writer of COMPLETED
GET    /payments/sslcommerz/redirect/{outcome} → success/fail/cancel → deep link into app
```

Admin (role-gated per existing AdminRole dependencies):

```
GET    /admin/masjids/{id}/donations           → masjid-scoped; anonymity mask applied in the query layer
GET    /admin/masjids/{id}/balance             → derived balance (masjid_admin: own; platform_admin: any)
GET    /admin/balances                         → all masjids (platform_admin)
POST   /admin/masjids/{id}/disbursements       → record payout (platform_admin, AAL2)
POST   /admin/donations/{id}/refund            → gateway refund + reversal (platform_admin, AAL2)
```

### Migration

One Alembic autogenerate revision: three tables + receipt counter + indexes + CHECKs, with the platform-settings row seeded in the same revision's data step. Run direct-to-Postgres per the PgBouncer rule. No existing tables change.

### Build order (tracer bullet)

1. Models + migration + enum wiring
2. SSLCommerz client against the sandbox + its tests
3. Donation service create → PENDING → IPN → COMPLETED happy path + tests — **an end-to-end sandbox donation completes here**
4. Refund, disbursements, balance
5. History/summary endpoints
6. Recurring schedules + sweeps + pushes
7. Receipts (PDF, gated wording)

### Flagged, not decided

- Sandbox credentials must land in config env vars before step 2 is testable — an NGO/devops deliverable.
- The real fee is only known at validation time (`store_amount`), so the pre-confirm "masjid receives ~৳488" is an **estimate from a configured rate**; the ledger stores the actual fee and the two may differ by a taka or two. Copy should say "approx."

## Testing Decisions

These are the **first backend tests in the repository** — they establish the pattern: pytest with async support, tests assert *external behaviour through the module's public interface* (states, balances, returned verdicts, emitted effects), never internals (no asserting private calls or SQL shapes). The SSLCommerz boundary is faked at the HTTP/adapter seam, never monkeypatched mid-module.

Tested modules (money-path only, per scope decision):

- **DonationLedger** — the bulk of the suite: every legal and illegal state transition; completion bumps campaign and balance atomically; replayed/duplicate transaction IDs change nothing; gross/fee/net arithmetic; refund reverses campaign and balance and may go negative; balance-of sums net completed minus disbursements; disbursement recording.
- **SslcommerzGateway** — against a mocked HTTP layer: session creation success/failure, validation verdicts (valid, invalid, amount-mismatch, store-mismatch), forged-IPN rejection, refund call mapping.
- **RecurringScheduleService** — pure logic: next-due computation for weekly/monthly/bounded-nightly schedules, due-cycle selection, lapsed cycles don't stack, pause/resume/cancel effects, stale-pending expiry selection.

Not tested (deliberate): ReceiptGenerator (rendering churn makes content assertions brittle), shallow routers and dashboard queries, all mobile UI. Prior art: none — this suite is the precedent.

## Out of Scope

- **Zakat calculator** (SDD cut stands; the `ZAKAT` category ships, the calculator does not) and the Zakat tracker enhancement
- **Auto-charged recurring** in any form — tokenization, bKash mandates, saved payment methods; revisit post-MVP with real volume data
- **Donor-covers-fees checkbox**, round-up giving, share-after-donating card, donor wall, "year in giving" recap — fast-follows, not MVP
- **Automated payouts** (bKash B2B / bank APIs) — the manual disbursement record is the MVP
- **Self-serve refunds** — admin-only via support
- **Guest donations** — login-gated, full stop
- **Web admin panel UI** for any of this — endpoints only
- **Campaign authoring** — already exists server-side; admin-panel concern
- Multi-currency, foreign cards/diaspora giving, offline donation recording

## Further Notes

- **The IPN endpoint is the single most security-sensitive surface in the app.** It moves money state and is publicly reachable. The validation-API round-trip is non-negotiable on every notification, and the idempotency key is what makes gateway retries safe. Rate limiting per the existing middleware applies.
- **Sandbox first:** SSLCommerz provides a sandbox; all development and the test suite's recorded fixtures should come from it. Production credentials are an NGO deliverable, like the NBR flag.
- **Two NGO dependencies are config, not code:** the merchant credentials and the tax-language flag. Neither blocks the build.
- **Reconciliation:** SSLCommerz settlement reports are the external truth the ledger must be checkable against — the gross/fee/net columns exist so that this is a join, not a project.
- **The features doc needs two corrections** (tracked in Amends): backend stack is FastAPI, and the saved-payment-methods enhancement is infeasible under hosted checkout.
- PRD 07's pattern of riding existing subsystems continues here: no new push infrastructure, no new gate component, no new profile navigation — this PRD fills slots the previous five PRDs deliberately left.
