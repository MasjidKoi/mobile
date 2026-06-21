# MasjidKoi Mobile — Screen Implementation Plan & Build Order

> **Purpose:** a dependency-aware order for implementing all mobile screens so nothing
> is built against an unbuilt dependency. Derived from the 8 PRDs (`docs/prds/`), the
> Pencil design (`design/mobile.pen`, 124 screens), the implemented backend
> (`../backend`), and an audit of the current mobile codebase.
>
> _Last synthesized: 2026-06-21._

---

## 0. TL;DR — what to build first

1. **Foundation infra (no screens):** env/config, HTTP client + auth-refresh, secure token storage, React Query, i18n + locale formatting, theme/dark-mode/RTL/accessibility engine, native libs (maps, location, notifications), forms. **Everything depends on this — do it first.**
2. **Auth + App Shell:** AuthSession, LoginGate + GuestStore, the 4-tab navigation shell, and the auth/permission screens. **Gates all logged-in actions and all navigation.**
3. **Discovery & Map** (first real data vertical — creates the masjid route + shared location/masjid data layer).
4. **Prayer Times / Home** (the landing surface; also builds the **push subsystem** that 5 later features ride on).
5. **Masjid Profile** (the convergence host for donate bar, reviews, check-in, campaigns).
6. **Donation → Donation Dashboard.**
7. **Community** (feed/follow = MVP; events/reviews/check-in = post-MVP slice).
8. **Settings screens** (engine is in step 1; screens can slot in any time after auth).
9. **Gamification** (post-MVP, mostly self-contained — build last).

The critical path is **1 → 2 → 3 → 4 → 5 → 6**. Everything else branches off Profile (5).

---

## 1. Current state (the three inputs)

