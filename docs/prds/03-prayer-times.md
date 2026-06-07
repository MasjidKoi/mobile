# PRD — Prayer Times (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native), plus the two backend features this section cannot ship without: the push-notification subsystem (built from scratch — none exists today) and the platform Hijri offset.
> The web admin panel's "send platform push" button and Hijri-offset field are listed as **dependencies** — this PRD does not spec admin panel internals.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §3, 2026-06-06.
> Triage: `ready-for-agent`
> Amends: PRD 01 (guest reminders confirmed in scope), PRD 02 (NearestMasjidCard evolves into the home-masjid prayer card; the "existing FCM machinery" PRD 02 referenced for submission-approval pushes is in fact built **here** — PRD 02's notification story depends on this PRD).

---

## Problem Statement

A Muslim user in Bangladesh checks prayer times five times a day, every day — it is the single most frequent reason to open any Islamic app. Today MasjidKoi's backend can already calculate and store per-masjid azan and iqamah times, but the mobile app shows none of it: no next-prayer countdown, no reminders, no Ramadan countdown, no Qibla, no Hijri date. Generic prayer apps get Bangladesh wrong in ways that matter — wrong calculation method, no local moon-sighting adjustment (so Ramadan and Eid land on the wrong day), and no masjid-level iqamah times, which means worshippers still do mental math to catch the congregation. And a prayer app that blanks out without connectivity — routine in rural Bangladesh — is broken at its core job: telling you when Fajr is, reliably, at 5 AM, offline.

## Solution

A prayer-times experience anchored to the user's **home masjid**, degrading gracefully to locally calculated times everywhere else:

- The home screen always answers "what's the next prayer?" — from the user's home masjid (azan **and** iqamah) when one is set, or from on-device calculation (Karachi method, user's madhab) for guests, fresh installs, denied location, or offline-anywhere. Never a blank screen, never a spinner for data shown yesterday.
- **Reminders are local notifications** scheduled from a cached 7-day window — they fire on time with the phone in airplane mode at Fajr. When a masjid admin changes times, a silent push ping tells installed apps to refetch and reschedule, honouring the 5-minute freshness requirement for any device reachable by push.
- Reminders anchor to azan by default and **upgrade automatically to iqamah** when the home masjid has it set — "Jama'ah at 1:30" is the reward for following a real masjid instead of using a generic app.
- A clock-driven **congregation status** ("Jama'ah in 12 min", "Jama'ah likely in progress") derived entirely on-device from cached times — no admin data entry, works offline.
- **Hijri dates that are right in Bangladesh:** tabular calendar plus an NGO-controlled offset, updated when the Islamic Foundation announces a sighting and broadcast by push — Ramadan mode and Eid alerts key off the adjusted date.
- **Ramadan mode** with Suhoor-ends and Iftar countdowns derived from Fajr/Maghrib. **Eid alerts** as a platform-wide push fired by the NGO the night of the sighting.
- A **Qibla compass** that is honest about accuracy — declination-corrected heading, calibration prompt when the sensor is poor — and works fully offline.
- One azan sound done well: a ~28-second excerpt on both platforms, Fajr separately configurable, with the Android channel scheme designed so muezzin voice packs can be added later without migrations.
- **Travel mode lite:** more than ~50 km from the home masjid, a banner says so and times switch to locally calculated for where the user actually is.

## User Stories

### Home screen & times source
1. As a user opening the app, I want the next prayer's name, time, and a live countdown on the home screen, so that the app's most common question is answered with zero taps.
2. As a user with a home masjid set, I want the home screen to show that masjid's azan and iqamah times, so that my countdown reflects my actual congregation, not an abstract calculation.
3. As a guest or fresh-install user with no home masjid, I want prayer times calculated for my location automatically, so that the app is useful before I've picked anything.
4. As a user who denied location, I want times calculated for my manually chosen district, so that denial never blanks the home screen.
5. As a user, I want to set or change my home masjid from any masjid profile, so that "my masjid" is one tap to establish.
6. As a user who follows a masjid for the first time, I want it offered as my home masjid, so that the concept introduces itself at the natural moment.
7. As a user, I want the full five-prayer table for today visible on the home screen (azan + iqamah columns), so that I can plan my day, not just the next hour.
8. As a user, I want yesterday's cached times to render instantly while fresh data loads silently, so that the home screen never shows a spinner.

