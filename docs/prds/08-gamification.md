# PRD — Gamification: Streaks, Badges & Ibadah Journal (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native), plus the backend rework this section cannot ship without: replacing the check-in-derived streak with a journal-derived StreakEngine, restructuring the journal contract, tiering the badge model, and adding goals. The web admin panel is untouched — gamification has no admin surface.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §8, 2026-06-07, reconciled against the **already-deployed gamification v0 backend** during synthesis (see Implementation Decisions — the deployed code implements the streak model the grill session explicitly rejected).
> Triage: `ready-for-agent`
> Amends: PRD 07 (check-ins remain §7's feature and keep powering the review prompt, but they stop being the streak source; they become one input to Community Pillar). PRD 03 (the lapse nudge and weekly reflection are new local notification types on PRD 03's scheduling machinery; the day-finalization clock reads PRD 03's prayer-times data for the Fajr boundary). PRD 09 (the granular notification manager gains a "journal & streaks" toggle group, independent of prayer reminders; account deletion wipes all gamification data).

---

## Problem Statement

A Muslim user in Bangladesh who wants to build consistency in salah has no companion for it. The SRS promises a private prayer streak, badges, and an ibadah journal, but what exists today is a skeleton that measures the wrong thing: the deployed streak counts **GPS check-ins at masjids**, so a mother praying all five prayers at home for a decade has a streak of zero, while someone who steps into a masjid once a day and prays nothing has a perfect one. "Fajr Warrior" is awarded for a week of check-ins with nothing about Fajr in it. The journal accepts a free-text string of prayers no UI writes. And the model has no answer for the user the spec'd design fails hardest: a woman is Islamically exempt from salah during menstruation, so under any honest all-prayers streak her count structurally dies every month — the exact "broken streak → uninstall" event the feature exists to prevent. Meanwhile Ramadan — the season when millions in Bangladesh attempt a Khatm of the Qur'an and would track it daily — is approaching with no goals feature at all.

## Solution

A private, gentle, theologically honest ibadah companion — manual self-report all the way down, because the app's job is to help the user be honest with themselves, not to verify worship:

- An **ibadah journal** where logging the five daily prayers is one tap each (●●●○○), with Qur'an progress in the user's preferred unit (pages of the standard 604-page mushaf by default, juz or minutes optional) and free notes. GPS check-ins may prefill a log; they never auto-log — praying at home counts equally.
- A **prayer streak** with religious integrity: a day counts only when all five prayers are logged. The harshness is paired with mercy designed in, not bolted on: yesterday stays editable until past today's Fajr, an earned **streak freeze** auto-applies when a day slips ("life happens — your streak is safe"), and a discreet **exempt mode** lets a user mark days she is exempt from salah — the streak passes through unbroken, and the reason never leaves her device.
- **Milestone-tiered badges, all private**: Fajr Warrior at 7/40/100 consecutive Fajr logs, Generous Giver at 3/6/12 consecutive months of giving anything (consistency, never amount — a ৳50 monthly giver earns it as readily as a ৳50,000 one), Community Pillar from accumulated verified contributions. Each milestone lands with a dua or hadith about the practice, not XP. No leaderboards, no public surfaces, ever.
- **Template-led goals** headlined by Khatm-in-Ramadan (track ~20 pages/day), plus daily and weekly recitation templates; free-form goals allowed but templates lead.
- A **weekly reflection** ("you logged 31 of 35 prayers") delivered as one Jumu'ah notification, and an opt-in **lapse nudge** — encouragement with a dua after 3 silent days, backing off exponentially, never guilt — all hard-capped at one gamification notification per day and killable independently of prayer reminders.
- **Privacy as architecture**: journal, streak, and badges sync encrypted and account-bound (a lost phone must not erase a 200-day streak), excluded from analytics beyond coarse feature-active aggregates; exempt-mode reasons are device-only, and the server cannot distinguish an exemption from a freeze.

## User Stories

### Prayer logging
1. As a community member, I want to log each of the five daily prayers with one tap, so that recording my salah takes seconds, not a form.
2. As a community member, I want today's five prayers shown as filled/empty dots, so that I can see at a glance what's logged and what remains.
3. As a community member, I want to un-log a prayer I tapped by mistake, so that an accidental tap doesn't pollute my honest record.
4. As a worshipper who prays at home, I want manual logging to be the only requirement, so that my prayers count the same as anyone's at a masjid.
5. As a worshipper at a masjid, I want a GPS check-in to offer to prefill that prayer's log, so that the two features cooperate without check-ins ever logging for me.
6. As a user who forgot to log last night's Isha, I want yesterday to stay editable until a few hours past today's Fajr, so that sleeping doesn't break an honest streak.
7. As a user trying to edit last week, I want streak-counting days older than the edit window to be locked, so that my streak means something.
8. As a user on a dead connection, I want logging to work fully offline and sync later, so that rural connectivity never costs me a day.
9. As a user with two devices, I want my logs consistent across them after sync, so that my journal has one truth.

### Streak
10. As a community member, I want a streak that counts days where all five prayers are logged, so that the number reflects the real obligation, not a participation trophy.
11. As a community member, I want my current and longest streak both visible, so that a past achievement survives a bad week.
12. As a community member, I want partially-logged days visibly acknowledged (3 of 5) even though they don't extend the streak, so that an imperfect day still feels seen.
13. As a streak holder who missed a day, I want an earned freeze to apply automatically and be told gently afterwards, so that I never wake up to a destroyed streak I could have saved.
14. As a streak holder, I want to see how many freezes I hold and how they're earned (one per ~30 streak days, two held at most), so that mercy is legible, not magic.
15. As a user, I want freezes to be unbuyable at any price, so that the app never sells forgiveness.
16. As a woman during menstruation, I want a discreet exempt-mode toggle so my streak passes through days I am Islamically exempt from salah, so that obedience by exemption is never scored as failure.
17. As an exempt-mode user, I want the toggle's wording neutral and the setting easy to end, so that using it is dignified and low-friction.
18. As an exempt-mode user, I want the reason for my exempt days stored on my device only — never synced, never in analytics, never in any summary — so that intimate health information stays mine.
19. As a privacy-conscious user, I want my streak to be private to me, so that worship is never social data.
20. As a new user, I want my streak to start counting from my first fully-logged day without setup, so that the feature begins working the moment I do.

### Badges
21. As a community member, I want badges with milestone tiers rather than one-shot trophies, so that there's a next step after week one.
22. As an early riser, I want Fajr Warrior to progress at 7, 40, and 100 consecutive days of logged Fajr, so that the badge actually honours Fajr.
23. As a donor, I want Generous Giver to progress on consecutive months in which I gave anything at all, so that consistency is honoured and amount never is.
24. As a community contributor, I want Community Pillar to progress from verified contributions — check-ins, accepted info reports, approved photos — so that helping the platform's data is recognised.
25. As a community member, I want each milestone celebrated with a relevant dua or hadith, so that the reward speaks the practice's own language.
26. As a community member, I want all badges visible only to me, so that recognition never becomes showing off (riya).
27. As a community member, I want a badge gallery showing earned tiers and progress toward the next, so that I can see where I stand without being nagged about it.
28. As a user earning a badge offline, I want the award to reconcile correctly when I sync, so that connectivity doesn't eat milestones.

### Journal — Qur'an & notes
29. As a reciter, I want to log Qur'an progress in pages by default, so that tracking matches the 604-page mushaf most of Bangladesh reads.
30. As a reciter who thinks in juz or minutes, I want to switch my tracking unit, so that the journal speaks my habit.
31. As a journal user, I want an optional free-text note per day, so that reflections have a home next to the numbers.
32. As a journal user, I want a calendar/history view of past entries, so that I can see my month at a glance.
33. As a journal user, I want notes and Qur'an entries to stay editable beyond the streak lock window, so that only the streak is strict — the journal is mine.

### Goals
34. As a user in Ramadan, I want a Khatm-in-Ramadan template that computes my daily pace and tracks me against it, so that finishing the Qur'an is a plan, not a wish.
35. As a user behind on my Khatm, I want the daily pace to recompute from remaining pages and days, so that the goal stays achievable rather than shaming.
36. As a habit builder, I want preset templates like daily Ayat al-Kursi and Surah al-Kahf on Jumu'ah, so that starting takes one tap.
37. As a power user, I want to create a free-form goal with a target and period, so that the templates aren't a ceiling.
38. As a goal holder, I want goal progress fed automatically from my journal entries where possible, so that I log once and everything updates.
39. As a goal holder, I want to pause or abandon a goal without ceremony, so that a changed life doesn't leave a guilt artifact.

### Weekly reflection & nudges
40. As a journal user, I want a weekly reflection summarising my logged prayers and Qur'an progress, so that I see the trend, not just today.
41. As a journal user, I want the reflection delivered as a single Jumu'ah notification, so that review lands on the week's blessed day.
42. As a journal user, I want the reflection to compare me only to myself — never to other users, never a leaderboard — so that reflection stays worship, not competition.
43. As a new journal user, I want nudges offered opt-in at journal setup and off until then, so that the app earns the right to remind me.
44. As a lapsed user, I want a gentle nudge after 3 silent days — encouragement with a dua, never guilt — so that returning feels welcoming.
45. As a user who keeps not responding, I want nudges to back off (3 days → 7 days → stop), so that the app respects my silence.
46. As a user, I want at most one gamification notification per day, hard-capped, so that streak mechanics never compete with the azan.
47. As a user, I want gamification notifications toggleable independently of prayer reminders in the §9 notification manager, so that muting nudges never mutes Maghrib.
48. As an exempt-mode user, I want nudges and reflections to account for exempt days without naming them, so that even the app's tone respects the privacy of why.

### Privacy, data & sync
49. As a user replacing a cheap handset, I want my journal, streak, and badges restored on login, so that years of ibadah history survive the device.
50. As a privacy-conscious user, I want gamification data excluded from analytics beyond coarse feature-usage aggregates, so that no per-user worship telemetry exists anywhere.
51. As a user deleting my account, I want every journal entry, streak, badge, and goal erased with it, so that §9's deletion promise covers my worship history.
52. As an exempt-mode user, I want the server unable to distinguish my exempt days from streak freezes, so that even encrypted server data can't infer my health.
53. As a user, I want no gamification data in any shareable surface, so that nothing private can leak by my own mistaken tap.

### Localisation & polish
54. As a Bengali user, I want every gamification surface — journal, streak, badges, goals, reflections, nudges — in Bengali by default with correct Islamic terminology, so that the companion speaks my language.
55. As a user with Bengali numerals enabled, I want streak counts and page numbers rendered accordingly, so that the localisation is complete, not cosmetic.
56. As a user opening the journal, I want today's state rendered instantly from local data, so that logging never waits on a network.
57. As a user, I want streak milestones (40 days, 100 days) celebrated in-app at the moment I complete the day's fifth log, so that the reward is immediate and private.

## Implementation Decisions

### Reconciliations with the deployed gamification v0 backend

- **The streak changes meaning.** The deployed streak derives from check-in dates — the GPS-driven model the grill session explicitly rejected (it excludes home prayers and penalises women and rural users). The streak endpoint's contract is redefined to journal-derived prayer-log streaks; its response shape gains current/longest/freeze fields and drops the check-in total (which moves to the check-in history contract). Check-ins remain §7's feature, keep powering PRD 07's review prompt, and become one input to Community Pillar — nothing else.
- **`FajrWarrior` stops being a check-in badge.** The deployed award (7-day check-in streak, nothing Fajr-specific) is replaced by the consecutive-logged-Fajr criterion. The badge model gains a `tier` dimension; the existing one-row-per-badge-type uniqueness becomes one row per (user, badge type, tier).
- **The journal contract is restructured.** The free-text `prayers_logged` string becomes a structured five-prayer boolean set; `quran_pages` generalises to amount + unit; the entry gains a protected-day marker. The deployed upsert's blanket whole-row replacement is replaced by field-level updates so a Qur'an edit can't silently clear prayer logs. Existing free-text rows are migrated by token-parsing where recognisable, else preserved into notes.
- **Server-side day boundaries move from server-local `date.today()` to Asia/Dhaka** — consistent with PRD 07's single-product-timezone decision, and load-bearing here because a streak that flips at the wrong midnight breaks for every user every day.

### Streak semantics (grill decisions)

- **Log source is manual self-report only.** A check-in may prefill a log client-side; no path auto-logs a prayer. Honesty is the user's; the app's job is recording, not verification.
- **A streak day requires all five prayers logged.** Partial days render as per-prayer dots and never extend the streak.
- **A day finalizes at 12:00 Asia/Dhaka the following day** (the "until next-day Fajr plus grace" decision, implemented as a fixed noon cutoff so the rule needs no per-masjid Fajr lookup server-side; the mobile UI may display the boundary against PRD 03's prayer-times data). Until finalization, the day's prayer logs are editable; after it, prayer logs for that date are rejected for streak purposes. Notes and Qur'an amounts stay editable indefinitely.
- **Freezes: earned, automatic, never sold.** One freeze accrues per 30 cumulative streak days, at most two held. When a day finalizes incomplete and a freeze is held, it applies automatically and the streak passes through; the user is told gently after the fact. No purchase path exists in any form.
- **Freeze state is derived, not stored.** Because accrual and application are deterministic functions of the day-record history, StreakEngine computes freezes-held and freezes-applied as part of the same pure fold that computes the streak — no freeze ledger table, no reconciliation bugs between a ledger and history.
- **Exempt days (menstruation, postpartum):** a discreet, neutrally-worded exempt-mode toggle marks days exempt; the streak passes through because no prayers were due. Exempt days sync to the server **only** as the same protected-day marker a freeze produces.
- **The protected-day marker is deliberately ambiguous.** Server-side, a freeze pass-through and an exemption pass-through are one indistinguishable representation, closing the inference channel where "zero logs + unbroken streak" would reveal exemption. The *reason* (exempt vs frozen) lives in device-only secure storage. Consequence accepted: on a new device, past protected days restore without their reason — the streak is intact, and the local exempt history starts fresh.

### Badges

- **All private. No leaderboards, no public profile surface, no share cards.** Consistent with the source doc's no-social-comparison stance and the riya concern.
- **Milestone tiers on resonant numbers:** Fajr Warrior at 7/40/100 consecutive logged-Fajr days (40 carries religious weight); Generous Giver at 3/6/12 consecutive months containing at least one donation of any amount — **consistency, never amount**; Community Pillar at accumulated verified-contribution thresholds (check-ins, accepted info reports, approved photo uploads — weights are an implementer choice recorded in BadgeEngine).
- **Roughly eight to ten badges at launch** within these three families plus streak milestones; each award presents a dua or hadith about the practice, not points.
- **Generous Giver ships dormant.** Its counter activates when the donation system (§5, PRD pending) lands; BadgeEngine encodes the criterion now so the activation is data, not code.
- **Awarding is server-side and idempotent** — evaluated on journal sync and relevant events, never re-awarded, lower tiers never skipped in records (earning 40 days awards 7 and 40 if 7 was somehow missing).

### Journal & goals

- **V1 tracks exactly the spec'd trio:** the five-prayer log (feeding the streak), Qur'an progress with a user-pickable unit — pages of the 604-page mushaf by default, juz or minutes optional, the unit a user preference applied at render and conversion handled at unit-switch — and goals. Fasting, dhikr counts, and sunnah prayers are explicitly deferred.
- **Goals are template-led.** Khatm-in-Ramadan (target 604 pages across Ramadan, daily pace recomputed from remaining/remaining-days), daily Ayat al-Kursi, weekly Surah al-Kahf on Jumu'ah; free-form goals (name, target, unit, period) allowed but secondary in the UI. Qur'an-unit goals consume journal entries automatically; recurrence-style goals are check-off.
- **Mobile is local-first.** JournalStore owns local state, an offline write queue, sync, and conflict resolution (per-field, latest-write-wins on the structured fields — entries are single-user, low-contention). The journal renders entirely from local data; sync is background.
- **Streak display is computed locally by the same rules StreakEngine encodes;** the server remains the authority for badge awarding. The rules live in one documented specification both implementations follow, and the committed StreakEngine tests are the executable form of that spec.

### Notifications

- **Opt-in at journal setup, off until then.** One setup screen offers the lapse nudge and weekly reflection; declining is frictionless and revisitable in settings.
- **Hard caps:** at most one gamification notification per day; the lapse nudge fires only after 3 fully-silent days, then backs off 3d → 7d → stop until the user returns; the weekly reflection is one Jumu'ah notification. All are **local notifications** on PRD 03's scheduling machinery — no server push, since every input (journal recency, streak state) is on-device.
- **Tone is fixed at the copy level:** every nudge is encouragement with a dua; no red badges, no "you lost your streak" framing, no guilt mechanics. Exempt days count as activity for nudge-eligibility purposes without ever being named.
- **§9's granular notification manager gains a "journal & streaks" toggle group**, fully independent of prayer reminders; until §9 ships its full manager, the journal-setup screen's own toggles suffice.

### Data architecture & privacy

- **Journal, streak inputs, badges, and goals sync encrypted and account-bound** under the existing AES-256-at-rest regime — device loss must not erase a long streak (the uninstall event this feature exists to prevent, doubly so for Bangladesh's high handset-turnover market).
- **Excluded from analytics:** no per-user worship telemetry leaves the gamification domain; the NGO dashboard sees only coarse aggregates (feature-active counts). No gamification event joins the §Cross-Cutting analytics funnel.
- **Exempt-mode reasons are device-only secure storage**, never synced, never in any export except the user's own §9 data export (where they appear from local data, clearly labelled).
- **Account deletion (§9, Digital Security Act 2018) erases all gamification rows.**

### Modules

**Backend:**
- **StreakEngine (deep, pure).** `(ordered day records {date, prayer-set, protected}, now) → {current streak, longest streak, freezes held, protected days applied, day-finalization boundary}`. Every streak rule above lives here and only here; the service calls it, nothing reimplements it.
- **BadgeEngine (deep, pure).** `(counters {consecutive Fajr days, consecutive giving months, contribution points, streak milestones}, already-awarded set) → awards`. Tier thresholds, idempotency, no-skipped-tiers, dormant Generous Giver.
- **Journal API rework (service + contracts).** Structured prayer-set upsert with field-level updates and backfill-window enforcement, Qur'an amount+unit, protected-day marker, goals CRUD with template instantiation, migration of v0 rows.
- **Streak/badge read contracts.** The redefined streak response and the tiered badge list with next-tier progress.

**Mobile:**
- **JournalStore (deep).** The single authority for journal data on device: local-first reads, offline write queue, sync, per-field conflict resolution, the local streak mirror, and the day-finalization clock. Nothing else touches journal state.
- **ExemptMode (deep).** Exempt ranges in device-only secure storage; emits protected-day markers to JournalStore; enforces its own exclusion from analytics and shareables by owning the only read path.
- **NudgeScheduler (deep, pure eligibility core).** `(journal recency, streak state, opt-in flags, nudge history, now) → next scheduled local notification or none`; the caps and backoff live here. Scheduling I/O rides PRD 03's local-notification machinery.
- **GoalTracker.** Template instantiation, pace recomputation, journal-fed progress.
- **Shallow composition:** journal screen with per-prayer dots, streak card with freeze indicator, badge gallery with tier progress, goals screen, weekly reflection screen, journal-setup (opt-in) screen.

## Testing Decisions

- A good test exercises external behaviour through the public interface — StreakEngine and BadgeEngine outputs for given inputs, endpoint contracts for the API — never repository queries or scheduler internals.
- **Committed — StreakEngine** (prior art: the backend's established pytest suite; precedent for committed pure-logic tests: PRD 07's DigestScheduler): all-5 day semantics; partial days never extend; the noon-next-day Asia/Dhaka finalization boundary including the midnight-to-noon edit window; freeze accrual at 30-day multiples and the two-held cap; auto-application order when multiple days slip; protected-day pass-through identical for freeze and exempt inputs; longest-vs-current; empty history; and determinism (same history → same freeze state) since freeze state is derived.
- **Committed — BadgeEngine:** tier thresholds for all three families; idempotent awarding; lower tiers backfilled rather than skipped; consecutive-giving-months counting across month boundaries; dormant Generous Giver awarding nothing while donations are absent.
- **Committed — journal endpoint contracts:** structured prayer-set validation; field-level update semantics (a Qur'an edit leaves prayer logs untouched); backfill rejection for streak-locked dates with notes remaining editable; protected-day marker round-trip; goals CRUD and template instantiation; v0 row migration shape.
- **Considered and not committed** (noted for the implementer per the PRD 02–07 pattern): NudgeScheduler's pure eligibility core (caps, backoff, exempt-day handling) and JournalStore's local streak mirror against the StreakEngine spec — the natural first mobile tests if streak-display divergence or nudge regressions appear.
- Manual verification checklist ships with the implementation PR description: log 5 prayers → streak increments at finalization; miss a day with a freeze held → auto-applied with gentle copy; exempt-mode days pass through and never appear in sync payloads or analytics; backfill yesterday before noon, rejected after; badge tiers award with dua copy; Khatm template paces and recomputes; nudge opt-in/backoff/stop; weekly reflection on Jumu'ah; offline logging syncs across two devices; account deletion wipes everything; Bengali + Bengali-numeral rendering across all surfaces.

## Out of Scope

- **Donation system integration beyond the dormant Generous Giver criterion** — §5/§6 have no PRD yet; the consistency counter activates when donations exist
- Fasting, dhikr/tasbih counts, and sunnah-prayer tracking in the journal (deferred broad-tracker scope; the tasbih counter is §3's enhancement, not §8's)
- Seasonal/event badges (Ramadan, Dhul-Hijjah) — additive layer after the milestone system proves out
- Any public or shareable gamification surface — leaderboards, donor walls, share cards, public profiles (deliberately never, per the riya and no-social-comparison decisions; the §6 "year in giving" recap is a donation-dashboard concern, not a gamification one)
- Smart/adaptive nudge timing (revisit post-launch with real usage data)
- §9's full notification manager and data-export surfaces (this PRD ships only the journal-setup toggles and the data-shape obligations)
- Web admin panel changes of any kind

## Further Notes

- **Rollout is two releases** (grill decision), timed against Ramadan 2027 (~February): **R1 (~December 2026)** ships the journal, prayer logging, and the streak *with exempt-mode and freezes from day one* — the integrity model cannot be retrofitted, because launching streaks without exemption ships the menstruation-breaks-your-streak failure to production and migrating broken streaks later is a trust-destroying mess. **R2 (January 2027, pre-Ramadan)** ships badges, weekly reflection, nudges, and goal templates headlined by Khatm-in-Ramadan, so the system is soaked and warm before its highest-adoption season.
- **The v0 backend reconciliation is R1's first task** — the streak redefinition, journal restructure, and badge-tier migration land together before any mobile surface renders them.
- The two decisions that did the most design work, recorded for posterity: the all-5-or-nothing streak **forced** the exempt-mode design (the failure half this category's apps ship), and consistency-over-amount **defused** Generous Giver's riya problem without cutting the badge.
- The deliberately-ambiguous protected-day marker trades a small restore cost (exempt reasons don't survive a device change; streaks do) for closing a real inference channel about intimate health data. If a future encrypted-backup feature lands, exempt reasons may ride it — but only client-encrypted.
- The fixed-noon finalization boundary is a simplification of "next-day Fajr plus grace" chosen to keep StreakEngine pure and timezone-simple; it is generous in all realistic cases (Fajr in Dhaka never approaches noon). Recorded here so nobody "fixes" it into a per-masjid Fajr lookup without reading why.
- Dependency on PRD 03 is soft: the nudges and reflection ride its local-notification machinery, but R1 contains no notifications at all, and R2 could ship in-app-only surfaces if PRD 03 slips. Dependency on PRD 07's check-in data is soft too: Community Pillar counts whatever contributions exist.
