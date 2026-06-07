---
tags:
  - prayer times
  - masjid finder
  - donation system
  - location-based services
  - gamification
technologies:
  - React Native
  - Node.js
  - PostGIS
  - Firebase Cloud Messaging
  - SSLCommerz
projects:
  - MasjidKoi
frameworks:
  - React
  - React Native
---
# MasjidKoi — Mobile App Features

> Context document for agents working on the MasjidKoi mobile app.
> Extracted from the SRS (v0.1, 2026-03-08, `MasjidKoi_SRS.tex`) and SDD (v0.1.0, 2026-04-14, `sdd.tex`).
>
> Each section lists **spec'd features** (from SRS/SDD) followed by **✨ Enhancements** — additions a polished app would have, drawn from real-world apps (Muslim Pro, Pillars, Athan, LaunchGood, Google Maps, Duolingo, etc.). Enhancements are *suggestions, not requirements* — don't treat them as committed scope.

## What the App Is

**MasjidKoi** ("Where is the masjid?" in Bengali) is a masjid finder, prayer times, and donation app for the Muslim community of **Bangladesh** — a country with 160M+ people and 300,000+ masjids across 64 districts.

It solves a fragmented experience: worshippers currently juggle Google Maps (no masjid-specific info like Iqamah/Jumu'ah times or facilities), generic prayer-time apps (wrong calculation methods, no masjid-level customisation), and informal cash/bKash donations (no receipts, no transparency).

MasjidKoi is a **two-platform product**:

1. **Consumer mobile app** (React Native, iOS 14+ & Android 8+) — *this document covers the mobile app*
2. **Web admin panel** (React) — used by a central NGO to onboard/verify masjids, and by masjid account holders to manage their profiles (out of scope here)

### Tech & Constraints

- **Stack:** React Native mobile · Node.js + PostGIS backend · Firebase Cloud Messaging for push · SSLCommerz/bKash/Nagad for payments
- **Languages:** Bengali (primary), English, Arabic (RTL)
- **Regulatory:** Bangladesh ICT Act 2006, Digital Security Act 2018, Bangladesh Bank MFS regulations (no raw card/MFS data stored on platform servers)
- **Security:** AES-256 at rest, TLS 1.3 in transit, input validation, API rate limiting

### Target Users (mobile)

| User | Needs |
|---|---|
| General Muslim user | Find nearby masjids, check prayer times, donate, view events |
| Guest user (no account) | Browse masjid listings and prayer times without signing up |
| Donor | Donate to masjids, track giving history, download tax receipts |
| Community member | Follow masjids, receive announcements, RSVP to events, leave reviews, track personal ibadah |

---

## Feature List

### 1. Onboarding & Authentication

**Spec'd:**
- 3-slide intro on first launch (skippable)
- OTP-based phone login (SMS, no passwords)
- Social login (Google, Apple)
- Guest mode — browse without account
- Profile setup (name, photo, preferred madhab: Hanafi/Shafi'i/Maliki/Hanbali)
- Location & notification permission prompts (with manual city fallback)

**✨ Enhancements:**
- **Auto-read OTP** (Android SMS Retriever API) so the user never types the code — standard in bKash/Nagad and every Bangladeshi fintech app
- **Personalised onboarding questions** ("Do you fast Mondays/Thursdays?", "Notify me for Fajr only?") to pre-configure notifications — like Headspace/Duolingo onboarding that tailors the experience before first use
- **Deferred login wall** — let guests do everything read-only and only ask for login at the moment of donating/following (the "Yelp pattern"); a hard login wall upfront kills conversion
- **Resend-OTP countdown + fallback voice call** for users with unreliable SMS delivery (common on rural carriers) — bKash does voice-call OTP
- **Progressive permission prompts** — ask for location only when the user opens the map, notifications only after they view a prayer time (pre-permission explainer screens double opt-in rates)

### 2. Masjid Discovery & Map

**Spec'd:**
- GPS-based nearest masjid auto-detection
- Interactive full-screen map with custom pins + clustering (within 50 m)
- List view sorted by distance
- Search bar with autocomplete (name/area/city)
- Distance filters (0.5/1/2/5/10 km or custom)
- Facility filters (Sisters section, Wudu, Wheelchair, Parking, Janazah, School)
- One-tap directions (Google/Apple Maps)
- Save favourites + recently visited (last 5)
- Full masjid detail page

**✨ Enhancements:**
- **"Jumu'ah starting soon" map badge** — pins show a live state (next Iqamah in 12 min) the way Google Maps shows "Closes soon"; this is the single most useful glanceable info for a masjid app
- **Bottom-sheet detail preview** — tap a pin → sliding card with photo, next prayer, distance, Directions + Donate buttons (Google Maps / Airbnb pattern) instead of forcing full page navigation
- **"Add a missing masjid" submission flow** — with 300k masjids, coverage gaps are guaranteed; let users submit name + pin + photo for NGO review (Google Maps "Add a place"). This crowdsources the NGO's hardest problem
- **Offline map tile caching** for saved areas (organic maps / Google Maps offline pattern) — critical for rural Bangladesh connectivity
- **Share a masjid** via deep link (WhatsApp-ready preview card with name, photo, prayer times) — WhatsApp is the dominant sharing channel in BD
- **"Near a place" search** — search masjids near a destination, not just current location (Google Maps "search this area" button after panning)

### 3. Prayer Times

**Spec'd:**
- 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) per masjid + madhab-based calculation
- Separate Azan vs Iqamah times
- Jumu'ah times (1st & 2nd)
- Customisable push reminders (5/10/15/30 min before)
- Ramadan mode (Suhoor/Iftar countdown, Tarawih)
- Eid prayer alerts
- Qibla compass (offline, ±3° accuracy)
- Hijri calendar with Islamic events
- Home screen widget (next prayer countdown)
- Real-time congregation status indicator
- Admin prayer-time updates reflected in app within 5 minutes

**✨ Enhancements:**
- **Choice of muezzin voices for the Azan notification** (Makkah, Madinah, local Bangladeshi qari) + per-prayer sound settings — Muslim Pro's most-loved feature
- **Auto-silent / DND during prayer** — phone silences itself from Iqamah for N minutes when checked in or near a masjid (Salaat First / "prayer mode" pattern)
- **Travel mode** — auto-detect city change and switch to calculated times with a "you're away from your home masjid" banner (Muslim Pro handles this seamlessly)
- **iOS Live Activity / Dynamic Island countdown** for Iftar and next prayer; **lock-screen widgets** (iOS 16+) and Android home widget variants (small = next prayer, large = all 5)
- **Apple Watch / Wear OS complication** showing next prayer — glanceability is the killer use case
- **Tasbih (dhikr) counter** with haptic feedback — near-universal in Islamic apps, trivial to build, high retention
- **Monthly timetable view + PDF export** of a masjid's full schedule — mirrors the printed Ramadan calendars masjids already distribute, very culturally familiar
- **Notification deep links** — tapping "Maghrib in 15 min at X Masjid" opens that masjid's page with a Directions button, not just the home screen

### 4. Masjid Profile & Facilities

**Spec'd:**
- Photo gallery (up to 10 photos, swipeable)
- Facility indicators: Sisters section, Wudu (M/F), Wheelchair, Parking, Janazah, Islamic school
- Imam profile (name, qualifications, languages)
- Contact details (tappable phone/email/website)

**✨ Enhancements:**
- **Community photo uploads with moderation queue** — Google Maps gets most place photos from users, not owners; with 300k masjids the NGO can't photograph them all
- **Q&A section on profiles** ("Is there women's parking?", "What time does the gate open for Fajr?") — Google Maps Q&A pattern; answers from masjid admins get a "verified" badge
- **"Suggest an edit"** per field (wrong phone number, parking closed) feeding the existing report-incorrect-info flow — granular beats a generic report button
- **Capacity & "busyness" hints** ("arrive 20 min early for Jumu'ah") — like Google Maps popular-times, can start as admin-entered text
- **Verified badge** on NGO-verified masjids — trust signal that distinguishes MasjidKoi data from scraped map data

### 5. Donation System

**Spec'd:**
- Donate button on every masjid profile (can be toggled off per-masjid by admin)
- Categories: General, Building, Zakat, Sadaqah, Lillah, Specific Campaign
- One-time (BDT 10–500,000) or recurring (weekly/monthly) donations
- Payment via bKash, Nagad, Credit/Debit (SSLCommerz)
- Instant in-app + email confirmation
- Downloadable PDF receipts
- Fundraising campaigns with progress bars
- Anonymous donation option
- Zakat calculator
- Quick-donate to favourite masjids

**✨ Enhancements:**
- **Preset amount chips** (৳50 / ৳100 / ৳500 / ৳1000 + custom) — every high-converting donation flow (LaunchGood, GoFundMe) leads with presets; never open on an empty input
- **"Automate my last 10 nights"** — schedule a nightly donation during the last 10 nights of Ramadan to catch Laylat al-Qadr; LaunchGood's signature feature and a massive driver of recurring giving
- **Saved payment methods** (tokenised via SSLCommerz) for true one-tap repeat giving — first donation is 5 steps, second should be 1
- **Share-after-donating card** ("I just supported X Masjid") with campaign deep link — GoFundMe attributes a large share of donations to post-donate sharing
- **Campaign updates feed** — masjid posts progress photos ("roof is done!") to past donors; closing the transparency loop is the app's core promise
- **Donor wall (opt-in) + milestone celebrations** ("৳1,00,000 of ৳5,00,000 reached!") with a confetti moment on contribution — LaunchGood/GoFundMe pattern
- **Failed-payment recovery** — if bKash flow is abandoned mid-payment, a gentle resume notification ("complete your ৳500 donation?") recovers a meaningful % of drop-offs
- **Round-up giving** ("round my ৳473 donation to ৳500") — micro-pattern from fintech apps that lifts average gift size

### 6. Donation Dashboard

**Spec'd:**
- Full donation history (filterable, paginated)
- Lifetime / yearly / per-masjid totals
- Annual giving PDF report (for tax deduction)
- Recurring donation manager (view/pause/cancel)

**✨ Enhancements:**
- **Ramadan giving summary / "Year in giving" recap** — a shareable Spotify-Wrapped-style card after Ramadan ("You gave to 4 masjids across 3 districts"); drives organic growth
- **Zakat tracker** — mark which donations counted toward Zakat and show remaining obligation vs. the calculator's figure (ties the calculator to real behaviour)
- **Recurring-donation health states** — clearly surface failed/expired payment methods with one-tap fix, instead of silently lapsing (Netflix-style dunning UX)
- **Per-campaign view** — "you gave ৳2,000 to the roof campaign, it reached 100%" with the campaign's final update attached

### 7. Community Features

**Spec'd:**
- Announcements feed from followed masjids
- Events board (Nikah, Eid dinners, charity drives, classes) with RSVP
- Follow/unfollow masjids
- Star ratings & text reviews (1–5)
- Report incorrect info (prayer times, facilities)
- Halal food nearby tab
- Optional GPS check-in (within 100 m of masjid)

**✨ Enhancements:**
- **Announcement channels feel like WhatsApp Channels** — read-only broadcast with emoji reactions but no public comments; comments on masjid announcements are a moderation nightmare the NGO can't staff
- **"Add to calendar" + event reminders** for RSVP'd events (Eventbrite pattern), and an attendee count ("43 going") for social proof
- **Review prompts gated by behaviour** — ask for a review only after a check-in or repeat visit (Google Maps prompts after a visit), never via cold popup; require a minimum character count to reduce drive-by 1-stars
- **Owner responses to reviews** — masjid admins can reply once per review (Google Business pattern); defuses disputes publicly
- **Digest notifications** — batch announcements from followed masjids into one daily digest by default, with per-masjid override to instant; follow 5 masjids and per-post pushes become unbearable
- **Lost & found / community noticeboard** post type — matches how masjid notice boards are actually used in BD

### 8. Gamification

**Spec'd:**
- Prayer streak counter (private)
- Badges (Fajr Warrior, Generous Giver, Community Pillar)
- Private ibadah journal (prayers, Quran pages, goals)

**✨ Enhancements:**
- **Streak freeze / mercy day** — Duolingo's most important retention mechanic; a missed prayer log shouldn't nuke a 90-day streak, which otherwise causes uninstalls. Frame it gently ("life happens — your streak is safe")
- **Weekly reflection summary** ("you logged 31 of 35 prayers") rather than competitive leaderboards — religious practice gamification must stay private and non-judgmental; Pillars app deliberately avoids social comparison
- **Gentle re-engagement** — "you haven't logged Fajr in 3 days" framed as encouragement with a dua, never guilt (Duolingo's tone matters more than its mechanics here)
- **Goal templates** — preset journals like "Khatm al-Quran in Ramadan" (track 20 pages/day) instead of empty free-form goals

### 9. Settings & Accessibility

**Spec'd:**
- Madhab selection
- Azan sound toggle + volume
- Dark mode
- Adjustable font size
- Multilingual UI (Bengali primary, English, Arabic with RTL)
- Offline mode (cached masjids, prayer times, Qibla)
- Privacy controls (check-ins, donations, reviews)
- Granular notification manager
- Account deletion (Digital Security Act 2018 compliant)

**✨ Enhancements:**
- **Notification preview/test button** ("hear this Azan sound now") so users can tune settings without waiting for the next prayer
- **Data export** (download my data as JSON/PDF) alongside deletion — GDPR-style, builds trust for a donation-handling app
- **Data-saver mode** — low-res images, no autoplay; mobile data is metered for much of the BD audience (YouTube/Facebook Lite pattern)
- **App shortcuts** (long-press app icon → Qibla / Donate / Nearest masjid) on both platforms
- **Full TalkBack/VoiceOver audit** + minimum 44pt touch targets — the SRS promises "intuitive for all age groups"; this is what that means concretely
- **Bengali numerals option** (১২:৩০ vs 12:30) — small detail, big localisation signal

---

## Cross-Cutting Product Polish

Patterns that don't belong to one feature but separate a good app from a mediocre one:

- **Skeleton loaders + cached-first rendering** — show last-known prayer times instantly, refresh in background (every top map/transit app does this); never show a spinner for data you showed yesterday
- **Optimistic UI** for follow, favourite, RSVP, check-in — apply instantly, sync in background, roll back on failure
- **Empty states that teach** — empty favourites screen shows "tap ♡ on any masjid", empty donation history shows a quick-donate CTA
- **In-app review prompt timing** — ask for a store rating right after a success moment (donation receipt, streak milestone), never on launch (standard ASO practice)
- **Error states with retry** — distinguish "no internet" (show cached + banner) from "server error" (retry button); a prayer-times app that blanks out offline is broken
- **Deep linking throughout** — every masjid, campaign, event, and announcement has a shareable URL that opens the app (or the store if not installed) — required for the WhatsApp-driven growth loop
- **Analytics events** on the core funnel (search → masjid view → directions/donate) so the NGO dashboard's metrics have a source

---

## MVP Scope Note

The SDD marks the following as **out of scope for the 6-month MVP**, even though the SRS lists them:

- Gamification (streaks, badges, ibadah journal)
- Events board / RSVP
- Star ratings & reviews
- Fundraising campaigns & Zakat calculator
- Advanced analytics

**MVP = sections 1–6** (minus campaigns/Zakat calculator) **+ announcements & follow + core settings.**

✨ Enhancement items inherit the scope of their section — e.g. preset donation chips are fair game for MVP polish, but streak freezes are post-MVP by definition. The highest-leverage MVP-safe enhancements: auto-read OTP, bottom-sheet map preview, preset amount chips, saved payment methods, cached-first rendering, deep links.

## Explicit Non-Goals (this release)

- Live streaming of prayers or lectures
- E-commerce / Islamic goods marketplace
- Matrimonial or social networking features
- Cryptocurrency payments
- AI-powered sermon transcription/translation

## Performance & Quality Expectations (from NFRs)

- All screens load to interactive state on a standard mobile connection
- Prayer times & favourites cached for offline use
- UI intuitive for all age groups (font scaling, dark mode)
- Modular codebase: mobile (React Native) / web admin (React) / backend API (Node.js) cleanly separated