### Masjid page times
9. As a user on any masjid's profile, I want today's azan and iqamah times for that masjid, so that I can plan a visit there.
10. As a user, I want the masjid's Jumu'ah schedule (1st and 2nd khutbah/start) on its profile, so that Friday planning needs no phone call.
11. As a user viewing a masjid that hasn't set iqamah times, I want the azan times shown with iqamah gracefully absent, so that partial data is still useful.
12. As a user, I want each masjid page to state its calculation madhab in passing (e.g. a small "Hanafi" label), so that a difference from my own setting is explained, not mysterious.

### Madhab
13. As a Shafi'i/Maliki/Hanbali user, I want my madhab applied to locally calculated times (especially Asr), so that fallback times follow my school.
14. As a user viewing a masjid page, I want the masjid's own published times shown untouched regardless of my madhab, so that the app never contradicts what's posted on the masjid's board.

### Reminders & notifications
15. As a user, I want a reminder N minutes (5/10/15/30) before each prayer, so that I can prepare and go.
16. As a user, I want per-prayer reminder toggles, so that I can get Fajr only, or everything except Dhuhr at work.
17. As a user whose home masjid has iqamah set, I want my reminder anchored to the iqamah ("Jama'ah at 1:30 — leave now"), so that I catch the congregation, not just the clock.
18. As a user whose masjid hasn't set iqamah, I want reminders anchored to azan automatically, so that the feature works for all 300k masjids from day one.
19. As a user with no connectivity at 5 AM, I want my Fajr reminder to fire anyway, so that the app is reliable exactly when it matters most.
20. As a user whose masjid admin changes Isha time this evening, I want my scheduled reminder corrected without opening the app, so that I'm never sent to a stale time.
21. As a user tapping a reminder, I want to land on that masjid's page with the relevant prayer highlighted, so that the notification is a doorway, not a dead end.
22. As a guest user, I want to set reminders without an account (per PRD 01), so that the core utility is never login-walled.
23. As a user setting my first reminder, I want the notification permission requested at that exact moment with a one-screen explainer first (per PRD 01), so that the ask makes obvious sense.
24. As a user, I want the azan-moment notification itself (not just the pre-reminder) as a separate toggle, so that I can hear the azan at azan time.

### Azan sound
25. As a user, I want the azan notification to sound like an azan (a ~28 s excerpt), so that the alert is recognisable without looking.
26. As a user, I want Fajr's sound and loudness configurable separately from the other prayers, so that a 5 AM alert can differ from a 1 PM one.
27. As a user in a meeting, I want a silent/default-tone option per prayer, so that azan audio is a choice, not an imposition.
28. As a user changing sound settings, I want a "play this now" preview button, so that I can tune without waiting for the next prayer.

### Freshness, cache & offline
29. As a user, I want my home masjid's next seven days of times kept on-device, so that a week of poor connectivity costs me nothing.
30. As a user, I want my favourite masjids' times for today and tomorrow cached, so that their pages work offline too (per the NFR).
31. As a user opening the app after six hours, I want times refreshed silently in the background, so that data stays current without my involvement.
32. As a masjid follower, I want admin time-changes reflected in my app within five minutes when I'm online, so that the app honours its freshness promise.
33. As a user opening any non-cached masjid's page, I want a live fetch with clear offline messaging if it fails, so that I can tell "no internet" from "no data".

### Congregation status
34. As a user glancing at the home screen between azan and iqamah, I want "Jama'ah in 12 min", so that I know whether to hurry.
35. As a user shortly after iqamah, I want "Jama'ah likely in progress" (hedged — nobody confirms it), so that I know I've probably missed the start without the app overclaiming.
36. As a user at any other time, I want "Next: Asr 4:45", so that the status line is always meaningful.
37. As a Friday user, I want the status line to reflect Jumu'ah (khutbah/jama'ah) instead of Dhuhr for masjids with a Jumu'ah schedule, so that Friday isn't treated like Tuesday.