### Backend — effectively feature-complete ✅
Code-verified in `../backend/app` against `BACKEND_REMAINING_WORK.md` (current) over the older
`docs/BACKEND_API_GAPS.md` (backlog). Live routers (not stubs) exist for **every** feature domain:
Auth/OTP, Masjids/Discovery (PostGIS nearby + search), Prayer Times (+Jumu'ah, Hijri offset),
Donations + Campaigns + Recurring + Receipts, Feed/Announcements/Events/RSVP/Reviews/Q&A/Follow,
Submissions, Community Photos, Gamification/Streaks/Journal/Goals, Settings/Notification-prefs/Devices.

| Aspect | Reality |
|---|---|
| **Consumer auth** | **Passwordless EMAIL-OTP.** `POST /auth/otp/request` → `POST /auth/otp/verify` (returns `access_token`, `refresh_token`, `is_new_user`). No phone/SMS, no social, no guest tokens. |
| **Token model** | GoTrue HS256 JWT, locally verified. Refresh `POST /auth/refresh`, logout `POST /auth/logout`. Consumer role `app_user`. |
| **Base URL** | `http://localhost:8001` in dev. **No `/api/v1` prefix** — routers mount at root (`/auth`, `/masjids`, `/users/me`, `/donations`, …). |
| **Deep-link scheme** | Backend emits **`masjidkoi://`** (e.g. `masjidkoi://donation/{id}?status=...`). |
| **Guest mode** | A purely mobile concern — public endpoints (nearby, search, prayer times, profile, reviews-read, app-config) need no auth; 8 actions require Bearer JWT. |

### Mobile — presentational scaffold only ⚠️
`app/` has just 4 route files. The ~52 components in `components/` are a **polished but 100% presentational** design-system kit (props in → JSX out, zero data wiring). Onboarding carousel is functional; `app/(app)/home.tsx` is a placeholder.

**Does NOT exist yet:** API client, auth/session/token storage, tab/nav shell, React Query, i18n
framework, maps, location, notifications, payments, forms, env/config. **All foundation.**

**Already installed (usable now):** `expo-router`, `@react-navigation/*` (unused), AsyncStorage,
Hind-Siliguri fonts (bn/en), `@expo/vector-icons`, `expo-image`, `expo-linear-gradient`,
`expo-haptics`, `expo-linking`, `expo-web-browser`, `react-native-reanimated`/`-gesture-handler`.

### Design — 124 screens across 9 feature areas
`design/mobile.pen`: 124 numbered screen frames + 50 reusable components (mapped 1:1 to the
existing `components/`). The numbering **already encodes a sensible build order** (Discovery 13–19 →
Profile 20–34 → Donation 35–48 → Dashboard 49–55 → Settings 56–74 → Community 75–91 →
Gamification 92–111). Nearly every feature ships explicit **Offline / Empty / Guest / Denied / Rate-limited**
variants — budget for these; they are first-class, not afterthoughts.

---

## 2. Guiding dependency principles

1. **Foundation before features.** No screen renders without config + API client + theme/i18n + nav shell. These have no UI but block 100% of screens.
2. **Auth is one shared authority.** `AuthSession` + a single `LoginGate(requireAuth(action))` gate exactly **8 actions**: Donate, Follow, Submit-a-masjid, Upload-photo, Ask-question, RSVP, Write-review, Check-in. (Suggest-an-edit is **not** gated.) Build the gate once; reuse everywhere.
3. **Guest-first ("Yelp pattern").** Everything read-only works for guests; login is requested only at the 8 gated actions. So Discovery/Prayer/Profile **read paths can ship before deep auth work is finished**.
4. **Profile is the convergence point.** The masjid profile is the destination for map pins, search, share/deep links, and the host for prayer-times section, donate bar, campaigns, reviews, announcements, and check-in. Build a minimal profile early (backend-first), then layer hosted features onto it.
5. **Prayer Times secretly owns the push subsystem.** Token registry + fan-out + local-notification machinery are built here and consumed by Donation, Community, Profile, and Gamification. If push slips, each consumer degrades gracefully to pull/local-only (build now, finalize creds before launch).
6. **i18n / RTL / theme tokens / accessibility are foundations, not a settings feature.** Lift strings + locale formatting + semantic color tokens **before** building 50 screens, or you retrofit all of them (PRD 09's explicit call).
7. **Backend readiness is NOT the bottleneck.** Only the Share feature lacks a backend. Everything else is code-ready (donations against SSLCommerz sandbox, push against the Expo transport once `PUSH_ENABLED=true`).

---

## 3. The build order (phased)

| Phase | Theme | Screens | MVP? | Blocks → |
|---|---|---|---|---|
| **0** | Foundation infra | 0 (infra) | ✅ | everything |
| **1** | Auth + App Shell | 13 | ✅ | all gated actions, all nav |
| **2** | Shared data layer | 0 (infra/hooks) | ✅ | Discovery, Prayer, Profile |
| **3** | Discovery & Map | 7 | ✅ | Profile route |
| **4** | Prayer Times / Home | 13 | ✅ | push consumers, Profile times |
| **5** | Masjid Profile + contributions | 15 | ✅ | Donation, Community hosting |
| **6** | Donation + Dashboard | 21 | ✅ | — |
| **7** | Settings (screens) | 19 | ✅ (core) | hosts Dashboard/Journal rows |
| **8** | Community | 17 | ◑ (feed+follow only) | — |
| **9** | Gamification | 19 | ✗ post-MVP | — |

Total = 124 screens. Phases 0–7 + the feed/follow slice of 8 ≈ **MVP**.

---

### Phase 0 — Foundation infra (no screens)
**Why first:** every screen depends on these; none depend on each other, so build in one sweep.

- [ ] **Env/config layer** — `app.config.ts` (or `app.json extra` + `expo-constants`) exposing `EXPO_PUBLIC_API_BASE_URL`. Dev = `http://localhost:8001`; **no version prefix**, mounts at root. (Physical-device testing needs a LAN IP / tunnel, not `localhost`.)
- [ ] **HTTP client + API module** — typed fetch/axios wrapper: base URL, error normalization, Bearer-header injection, **401 → refresh → retry** (port the pattern from the Next.js web app at `../frontend/src/lib/`).
- [ ] **Secure token storage** — install `expo-secure-store` (current onboarding flag uses plain AsyncStorage — not for tokens).
- [ ] **Server-state cache** — `@tanstack/react-query` + `QueryClientProvider` in `app/_layout.tsx`; establish query-key + hook conventions.
- [ ] **i18n bootstrap + LocaleFormat** — Bengali hard default; English/Arabic switchable later. One shared number/currency/time formatter (**Bengali numerals** ১২:৩০) that **all** screens render through. Lift hardcoded Bangla strings into a strings module now.
- [ ] **Theme/dark-mode/RTL/accessibility engine** — semantic color tokens (no hardcoded colors), logical-style RTL rule, 44pt/AA/font-scale checklist. Wire `NavigationColors`/`ThemeProvider` from `constants/theme.ts`.
- [ ] **Native libs (config-plugin wiring)** — `react-native-maps`, `expo-location` (permission flows), `expo-notifications`. Do as foundation because they need native config.
- [ ] **Forms** — `react-hook-form` + `zod` (feeds existing `Input`/`OtpInput`).
- [ ] **🔧 Fix deep-link scheme mismatch** — `app.json` `scheme` is `"mobile"` but backend emits `masjidkoi://`. **Unify to `masjidkoi`** now — blocks donation redirect return, notification deep-links, and share.

---

### Phase 1 — Auth + App Shell (13 screens)
**Depends on:** Phase 0. **Unblocks:** every gated action + all navigation.

- [ ] **AuthSession + context** — store tokens (secure-store), refresh, expose `useAuth()`; introduce an `(auth)` route group + auth gate.
- [ ] **LoginGate + GuestStore + migration** — `requireAuth(action)` wrapper; on-device guest favourites/reminders; guest→account migration on first login.
- [ ] **Navigation shell** — `app/(app)/_layout.tsx` with `Tabs` (or custom `tabBar` driven by the existing presentational `NavBar`). Final tabs: **Home · Explore · Feed · Profile.** Per-tab stacks; create the navigable `masjid/[id]` profile route now (stub).
- [ ] Wire the **already-built onboarding intro** → Login Gate.

**Screens:** `01 Intro – Find Masjid` `[oEfsr]` · `02 Intro – Prayer Times` `[n8NNNK]` · `03 Intro – Qibla` `[TfWTi]` · `04 Intro – Donate` `[BYwXW]` · `05 Login Gate` `[E4qCGE]` · `06 Email Entry` `[E4sl76]` · `07 OTP Entry` `[o43ylC]` · `08 OTP Error` `[BqRY8]` · `09 Profile Setup` `[sIW5i]` · `10 Location Explainer` `[fD4Av]` · `12 Notification Explainer` `[EmygA]` · `92 Login Gate (community)` `[wiae0]` · minimal **Profile tab** landing.

> ⚠️ **Auth is EMAIL-OTP** (backend + Pencil agree). The features doc's "phone/SMS OTP" is outdated — build email. Don't build auto-read-OTP (PRD rejects it for email login).

---

### Phase 2 — Shared data layer (no screens)
**Why separate:** Discovery (3) and Prayer/Home (4) both need these. Build once.

- [ ] **LocationResolver** — the single location authority (GPS + permission state + city/district fallback). Used by map, nearest-masjid, qibla.
- [ ] **MasjidApiClient + cached-first store** — `GET /masjids/nearby`, `/masjids/search`, `/masjids/{id}` with offline cache (MMKV). Pins/favourites/recents/nearest all read from here.
- [ ] **PrayerClock hook** — derives countdown / next-prayer from `/masjids/{id}/prayer-times`; consumed by Home card, profile times section, map "Jumu'ah soon" badges later.

---

### Phase 3 — Discovery & Map (7 screens)
**Depends on:** Phase 2 (location + masjid API), Phase 0 (maps). **Guest-OK** except Submit. **Unblocks:** Profile route.

**Screens:** `13 Explore – Map` `[HBnR1]` · `14 Explore – Peek Card` `[HRwR2]` · `15 Explore – List` `[yQ031]` · `16 Search` `[ueMIi]` · `17 Submit Masjid` `[TisPH]` 🔒 · `18 Dedupe Check` `[I0xEjK]` · `19 My Submissions` `[yj0pw]`. Plus `11 City Picker` `[guMMn]` (location-denied fallback) and the `NearestMasjidCard` component.

- Peek card / list / search all **navigate to the `masjid/[id]` profile route** (stubbed in Phase 1, filled in Phase 5).
- Submission pipeline (`POST /masjids/submissions` + `/submissions/photo`) is 🔒 LoginGate-gated.
- MVP-safe polish here: bottom-sheet peek, cached-first pins, optimistic favourites.

---

### Phase 4 — Prayer Times / Home (13 screens)
**Depends on:** Phase 2 (PrayerClock + masjid layer), Phase 0 (notifications). **This phase builds the push subsystem** consumed by 5 features.

**Screens:** `01 Home – Prayer Times` `[gYPlF]` · `02 Home – Travel Mode` `[eedu9]` · `03 Home – Offline` `[BE6ju]` · `04 Home – Jumu'ah` `[cqFaE]` · `05 Home – Calculated (Guest)` `[KOSlx]` · `06 Home – Ramadan Mode` `[sYwsL]` · `07 Masjid – Times Section` `[WaAQS]` (reused by Profile) · `08 Hijri Calendar` `[Q45Hl]` · `09 Qibla – Compass` `[MgV0U]` · `10 Qibla – Calibration` `[MvDGd]` · `11 Prayer Reminders Settings` `[NwcA4]` · `12 Azan Sound Settings` `[HjiLA]` · `13 Ramadan Reminders` `[K9KY3S]`.

- **Push token registration** (`POST /users/me/devices`) + local notification scheduling. Real delivery is config-gated (`PUSH_ENABLED=true` + `EXPO_ACCESS_TOKEN` + FCM/APNs creds) — register tokens & set prefs now, deliver later.
- Hijri offset comes from `GET /app-config` (public). Qibla is on-device (offline).

> The guest "Calculated Home" `[KOSlx]` can ship as the **landing surface early** with non-masjid calculated times, then enrich with masjid-linked times once Phase 2/3 land.

---

### Phase 5 — Masjid Profile + contributions (15 screens)
**Depends on:** Phase 3 (route + nav-in), Phase 4 (embedded times section). **Backend-first:** ship the profile against existing API, then layer contributions. **Hosts** the Donate bar (Phase 6), reviews/announcements/check-in (Phase 8).

**Screens:** `20 Masjid Profile – Full` `[IigOd]` · `21 Profile – Sparse/Unclaimed` `[YI9jG]` · `22 Verified Badge Explainer` `[CKpII]` · `23 Gallery Viewer` `[zdZcp]` · `34 Profile – Offline/Stale` `[Yjqhp]` · `24 Login Gate – Contribute` `[kgS1o]` · `25 Add Photo – Upload` `[ey07X]` 🔒 · `26 Add Photo – Submitted` `[GvKsJ]` · `27 Add Photo – Rate Limited` `[UcJti]` · `28 Ask a Question – Form` `[nz8ce]` 🔒 · `29 Ask a Question – Sent` `[eBIDN]` · `30 Suggest an Edit – Field Picker` `[t1Qg13]` · `31 Suggest an Edit – Describe` `[NebYn]` · `32 My Photo Submissions` `[JWSyq]` · `33 My Questions` `[OXH8Q]`.

- Profile content: `GET /masjids/{id}` (header, facilities, imam, contact, gallery) + embedded times section + `GET .../campaigns` + `GET .../questions` (answered) + `GET .../reviews`.
- 🔒 gated: Upload-photo, Ask-question. **Not gated:** Suggest-an-edit.

---

### Phase 6 — Donation + Dashboard (21 screens)
**Depends on:** Phase 5 (donate bar + campaign cards live on Profile), Phase 1 (LoginGate), Phase 0 (deep-link fix + `expo-web-browser`). **Backend ready against SSLCommerz sandbox.**

**Donate flow (14):** `35 Donate Amount` `[esA95]` · `36 Donate Validation` `[iWyQW]` · `37 Name Collection` `[Hvdbw]` · `38 Donate Campaign` `[NZjDr]` · `39 SSLCommerz Checkout` `[Moxrf]` · `40 Confirming Payment` `[Qf5Nk]` · `41 Donation Success` `[V3yTY8]` · `42 Payment Failed` `[EP0nf]` · `43 Payment Recovery` `[KxaYH]` · `44 Campaign Detail` `[F3K1cT]` · `45 Campaign Funded` `[U9krU]` · `46 Recurring Setup` `[B4KRW]` · `47 Last 10 Nights` `[WTgvH]` · `48 Recurring Nudge` `[ygkOO]`.

**Dashboard (7):** `49 Donations Dashboard` `[wApLr]` · `50 History Filters` `[H8TxGR]` · `51 Donation Detail` `[ovp86]` · `52 Receipt PDF` `[CTcra]` · `53 Recurring Manager` `[X8Rj2v]` · `54 Dashboard Empty` `[zFkCY]` · `55 Dashboard Offline` `[gu7Hm]`.

- Flow: amount/category/anonymity → `POST /masjids/{id}/donations` (or `/campaigns/{id}/donations`) → WebView/`openAuthSessionAsync` to SSLCommerz → `masjidkoi://donation/{id}` return → poll `GET /donations/{id}` (confirming) → success/failed/recovery.
- Dashboard mounts at the Profile-tab reserved row. Receipts/annual-report are server-rendered PDFs.
- **Don't build saved-payment-methods** (infeasible under hosted checkout — PRD rejects it). **Zakat calculator is post-MVP** (category ships, calculator doesn't).
- **Config gate before prod:** real `SSLCOMMERZ_STORE_ID/PASSWORD` + prod base URL; NBR receipt wording behind `tax_deductible_receipts_enabled`.

---

### Phase 7 — Settings screens (19 screens)
**Depends on:** Phase 0 engine (theme/i18n/RTL already exist) + Phase 1 (Profile tab). **Flexible** — can slot in any time after auth; placed here because its rows host Phase 6 (Dashboard) and Phase 9 (Journal). A minimal Profile tab already shipped in Phase 1.

**Screens:** `56 Profile Signed In` `[wNzOe]` · `57 Profile Guest` `[dNyMZ]` · `58 Settings Hub` `[B0Q4F]` · `59 Edit Profile` `[rY0Gr]` · `60 Appearance` `[i0mIM]` · `61 Appearance Dark` `[FgKEL]` · `62 Language Region` `[sFEs4]` · `63 Arabic Restart` `[mEjKy]` · `64 Notifications` `[xgRQ8]` · `65 Notifications Denied` `[mzAY5]` · `66 Storage Offline` `[oZrUO]` · `67 Clear Cache Confirm` `[kpWoy]` · `68 Privacy Data` `[f526e]` · `69 Download Progress` `[mCDon]` · `70 Download Error` `[d7UzP]` · `71 Delete Consequences` `[CBWfB]` · `72 Delete Confirm` `[TjnJ7]` · `73 Account Deleted` `[tsBtk]` · `74 About` `[b5F2DK]`.

- Notifications screen is the **container** that absorbs prayer reminders (Phase 4) + followed-masjid prefs (Phase 8). Account deletion → `DELETE /users/me` (soft-delete 202, 30-day purge → drops to guest). Data export → `GET /users/me/export`.

---

### Phase 8 — Community (17 screens) — vertical slices
**Depends on:** navigable masjid routes (feed slice is otherwise independent); Profile (reviews/check-in); Phase 4 push (instant/digest only). Build as slices so the pull-based core ships before push.

- **Slice ① Feed + Follow (MVP):** `75 Feed Announcements` `[L4NpG]` · `76 Feed Events` `[kDH3L]` · `77 Feed Empty` `[eeJcI]` · `78 Feed Guest` `[LjNM3]` · `79 Feed Offline` `[i0KwY]` · `80 Announcement Detail` `[KJBRJ]` · `83 Masjids I Follow` `[Ku4V5]` · `84 Notif Preferences` `[f4oV3c]`. (`GET /users/me/feed`, `POST .../follow`.)
- **Slice ② Events/RSVP (post-MVP):** `81 Event Detail` `[xroaP]` · `82 Event Detail Going` `[el27J]` 🔒 RSVP.
- **Slice ③ Reviews (post-MVP):** `85 Reviews List` `[j48xC]` · `86 Write Review` `[YTlSK]` 🔒 · `87 Write Review Low` `[JuPCG]` · `88 Review Prompt` `[g7HDnM]` (behaviour-gated) · `91 Profile Community` `[LR7Q0]`.
- **Slice ④ Check-in (post-MVP, feeds Gamification):** `89 Check-in Success` `[a7B6hg]` 🔒 · `90 Check-in Too Far` `[w8amt]` (100m server-enforced).

---

### Phase 9 — Gamification (19 screens) — post-MVP, mostly self-contained
**Depends on:** auth + journal API (self-contained). Soft deps: Generous-Giver badge ← Donation; Community Pillar ← check-ins/reports/photos; nudges ride Phase 4 local-notifications; day-finalization reads PrayerClock (display only). Ships in two releases (R1 ≈ Dec 2026, R2 ≈ Jan 2027).

**Screens:** `93 Journal – Today` `[y3XlLl]` · `94 Un-log Prayer` `[TZM7R]` · `95 Check-in Prefill` `[gfshZ]` · `96 Log Qur'an` `[e5Qrut]` · `97 Streak Detail` `[BDVuu]` · `98 Exempt Mode` `[xzLwt]` · `99 Freeze Applied` `[W53tRz]` · `100 Milestone 40 Days` `[dG50e]` · `101 Journal History` `[g8hxKk]` · `102 Day Detail` `[vG5Px]` · `103 Badge Gallery` `[d5SCg]` · `104 Badge Detail` `[m1a3g]` · `105 Badge Earned` `[CyCgQ]` · `106 Goals List` `[lVgvp]` · `107 Goal Templates` `[Q37kCu]` · `108 Goal Detail (Khatm)` `[wP9q2]` · `109 Create Custom Goal` `[R3tkV5]` · `110 Weekly Reflection` `[zlVYw]` · `111 Journal Setup` `[mS4cl]`.

---

## 4. Dependency graph (cross-feature edges)

```
Phase 0  Foundation (config · http+refresh · secure-store · react-query · i18n/locale · theme/RTL/a11y · maps/location/notif · forms · deep-link fix)
   │  (everything below requires all of Phase 0)
   ▼
Phase 1  Auth (AuthSession · LoginGate · GuestStore) + Nav Shell (4 tabs) + Auth/Permission screens
   │      └── LoginGate gates 8 actions: Donate, Follow, Submit, Upload-photo, Ask-Q, RSVP, Write-review, Check-in
   ▼
Phase 2  Shared data layer (LocationResolver · MasjidApiClient+cache · PrayerClock)
   ├──────────────► Phase 3 Discovery & Map ──► creates masjid/[id] route
   │                                                   │
   └──────────────► Phase 4 Prayer/Home ──► builds PUSH SUBSYSTEM ──┐
                                                   │                 │ (push consumers, soft)
                                                   ▼                 │
                          Phase 5 Masjid Profile (convergence host) ◄┘
                                 │  hosts ▼            ▲ reuses Phase 4 times section
                    ┌────────────┼─────────────┬──────────────┐
                    ▼            ▼             ▼              ▼
              Phase 6        Phase 8 ②③④   Phase 8 ① Feed   (Phase 9 soft:
              Donation       Events/Reviews/  + Follow         Generous-Giver←6,
              →Dashboard     Check-in (→9)    (MVP)            Pillar←8, nudges←4)
                                                   
Phase 7  Settings screens — engine in Phase 0; screens slot in after Phase 1.
         Notifications screen absorbs prayer-reminders(4) + followed-masjid prefs(8).
         Profile rows host Dashboard(6) + Journal(9) — stub rows until those land.
```

---

## 5. Critical path & parallel lanes

**Critical path (must be sequential):** `0 → 1 → 2 → 3 → 4 → 5 → 6`.

Once **Phase 5 (Profile)** exists, work can fan out in parallel lanes:
- **Lane A:** Donation (6) → Dashboard.
- **Lane B:** Community feed/follow (8①), then events/reviews/check-in (8②③④).
- **Lane C:** Settings screens (7) — independent after auth.
- **Lane D:** Gamification (9) — independent except soft badge/nudge hooks.

Phase 7 (Settings) and Phase 8① (Feed) have the fewest upstream deps and can begin as soon as the
shell + API client exist if you want early parallelism — Feed only needs navigable masjid routes,
Settings only needs auth + the Phase 0 theme/i18n engine.

---

## 6. MVP cut line

**MVP = Phases 0–7 + Community Slice ① (feed + follow).** Per the features-doc rule
("sections 1–6 minus campaigns/Zakat-calc + announcements & follow + core settings"), with the
PRD overrides applied:

- **IN MVP:** all auth/onboarding; full Discovery incl. submission pipeline; prayer times + reminders + Qibla + Ramadan; full profile incl. photos/Q&A/suggest-edit; **donations incl. campaigns** (PRD overrides the SDD cut); donation dashboard/receipts/recurring; announcements + follow; core settings.
- **POST-MVP:** Gamification (all of Phase 9); Events/RSVP, Reviews, Check-in (Phase 8 ②③④); Zakat calculator; offline map tile regions; home/lock-screen widgets; voice packs; saved payment methods; donor wall / year-in-giving recap.

---

## 7. Blockers, config gates & discrepancies to resolve

| Item | Type | Action |
|---|---|---|
| **Share masjid / OG preview / `.well-known` app-links** | ❌ true backend gap | No backend + needs a production domain. **Defer the Share affordance entirely** — everything else in Discovery works. |
| **Deep-link scheme mismatch** (`app.json: mobile` vs backend `masjidkoi://`) | 🔧 mobile fix | Unify to `masjidkoi` in **Phase 0** — blocks donation return, notif deep-links, share. |
| **Auth = email-OTP, not phone/SMS** | ⚠️ doc discrepancy | Build email-OTP (backend + Pencil agree). Features-doc "phone OTP" is outdated. Drop auto-read-OTP. |
| **Push delivery** | 🟡 config gate (not code) | Code-ready. Register tokens + set prefs now; live delivery needs `PUSH_ENABLED=true` + `EXPO_ACCESS_TOKEN` + FCM/APNs creds before launch. |
| **Live payments** | 🟡 config gate (not code) | Full flow works on SSLCommerz **sandbox** now. Prod needs real store creds + base URL; NBR receipt wording behind `tax_deductible_receipts_enabled`. |
| **API base URL on device** | ⚠️ dev ergonomics | `localhost:8001` only works in simulator. Use LAN IP / tunnel for physical devices. No `/api/v1` prefix — mount at root. |
| **Component kit normalization** | 🧹 minor | `PrayerTable` sits in the Discovery kit; Settings Card/Switches in the Community kit. Normalize during wiring. |

---

## 8. Immediate next steps (suggested first PRs)

1. **PR-1 (Phase 0a):** env/config + HTTP client with 401-refresh + `expo-secure-store` + React Query provider. Fix deep-link scheme. _No UI._
2. **PR-2 (Phase 0b):** i18n + LocaleFormat (Bengali numerals) + theme/dark-mode/RTL token engine + accessibility checklist. Install maps/location/notifications/forms with config plugins.
3. **PR-3 (Phase 1):** AuthSession + LoginGate + GuestStore; 4-tab shell using `NavBar`; wire intro → login; ship `06 Email Entry` / `07 OTP Entry` / `08 OTP Error` / `09 Profile Setup` + permission explainers; minimal Profile tab.
4. **PR-4 (Phase 2+3):** LocationResolver + MasjidApiClient + cached store; then Explore Map/List/Search/Peek + City Picker; stub `masjid/[id]` route.
5. **PR-5 (Phase 4):** Home prayer card + PrayerClock + reminders + push-token registration; Qibla; Hijri.
6. **PR-6 (Phase 5):** Full masjid profile + contribution flows.
7. **PR-7+ :** Donation (sandbox) → Dashboard; then fan out to Community feed, Settings, Gamification.
