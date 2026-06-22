# Plan — Connecting the Donation Backend to the Mobile App

> Scope: how to wire the completed PRD 05 donation backend into the Expo/React Native
> app. This is a plan, not an implementation. Backend contract below is the **real**
> shipped contract (verified against `backend/app/routers/donations.py`).

## The honest starting point

The backend donation subsystem is **done and verified**. The mobile app is
**greenfield except onboarding** — `app/` has only `index.tsx`, `onboarding.tsx`,
`_layout.tsx`, and a placeholder `(app)/home.tsx`. There is **no API client, no
auth/session, no server-state layer, no push, no i18n** yet. So "setting up donations"
means: build the thin foundation the whole app needs, then layer donations on top.

You don't start from zero:

- **Design system exists**: `components/DonateBar.tsx`, `components/CampaignCard.tsx`,
  `Text`, `Button`, `AppBar`, `Dialog`, `BottomSheet`, full theme tokens
  (`constants/tokens.ts`, `constants/theme.ts`), and the Hind Siliguri Bengali font.
- **Reference implementation exists**: the Next.js web app at `../frontend/src/lib/`
  has a production-grade axios client (bearer interceptor + 401-refresh-retry) and
  token modules — port the *shape*, swap `localStorage` → `expo-secure-store`.
- **`expo-web-browser` is installed** — its `openAuthSessionAsync` is the ideal
  primitive for hosted checkout (cleaner than a WebView).

---

## Layer 0 — Config glue (do this first; it's what trips people up)

These three must line up or nothing connects:

| Concern | Reality | Action |
|---|---|---|
| **Deep-link scheme** | `app.json` has `scheme: "mobile"`; backend `.env` has `APP_DEEP_LINK_SCHEME=masjidkoi` | Pick one and set both equal (recommend `masjidkoi`). The backend 303-redirects to `{scheme}://donation/{id}?status=…`; the app's deep-link config and the `openAuthSessionAsync` returnUrl must use the same scheme. |
| **Public reachability** | A physical device can't reach `localhost`, and **SSLCommerz must reach your IPN URL from the public internet** | In dev, run one tunnel (`ngrok http 8000` / cloudflared). Set backend `PUBLIC_API_BASE_URL` to that HTTPS URL and point the mobile API base at the **same** URL. The gateway success/fail/IPN callback URLs are built from `PUBLIC_API_BASE_URL`, so it must be public. |
| **SSLCommerz registered URL** | Sandbox store registered to `portfolio.ihemal.workers.dev` | Sandbox is lenient; if sessions get rejected, update the registered URL in the SSLCommerz sandbox panel to your tunnel domain. |

---

## Layer 1 — App foundation (prerequisites for donations)

1. **Config module** — `lib/config.ts` reading `expo-constants` `extra` (or
   `EXPO_PUBLIC_*` env): `apiUrl`, `appEnv`. Mirrors `../frontend/src/lib/config.ts`.
2. **API client** — `lib/api/client.ts`: a fetch/axios singleton that attaches
   `Authorization: Bearer <token>` and does 401 → refresh → retry. Port the frontend
   pattern.
3. **AuthSession** — email-OTP login per PRD 01: `POST /auth/otp/request` →
   `POST /auth/otp/verify` → `{access_token, refresh_token}` stored in
   **`expo-secure-store`**; silent refresh via `POST /auth/refresh`.
   ⚠️ *Verify these consumer OTP endpoints exist in the backend `auth` router — PRD 01
   specs them; if missing, they're a backend prerequisite.*
4. **LoginGate** — a modal any auth-gated action (Donate) triggers, with **post-login
   action resumption** (resume the donation flow after sign-in). PRD 01's core promise.
5. **Server-state** — add `@tanstack/react-query` and a `QueryClientProvider`. Gives
   status-polling, cache invalidation, and mutation ergonomics the donation flow leans on.

---

## Layer 2 — Donation feature

**Typed API + hooks** (`lib/api/donations.ts` + `hooks/`) against the real endpoints
(see corrected contract below). Query-key convention: `['donation', id]`,
`['me','donations', filters]`, `['me','donations','summary']`,
`['me','recurring-schedules']`, `['masjid', id, 'campaigns']`.

### 1. DonationFlow screen (`app/(app)/donate/[masjidId].tsx` + a campaign variant)

- Amount chips ৳50/100/500/1000 + custom; client-validate ৳10–৳5,00,000.
- Category picker (general/building/zakat/sadaqah/lillah) — **omitted for campaign
  donations** (backend forces `campaign`).
- Anonymity toggle (default from the PRD 09 privacy setting).
- Fee disclosure: show `estimated_net` from the create response as
  "X Masjid receives ~৳488".
- First-time donor: collect `donor_name` once.
- Confirm → `POST /masjids/{id}/donations` (or `/campaigns/{id}/donations`) → get
  `gateway_url` → `WebBrowser.openAuthSessionAsync(gateway_url, Linking.createURL('donation/<id>'))`.

### 2. Return + status resolution (truth comes from the server, never the redirect)

- When the auth session resolves (or the deep link fires), show a **"confirming…"**
  state and poll `GET /donations/{id}` (`refetchInterval` ~2s) until
  `status === "completed"` → success screen (receipt summary, campaign bar bump), or
  `failed` → retry screen reusing the entered values.
- Register a deep-link route for `masjidkoi://donation/{id}?status=…` so the recovery
  push and the redirect land in the right screen.

### 3. Wire the existing components