### Ramadan mode
38. As a fasting user during Ramadan, I want Suhoor-ends (Fajr) and Iftar (Maghrib) countdowns to take over the home screen, so that the two times that rule my day are front and centre.
39. As a fasting user, I want optional Suhoor and Iftar reminders, so that I never miss either by accident.
40. As a user, I want Ramadan mode to activate and deactivate automatically from the adjusted Hijri date, so that I never configure it.
41. As a user, I want my masjid's Tarawih arrangements visible via its announcements, so that month-specific congregations are still discoverable (no structured Tarawih times this release).

### Hijri calendar & Eid
42. As a user, I want today's Hijri date displayed alongside the Gregorian date, so that the Islamic calendar is part of my daily glance.
43. As a Bangladeshi user, I want the Hijri date to match the Islamic Foundation's moon-sighting announcements, so that the app's 1 Ramadan is Bangladesh's 1 Ramadan.
44. As a user, I want a Hijri calendar screen with major Islamic events (Ramadan, both Eids, Ashura, etc.), so that I can look ahead.
45. As a user, I want a push notification the night Eid is announced ("Eid Mubarak — Eid al-Fitr is tomorrow"), so that I hear it from the app I trust, not just rumour.
46. As a user, I want my followed masjids' Eid jamaat times via their announcements, so that I know when to show up (no structured Eid schedule this release).
47. As a user whose app was closed during a sighting announcement, I want the corrected Hijri date applied by the time I wake up, so that the app is never a day off on Eid morning.

### Qibla
48. As a user anywhere, I want a compass pointing to the Qibla, so that I can pray correctly in an unfamiliar place.
49. As a user, I want the Qibla compass to work fully offline, so that it functions in a field with no signal.
50. As a user whose phone's compass is disturbed, I want a calibration prompt (figure-8) and a visible accuracy state, so that the app is honest instead of confidently wrong.

### Travel mode
51. As a traveller far from my home masjid, I want a banner telling me I'm away and times switched to my actual location, so that I'm never shown Dhaka's Maghrib in Chattogram.
52. As a traveller returning home, I want the app to switch back to my home masjid automatically, so that travel mode needs no manual cleanup.

### Settings
53. As a user, I want all prayer-notification settings in one place (per-prayer toggles, offset, sounds, azan toggle), so that tuning is discoverable.
54. As a user, I want my madhab changeable in Settings (per PRD 01), so that my fallback times follow a change of school.

### Accessibility & localisation
55. As a Bengali user, I want every prayer-times surface — countdowns, status lines, reminder copy, the Hijri calendar — in Bengali by default, so that the core feature speaks my language.
56. As a TalkBack/VoiceOver user, I want the countdown, times table, Qibla bearing, and settings fully labelled, so that I can use the core feature unassisted.
57. As an older user, I want times rendered with system font scaling respected, so that the most-read numbers in the app are readable.

## Implementation Decisions

### Decisions inherited from the design session (binding)