- `DonateBar` (sticky) on the masjid profile → opens DonationFlow. **Hide it entirely**
  when the masjid has `donations_enabled = false`.
- `CampaignCard` on the profile (fed by `GET /masjids/{id}/campaigns`, gross
  `raised`/`target`) → tap routes to the campaign donation flow; show "Funded"/"Ended"
  and close the donate path.

### 4. DonationDashboard (Profile-tab "Donations" row, PRD 09)

- History: `GET /me/donations` with filters + **keyset cursor** (`next_cursor` is a
  timestamp; pass it back as `cursor`).
- Totals: `GET /me/donations/summary`.
- Recurring manager: list/create/pause/resume/cancel via `/me/recurring-schedules`; the
  "last 10 nights" preset = `frequency: "nightly"` with `start_date`/`end_date`.
- Receipt + annual-report PDFs: `GET /donations/{id}/receipt` and
  `GET /me/donations/annual-report?year` return **binary PDF with a Bearer header** —
  fetch → `expo-file-system` write → `expo-sharing` share sheet (add both deps). Don't
  just open in a browser (the auth header would be lost).

### 5. Push (`expo-notifications`, add dep)

- On login, register the Expo push token via `POST /me/devices` (`{token, platform}`),
  prune on logout via `DELETE /me/devices/{token}`.
- Route the four donation message types on the `message_type` discriminator in the
  payload's `data`: `donation_confirmed`, `payment_recovery` (→ prefilled recovery
  checkout), `recurring_nudge` (→ prefilled checkout for the schedule),
  `campaign_milestone`.
- ⚠️ **Caveat**: the backend currently uses `LoggingTransport` — it records intended
  pushes but doesn't deliver them. Real delivery needs an Expo-Push/FCM transport
  swapped in `get_push_service` backend-side. Token registration + client handling can
  be built now; delivery is a separate backend task.

---

## Corrected backend contract (use these — common guesses are wrong)

> Pitfalls: **amounts are decimal taka, not cents** (৳500 = `500.00`, range 10–500000);
> **categories are lowercase** (`general`, not `GENERAL`); paths are `/me/...` and
> `/donations/{id}`, not `/users/...`.

```
POST /masjids/{masjid_id}/donations      body: {amount, category, is_anonymous, donor_name?}
POST /campaigns/{campaign_id}/donations  body: {amount, is_anonymous, donor_name?}   (no category)
     → 201 {donation_id, status, gross_amount, estimated_net, gateway_url}
GET  /donations/{donation_id}            → status poll (owner-only): {status, gross/fee/net, receipt_number, ...}
GET  /donations/{donation_id}/receipt    → PDF (completed only)
GET  /me/donations?masjid_id&category&status&year&cursor&limit   → {items[], next_cursor}
GET  /me/donations/summary               → {lifetime_total, this_year_total, year, per_masjid[]}
GET  /me/donations/annual-report?year    → PDF
POST/GET/PATCH/DELETE /me/recurring-schedules[/{id}]
POST /me/devices  ·  DELETE /me/devices/{token}                  (push token register/prune)
GET  /masjids/{masjid_id}/campaigns                              (campaign cards)
```

Redirect (handled for you): SSLCommerz →
`GET {PUBLIC_API_BASE_URL}/payments/sslcommerz/redirect/{outcome}` → 303 →
`{scheme}://donation/{id}?status=…`.

Enum values:
- `category`: `general` · `building` · `zakat` · `sadaqah` · `lillah` · `campaign`
- donation `status`: `pending` · `completed` · `refunded` · `failed`
- recurring `frequency`: `weekly` · `monthly` · `nightly`
- recurring `status`: `active` · `paused` · `cancelled`
- device `platform`: `ios` · `android` · `web`

---

## Dev/test loop

1. `ngrok http 8000`; set backend `PUBLIC_API_BASE_URL` + mobile `apiUrl` to the
   tunnel; align the scheme.
2. `docker compose up` (backend), `expo start` (mobile) on a device/simulator on the
   same network.
3. Log in → open a masjid → Donate → pay with an SSLCommerz **sandbox test card** in
   the in-app browser → confirm the IPN hits your tunnel, the donation flips to
   `completed`, the app's poll resolves, and the campaign bar moves.

---

## Suggested sequencing

1. **Glue + foundation** (scheme, tunnel, config, API client, AuthSession + LoginGate,
   React Query) — nothing donation-specific works without it.
2. **Tracer bullet**: masjid profile + `DonateBar` → DonationFlow → checkout → poll →
   success. One masjid, general category. Proves the whole pipe.
3. Campaign donations + cards.
4. Dashboard (history, summary, recurring, receipts).
5. Push (token registration + handlers; coordinate the backend transport swap).
6. i18n/Bengali numerals + theme polish (PRD 09).

---

## Two decisions worth making up front

- **Checkout surface**: recommend `expo-web-browser` `openAuthSessionAsync` (installed,
  handles redirect-return cleanly) over `react-native-webview` (the PRD's literal
  wording, available transitively, more control but more wiring).
- **Server state**: add `@tanstack/react-query` rather than hand-rolled hooks —
  status-polling and cache invalidation are exactly its sweet spot here.

---

## Open items to confirm before building

- PRD 01 consumer OTP endpoints (`/auth/otp/request`, `/auth/otp/verify`) exist in the
  backend `auth` router.
- Backend push transport (currently `LoggingTransport`) — schedule the Expo-Push/FCM
  swap if pushes must physically arrive for the demo.