- **Times source precedence:** the home screen binds to a user-pinned **home masjid** (offered at first follow; changeable from any profile); with none set — guests, fresh installs — it falls back to **on-device calculation**. Masjid pages always show that masjid's authoritative server times.
- **Madhab rule:** the masjid's published times are never recalculated to the user's madhab — iqamah and azan are facts about a congregation. The user's madhab applies only to locally calculated fallback times. No dual-display UI; a small madhab label on masjid pages covers the rare mismatch (Bangladesh is overwhelmingly Hanafi).
- **Fallback calculation is client-side:** the adhan JS library (same algorithm family as the backend's Python adhan — consistent numbers), Karachi method default, user's madhab for Asr. "Manual city" = a **bundled static list of the 64 district HQs with coordinates** (~5 KB); no geocoding API, no server calculation endpoint.
- **Notification architecture — local-first, push-corrected:** reminders are **local notifications** scheduled from the cached window, ~3 days ahead (staying under iOS's 64-pending cap), rescheduled on app foreground, after any notification fires, and by a daily background task. Push is for **events, not times**: a silent data ping when an admin edits a masjid's times triggers refetch + reschedule on affected devices; that is how the SRS's 5-minute freshness rule is met for closed apps. Pure server-push azan delivery was rejected (single-process scheduler, FCM dead zones at Fajr); pure local-only was rejected (violates the freshness rule).
- **Ping audience resolution refined during PRD synthesis:** the session said "FCM per-masjid topic"; the binding decision is the *behaviour* — devices whose home masjid or favourites include the edited masjid get a silent refresh ping. Since no push code exists at all, the backend stores **device push tokens with their home/favourite masjid associations** and fans out server-side. Whether transport is Expo's push service (matches the installed expo-notifications) or bare FCM topics via firebase-admin is the implementer's choice; token registration is required either way (the platform-wide Eid push and PRD 02's submission-approval push both need it).
- **Reminder model:** default anchor is **N minutes before azan** (azan always exists), plus a separate azan-moment notification. When the home masjid has iqamah set for a prayer, the reminder **auto-upgrades to iqamah-anchored** with "Jama'ah at …" copy. MVP settings surface: per-prayer on/off + one global offset (5/10/15/30) + per-prayer azan-sound choice; per-prayer offsets deferred. Guests get full reminder functionality; prefs live in PRD 01's GuestStore and migrate on login.
- **Cache scope:** home masjid 7 days (drives notifications + home screen), favourites 2 days each, fetched in one burst when stale. Refresh triggers: app foreground if cache >6 h old, push ping, post-notification-fire. Cached-first rendering everywhere; any other masjid page fetches live with cached copy as placeholder.
- **Congregation status is a pure client-side state machine** over cached times: azan→iqamah window shows "Jama'ah in N min"; iqamah + ~15 min shows "Jama'ah likely in progress" (deliberately hedged copy); otherwise "Next: X at H:MM". Falls back to azan-anchored wording when iqamah is null; Jumu'ah-aware on Fridays. No admin toggle, no check-in inference. This same state machine is what later renders PRD 02's deferred "Jumu'ah starting soon" pin badges.
- **Hijri = tabular + platform offset:** client computes tabular Hijri offline; a `hijri_offset_days` value (−2…+2) in the existing platform settings, set by the NGO when the Islamic Foundation announces a sighting, is delivered with API responses/app config, cached, and broadcast via a push ping so closed apps correct overnight. Ramadan mode and Eid logic key off the **adjusted** date. Per-user offset adjustment rejected — the NGO is the authority.
- **Ramadan mode** is derived data only: Suhoor-ends = Fajr, Iftar = Maghrib, both already in the schedule. Auto-activates from the adjusted Hijri date. **Tarawih is deliberately unstructured** — masjids communicate it via announcements; no schema, no Tarawih reminders this release (explicit scope cut, user's call over the recommended standing-schedule table).
- **Eid alerts:** when the sighting is announced, the NGO platform admin updates the Hijri offset **and** fires one **platform-wide push** ("Eid Mubarak — Eid is tomorrow"). Masjids post jamaat times as announcements (which already notify followers). The only new backend piece is a "send platform-wide push" admin action — reusable for Ramadan-start and urgent notices. No structured Eid schedule.
- **Azan sound:** one bundled ~28 s azan excerpt (opening takbirs) on both platforms — iOS hard-caps notification sounds at 30 s — plus silent/default options. **Android notification channels are immutable once created**, so the channel scheme is designed for future voice packs now: `azan_{voice}_{prayer-group}` with **Fajr in its own channel group** from day one. Adding voices later = creating channels, never migrating. Full-length azan plays only in-app. Three-voice launch rejected as scope; system-tone-only rejected as a broken spec promise.
- **Qibla:** great-circle bearing to the Kaaba (the adhan library provides it) against the OS **declination-corrected true heading**; calibration prompt + visible accuracy state when the magnetometer reports low accuracy, instead of silently pretending the SRS's ±3°. Fully offline.
- **No home-screen widget this release** ⚠️ — explicit descope of a **spec'd SRS feature** (user's call; widgets require native WidgetKit/AppWidget work outside the Expo JS layer). Needs sign-off from whoever owns the SRS. Lock-screen widgets, Live Activities, and Watch complications fall with it.
- **Monthly timetable + PDF export: deferred entirely** (enhancement, user's call). Consequence: the prayer-times endpoint's 7-day cap stays as-is; no API change.
- **In scope, cheap:** notification **deep links** (every reminder opens its masjid's page — expo-router is already the navigation model) and **travel-mode lite** (on app open / significant location change, if >~50 km from the home masjid: banner + auto-switch to calculated times for the current location; auto-revert on return).
- **Rejected, not deferred:** auto-silent/DND during prayer (impossible on iOS, invasive permission on Android). **Deferred with the gamification section:** tasbih counter.

### Mobile modules (the work of this PRD)

- **PrayerScheduleStore (deep module).** The single cache authority for prayer times: home masjid 7-day window, favourites 2-day, MMKV persistence, staleness policy (>6 h foreground refresh, push ping, post-notification-fire), cached-first reads with silent background refresh. Nothing else fetches or caches times.
- **PrayerClock (deep module, pure).** `(day's times, Jumu'ah schedule, now)` → next prayer, countdown, and the congregation-status state machine, Friday-aware, null-iqamah-tolerant. Consumed by the home screen, the masjid page, PRD 02's peek card, and (later) map pin badges. The hedged-wording guarantee lives here.
- **FallbackCalculator (deep module, pure).** Wraps the adhan library + the bundled 64-district list: `(coords | district, date, madhab)` → five azan times, Karachi method. The only place client-side calculation happens.
- **TimesSource (deep module).** Answers "whose times do we show": home-masjid binding (set/change/offer-on-follow), fallback resolution, travel-mode detection (>50 km) with the away-banner descriptor and auto-revert. Consumes PRD 02's LocationResolver; never touches permission APIs directly.
- **HijriEngine (deep module, pure).** Tabular Hijri + cached platform offset → adjusted date, Islamic events list, Ramadan in/out detection.
- **ReminderScheduler (deep module).** Owns the local-notification budget: builds a rolling ~3-day **schedule plan** (a pure plan-builder over store + prefs: ≤64 pending, anchor-upgrade rule, per-prayer toggles, azan-moment entries, deep-link payloads, Android channel ids), then applies it through the notifications API. Reschedule triggers: foreground, ping, fire, daily task. Owns the channel scheme and its creation.
- **QiblaEngine (pure core + thin sensor shell).** Kaaba bearing from coordinates; heading + accuracy state from the OS; calibration-needed signal.
- **PushLink (shallow).** Push-token registration against the backend (with home/favourite associations kept current), and routing of incoming pings: time-change → PrayerScheduleStore refresh + ReminderScheduler rebuild; hijri-offset → HijriEngine cache update; platform pushes → display.
- **Screens & surfaces.** Home prayer card (countdown, five-prayer table, status line, Ramadan takeover, away-banner), masjid-page times section (azan/iqamah table + Jumu'ah + madhab label), Hijri calendar screen, Qibla screen, prayer-notification settings (with sound preview), Suhoor/Iftar reminder toggles. As little logic as possible; everything delegates to the modules above.

### Backend changes required

- **Push subsystem (the big one — built from scratch, nothing exists):** device-token registration endpoint (token + platform + home/favourite masjid associations, upserted, pruned on logout); a fan-out service that sends silent data pings to affected devices when prayer times are written (hooks on the existing manual-update and recalc paths) and when the Hijri offset changes; a platform-admin "send platform-wide push" action. PRD 02's submission-approval notification rides on this same subsystem.
- **Hijri offset:** `hijri_offset_days` added to the existing platform settings (validated −2…+2), exposed through a public app-config read so clients cache it, with the change ping above.
- **Existing endpoints reused as-is:** per-masjid prayer times (`days=1–7` was designed for exactly this 7-day cache), Jumu'ah schedule, follows/favourites, profile madhab.

### Contract clarifications

- The prayer-times response already carries times as local wall-clock `HH:MM` per the masjid's timezone; mobile treats them as wall-clock and never converts through UTC.
- The time-change ping carries the masjid id and date range touched so the client refetches only what changed; the hijri ping carries the new offset value (apply-without-refetch).
- Token registration is idempotent per (device, token) and must tolerate token rotation; associations update on home-masjid change and favourite add/remove.
- The platform-wide push and per-masjid pings are distinct message types with a stable discriminator field — PushLink routes on it.

## Testing Decisions

A good test exercises **external behaviour through the module's public interface** — what a caller observes — never internal state or implementation sequencing. Tests should survive a rewrite of the module's internals.

- **Committed: the pure-logic mobile modules** (user's explicit selection; the Jest setup is already committed in PRD 02):
  - **PrayerClock** — status transitions across azan/iqamah boundaries; iqamah-null fallback wording; midnight rollover to tomorrow's Fajr; Friday substitutes Jumu'ah for Dhuhr when a schedule exists; countdown values exact at boundary instants.
  - **FallbackCalculator + HijriEngine** — golden tests: adhan-js output matches the backend's Python adhan for a sample of districts × dates × madhabs (the consistency promise made in the design session, verified); district lookup; Hijri offset arithmetic including month/year boundaries and Ramadan in/out flips at ±1 offsets.
  - **ReminderScheduler's plan builder** — plan never exceeds the 64-slot budget; anchor upgrades to iqamah exactly when present; per-prayer toggles and the azan-moment toggle respected; deep-link payloads and channel ids correct; plan is deterministic for fixed inputs.
- **Considered and not committed:** backend pytest for token registration and fan-out hooks (prior art: the existing backend pytest suite — noted for the implementer, the natural first addition if push regressions appear), and PrayerScheduleStore/TimesSource (stateful, higher setup cost).
- Manual verification checklist for the end-to-end flows (set reminder → airplane mode → fires; admin edits time → ping → reschedule; offset change overnight; travel-mode switch/revert; Qibla calibration) ships with the implementation PR description.

## Out of Scope

- Home-screen widgets, lock-screen widgets, Live Activities, Watch/Wear complications (⚠️ widget is a spec'd SRS item — descope needs stakeholder sign-off)
- Monthly timetable view and PDF export (deferred entirely; revisit before Ramadan ~Feb 2027)
- Structured Tarawih and Eid-jamaat schedules (announcements carry both this release)
- Muezzin voice packs / multiple azan voices (the channel scheme ships ready for them)
- Per-prayer reminder offsets and dual azan+iqamah reminders per prayer
- Auto-silent/DND during prayer (**rejected**, not deferred)
- Tasbih counter (gamification section, post-MVP per SDD)
- Server-side calculated-times endpoint and "city times" datasets (client calculates)
- Live "Jumu'ah starting soon" badges on map pins (PRD 02 deferral stands; PrayerClock is built ready for it)
- Admin panel UI for the Hijri offset and platform push (backend endpoints in scope; web admin work is a dependency)

## Further Notes

- **This PRD is the de-facto push-infrastructure PRD.** Token registry, fan-out, and the platform-push action get built here and are load-bearing for PRD 02 (submission approvals), announcements, and future donation receipts. If timelines slip, the degradation order is: ship local notifications without pings first (freshness then relies on foreground refresh — the 5-minute SRS rule is met only for open apps), add the ping layer next; the Eid platform push is the one piece with a hard calendar deadline.
- **Open dependency:** Firebase project / push credentials (FCM server key or Expo access token) for both platforms, and APNs configuration for iOS — none of this exists yet and it gates every push feature.
- **The riskiest correctness surface is the iOS 64-notification budget.** 5 prayers × (reminder + azan) × 3 days = 30 against guest/Suhoor/Iftar additions — the plan builder must count, not assume; the committed tests pin this.
- The session's "FCM per-masjid topic" phrasing was refined to audience-resolution-via-token-associations during synthesis (recorded above); if the implementer chooses bare FCM with react-native-firebase, topics become an optimisation of the same contract, not a contract change.
- Bengali rendering of times and countdowns should go through the i18n layer from day one; the Bengali-numerals option itself remains §9 work.
- PRD 01's note stands: the feature doc claims a Node.js backend; it is FastAPI. Contracts here are written against the actual backend.
