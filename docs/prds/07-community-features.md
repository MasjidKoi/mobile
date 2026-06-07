# PRD — Community Features (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native), plus the backend features this section cannot ship without: the followed-masjids feed endpoint, the review upsert, announcement notification routing (instant + digest), and per-masjid notification preferences.
> The web admin panel is untouched — masjid admins already author announcements and events through existing endpoints.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §7, 2026-06-06, reconciled against PRDs 01–04 during synthesis (see Implementation Decisions — several grill decisions were superseded by work those PRDs already claimed).
> Triage: `ready-for-agent`
> Amends: PRD 01/02/04 (the login wall now gates **eight** actions — Donate, Follow, Submit-a-masjid, Upload-photo, Ask-question, **RSVP, Write-review, Check-in** — extending PRD 04's five; same gate component, same post-login continuation). PRD 03 (announcement instant pushes and the daily digest are new message types on PRD 03's push subsystem and token registry; PRD 03's passing assumption that "announcements already notify followers" is made real here). PRD 04 (the profile page gains an announcements section and an upcoming-events section, and its reserved reviews slot is filled).

---

## Problem Statement

A Muslim user in Bangladesh who follows a masjid today gets nothing for it. The Follow button shipped in PRD 02/04 writes a row and stops there: no feed shows what followed masjids announce, no notification arrives when the Jumu'ah khutbah speaker changes or an Eid jamaat time is posted, and the masjid's events — Nikah ceremonies, charity drives, Qur'an classes — circulate on a cork noticeboard and in WhatsApp forwards the user may never see. The masjid profile that PRD 04 built reserves a slot for reviews but renders none, so a worshipper choosing between two unfamiliar masjids has no community signal at all, and a worshipper who *did* visit has no way to say "the sisters' section here is excellent." The backend has carried announcements, events, RSVP, reviews, and GPS check-in endpoints for months; the app exposes none of them. The community half of MasjidKoi — the half that turns a directory into a relationship — is dark.

## Solution

A Feed tab that makes following mean something, riding the push subsystem PRD 03 built and the profile page PRD 04 built:

- A new **Feed tab** in the existing tab bar with two segments: **Announcements** (newest first, from followed masjids) and **Events** (soonest first, from followed masjids) — one cursor-paginated backend feed endpoint behind both, rendered cached-first so the last-fetched feed appears instantly offline.
- **Announcements notify followers.** Per followed masjid the user chooses **digest** (default), **instant**, or **mute**. Digest users get one push a day — "3 new announcements from 2 masjids" — at an hour they choose (default 19:00); instant ones get pushed on publish; muted masjids stay in the feed but never push. Both are new message types on PRD 03's push pipeline, deep-linking into the feed.
- **Events become attendable:** RSVP with a visible attendee count ("43 going"), an add-to-calendar action after RSVPing, and a local reminder before the event — the same local-first notification philosophy as PRD 03's prayer reminders.
- The masjid profile (PRD 04's page) gains a **latest-announcements section** and an **upcoming-events section**, and its reserved reviews slot comes alive: average rating, recent reviews, and a write/edit flow backed by a new **review upsert** so editing your review is one screen, not delete-and-retype.
- **GPS check-in** surfaces on the profile — the backend already enforces the 100 m radius — and quietly powers the only review prompt the app will ever show: after you check in somewhere you haven't reviewed, once, gently.
- Reading is free everywhere, for everyone. RSVP, reviewing, and check-in join the deferred login gate; the feed itself simply shows guests a "follow masjids to build your feed" empty state, since following is already a gated, account-backed action.

Halal food (no backend exists), emoji reactions, owner responses to reviews, and the lost-&-found post type are explicitly out of this release.

## User Stories

### Feed tab — announcements
1. As a community member, I want a Feed tab showing announcements from all masjids I follow, newest first, so that one screen keeps me current with my masjids.
2. As a community member, I want each feed card to show the masjid name, announcement title, body preview, and how long ago it was posted, so that I can scan without opening anything.
3. As a community member, I want to tap a feed card to read the full announcement, so that long announcements aren't truncated into uselessness.
4. As a community member, I want to tap the masjid name on a card to open that masjid's profile, so that the feed is also a doorway to my masjids.
5. As a community member, I want the feed to load more as I scroll, so that older announcements remain reachable.
6. As a returning user, I want the feed to render instantly from cache and refresh in the background, so that I never stare at a spinner for content I saw this morning.
7. As a user on a dead connection, I want the last-fetched feed with an offline banner instead of a blank screen, so that the app degrades gracefully.
8. As a user who follows nobody yet, I want an empty state that explains the feed and offers a path to discover masjids, so that the tab teaches rather than confuses.
9. As a guest, I want to see the Feed tab with an explanation that following requires an account, so that I understand what I'm missing before I'm asked to log in.
10. As a community member, I want a pull-to-refresh gesture on the feed, so that I control freshness the way every feed app has taught me.
11. As a community member, I want an unread indicator on the Feed tab icon when new announcements arrived since my last visit, so that I know when there's something new without opening it.

### Feed tab — events
12. As a community member, I want an Events segment listing upcoming events from my followed masjids, soonest first, so that I never learn about an Eid dinner the day after.
13. As a community member, I want each event card to show title, masjid, date and time, and the attendee count, so that I can judge interest at a glance.
14. As a community member, I want past events to disappear from the feed automatically, so that the list is always actionable.
15. As a community member, I want to open an event for its full description and details, so that the card stays scannable.
16. As a community member, I want the attendee count ("43 going") on the event detail, so that social proof helps me decide.

### Follow management
17. As a community member, I want a "Masjids I follow" list reachable from the Feed tab, so that I can see and manage everything feeding this screen in one place.
18. As a community member, I want to unfollow a masjid from that list with the change applied instantly, so that pruning my feed is painless.
19. As a community member, I want the Follow button on a masjid profile (PRD 04's header) to reflect and toggle my follow state instantly, with the change rolled back if the network call fails, so that the UI never lies for long.
20. As a community member, I want following a masjid to start its announcements appearing in my feed and its notifications honouring my defaults, so that one tap means full enrolment.

### Notifications — instant, digest, mute
21. As a follower on instant mode for my home masjid, I want a push the moment it publishes an announcement, deep-linking to the announcement, so that time-critical notices (Janazah, schedule changes) reach me in time.
22. As a follower of several masjids, I want digest mode as the default, batching the day's announcements into one push, so that following five masjids doesn't make my phone unbearable.
23. As a digest user, I want the digest push to summarise ("3 new announcements from 2 masjids") and open the Feed tab, so that one tap shows me everything it promised.
24. As a digest user, I want to choose my digest hour, so that the daily push lands when I actually read my phone.
25. As a user who never chose an hour, I want a sensible default evening delivery time, so that digests work without configuration.
26. As a follower, I want a per-masjid notification setting — digest, instant, or mute — so that my home masjid can be loud and the masjid near my office can be quiet.
27. As a follower, I want muted masjids to keep appearing in my feed, so that mute silences my phone without unfollowing.
28. As a user with no new announcements today, I want no digest push at all, so that the app never sends an empty notification.
29. As a community member, I want a notification preferences screen — reachable from the Feed tab — listing my followed masjids with their modes and my digest hour, so that all of this is controllable in one place.
30. As a user who disabled OS notifications, I want the preferences screen to tell me pushes are off at the system level with a path to OS settings, so that I'm not configuring modes that can't fire.

### Events — RSVP, calendar, reminders
31. As a community member, I want to RSVP "Going" to an event with one tap, so that the masjid can gauge attendance and I'm committed.
32. As a community member, I want to cancel my RSVP just as easily, so that plans can change without friction.
33. As a guest tapping RSVP, I want the login sheet at that moment and my RSVP completed after login, so that the gate costs me nothing but the sign-in itself.
34. As an attendee, I want an "Add to calendar" action after RSVPing, so that the event lands in the calendar my family already checks.
35. As an attendee, I want a local reminder before the event starts, so that RSVPing actually changes whether I show up.
36. As an attendee, I want cancelling my RSVP to also cancel the app's reminder for it, so that I'm not nagged about events I bowed out of.
37. As an attendee, I want my RSVP state visible on the event card and detail ("You're going"), so that I never wonder whether it registered.

### Reviews — reading
38. As a worshipper comparing masjids, I want the profile's reviews section to show the average rating, review count, and recent reviews, so that community experience informs my visit.
39. As a worshipper, I want each review to show a star rating, text, reviewer display name, and date, so that reviews carry enough context to trust.
40. As a worshipper, I want to expand to a full paginated list of reviews, so that the profile section stays compact but nothing is hidden.
41. As a guest, I want to read all reviews without an account, so that the trust signal is never paywalled.

### Reviews — writing
42. As a visitor, I want to write a review with a 1–5 star rating and optional text, so that sharing my experience takes a minute.
43. As a guest tapping "Write a review", I want the login sheet at that moment, so that reviews are accountable without walling off reading.
44. As a reviewer, I want to edit my existing review — stars and text — in the same flow, with my review marked as edited, so that updating my opinion doesn't mean deleting history.
45. As a reviewer, I want to delete my review, so that I control my own contributions.
46. As a reviewer leaving a low rating, I want to be asked for a few words of explanation, so that my warning helps others instead of just venting.
47. As a reviewer, I want my review to appear in the list immediately after submitting, so that the contribution feels real.
48. As a user who checked in at a masjid I haven't reviewed, I want a single gentle prompt afterwards asking if I'd like to review it, so that reviews come from people who were actually there.
49. As a user who dismissed that prompt, I want it to never reappear for that masjid, so that the app respects a "no".

### Check-in
50. As a worshipper at a masjid, I want a check-in action on its profile that works when I'm within 100 m, so that I can mark my visit while standing in it.
51. As a worshipper just out of range, I want a clear "you need to be at the masjid to check in" message, so that a failed check-in is comprehensible, not broken.
52. As a guest tapping check-in, I want the login sheet at that moment, so that check-ins attach to my identity.
53. As a privacy-conscious user, I want my check-ins visible to no one but me, so that my attendance is never social data.
54. As a user who just checked in, I want a brief confirmation, so that the action feels acknowledged without ceremony.

### Profile sections (amending PRD 04's page)
55. As a worshipper on a masjid profile, I want its latest announcements in a compact section with a "see all", so that the masjid's voice is part of its profile.
56. As a worshipper on a masjid profile, I want its next upcoming events with RSVP available inline, so that profile visits convert into attendance.
57. As a worshipper on an unclaimed masjid's profile with no announcements or events, I want those sections to collapse rather than render empty, so that most of the 300k masjids don't look abandoned.

### Localisation & polish
58. As a Bengali user, I want every community surface — feed, events, reviews, prompts, notification preferences, pushes — in Bengali by default, so that the community speaks my language.
59. As a community member, I want all my actions (follow, RSVP, review, check-in) applied optimistically with rollback on failure, so that the app feels instant on a slow connection.
60. As a user arriving by push, I want the notification to deep-link to exactly the thing it announced, so that a push is a door, not an advertisement.

## Implementation Decisions

### Reconciliations with PRDs 01–04 (grill decisions superseded during synthesis)

- **The push subsystem is PRD 03's, not this PRD's.** The grill session scoped "build full push now"; PRD 03 has since claimed token registry, fan-out, message-type discriminator, and the mobile PushLink module. This PRD adds **two message types** (announcement-instant, daily-digest), the preference model that routes them, and the digest job — nothing else. The grill session's transport choice (Expo Push Service) is recorded as the preferred resolution of the transport question PRD 03 left to the implementer; it binds only if PRD 03 hasn't already chosen.
- **The masjid profile screen is PRD 04's, not this PRD's.** The grill session scoped "build a minimal detail screen now"; PRD 04 builds the full profile with Follow in the header and a reserved reviews slot. This PRD **fills the reviews slot** and **adds two sections** (latest announcements, upcoming events) to PRD 04's single-scroll layout, placed after the facilities region and before visitor photos. Both sections collapse entirely when empty.
- **§7's "report incorrect info" already shipped** as PRD 04's suggest-an-edit (per-field report model, open to guests). Not re-specified here.
- **The tab bar exists; its map tab is named Explore** (PRD 02). This PRD adds one tab — **Feed** — rather than renaming anything.
- **Login gate grows to eight actions:** Donate, Follow, Submit-a-masjid, Upload-photo, Ask-question, RSVP, Write-review, Check-in. Same gate component, same post-login continuation of the interrupted action. (PRD 04 predicted §5 would close the list; §7 reopens it — the gate-list registry PRD 04 asked for should be updated.)

### Feed

- **One aggregated feed endpoint, type-parameterised** (grill decision): authenticated, joining the user's follows to published announcements (`type=announcements`, published-at descending) or upcoming events (`type=events`, starts-at ascending, past events excluded server-side). Cursor-paginated like the other list contracts. Client-side fan-out across per-masjid endpoints was rejected (N requests per refresh on metered connections, broken cross-masjid pagination); per-masjid tabs without a merged feed was rejected (deviates from the spec'd UX).
- **Feed responses embed the masjid's id and display name per item** so cards render without follow-up calls; event items embed the attendee count and the caller's RSVP state for the same reason.
- **Cached-first rendering** per the product-polish doctrine: last-fetched feed persists on device and renders instantly; refresh happens in the background on tab focus and pull-to-refresh. The unread tab indicator derives from newest-item-timestamp vs last-seen-timestamp, locally.

### Notifications

- **Per-masjid notification mode lives on the follow relationship** — `digest` (default) | `instant` | `mute` — because the preference's lifetime is exactly the follow's lifetime. The **digest hour lives on the user** (0–23, default 19), interpreted in **Asia/Dhaka**: the audience is Bangladesh and one product timezone removes per-user timezone machinery; revisit only if the app ever leaves BD.
- **User-chosen digest hour** ⚠️ (user's call over the recommended fixed-hour-for-everyone): the digest job runs **hourly** on the existing backend scheduler and each run serves the bucket of users whose chosen hour matches the current Asia/Dhaka hour. Consequence accepted in the grill session: an hourly bucketing job instead of one fixed daily job.
- **Digest semantics:** for each due user, collect announcements published since the user's last digest (bounded at 24 h) from follows in digest mode; if none, send nothing. One push per user per day, summarising count and masjid count, deep-linking to the Feed tab. A last-digest-sent timestamp per user makes the job idempotent across restarts.
- **Instant semantics:** the announcement **publish** action (the existing endpoint — covering both direct publish and draft-then-publish paths) fans out to followers in instant mode via PRD 03's pipeline. Unpublishing or editing sends nothing.
- **Mute** suppresses both push paths; the feed is unaffected. Unfollowing removes the masjid from feed and pushes both.
- Both new message types carry the masjid id and item id on PRD 03's discriminator contract so PushLink can deep-link (instant → the announcement; digest → the Feed tab).
- **A minimal notification-preferences screen ships in this PRD** (the grill session flagged that §9's settings don't exist yet): followed masjids with a three-state control each, the digest-hour picker, and an OS-permission status row. §9's full notification manager later absorbs it.

### Events

- **RSVP is binary** (going / not going), optimistic with rollback, riding the existing RSVP endpoint; the attendee count comes from the existing attendees contract.
- **Add-to-calendar** uses the device calendar via the Expo calendar module, offered (not forced) after a successful RSVP.
- **Event reminders are local notifications** — one hour before start, cancelled if the RSVP is cancelled — following PRD 03's local-first doctrine and riding its scheduling machinery rather than inventing a parallel scheduler. No server push for event reminders.

### Reviews

- **A review upsert replaces the create-only flow** (grill decision): one idempotent "put my review" operation that creates or fully replaces the caller's single review (the one-review-per-user-per-masjid constraint already exists), stamping an edited marker on replacement. The existing create endpoint's 409-on-duplicate made editing impossible without delete-and-recreate, which was rejected as non-atomic.
- **Review prompt is behaviour-gated** (grill decision): the only unsolicited review ask in the app fires after a successful check-in at a masjid the user hasn't reviewed, at most once per masjid ever, dismissible permanently. Cold popups rejected per the source doc.
- **Low ratings ask for words** (refined during synthesis from the doc's "minimum character count" guidance): a 1–2-star review requires a short text body (minimum ~20 characters); 3–5 stars may be stars-only. A blanket text requirement was rejected (kills contribution volume); no minimum at all was rejected (invites drive-by 1-stars).
- Reviews render with the stored reviewer display name; deletion uses the existing delete endpoint.

### Check-in

- **The server stays the authority on the 100 m rule** (already enforced via PostGIS); the client pre-checks distance only to label the button state, and translates the server's rejection into the "you need to be at the masjid" message. Check-ins are private — no public surface anywhere in this PRD; §8 will build streak/badge surfaces on this same data later.

### Modules

**Mobile:**
- **FeedStore (deep).** The single authority for feed data: cursor pagination for both segments, persistence, cached-first reads with background refresh, last-seen tracking for the unread indicator. Nothing else fetches the feed.
- **FollowStore (deep).** The single authority for follow state and per-masjid notification mode: optimistic toggle with rollback, consumed by the profile header button (PRD 04), the follow-management list, the preferences screen, and FeedStore invalidation.
- **RsvpManager.** RSVP toggle (optimistic), the calendar insert, and the local event-reminder schedule/cancel pair — the invariant "reminder exists iff RSVP'd and event is future" lives here and only here.
- **ReviewPromptGate (deep, pure logic).** Decides prompt eligibility from (check-in event, my-review existence, per-masjid prompt history). No I/O; trivially testable.
- **ReviewComposer.** The write/edit flow: star input, conditional body validation, upsert call, optimistic list insertion.
- **CheckInFlow (shallow).** Location read, distance pre-check, endpoint call, success/too-far states, and emitting the check-in event ReviewPromptGate consumes.
- **Feed tab screen + preferences screen (shallow).** Composition over the stores; as little logic as possible.
- **PushLink extension (PRD 03's module).** Routing for the two new message types.

**Backend:**
- **Feed endpoint:** the cursor-paginated, type-parameterised follow-join described above.
- **Review upsert:** the put-my-review operation with the conditional-body validation.
- **Notification preferences:** the mode field on the follow relationship (defaulted for existing rows), the digest-hour field on the user, and read/update contracts for both.
- **AnnouncementNotifier:** the publish-time hook resolving instant-mode follower devices through PRD 03's token registry and fanning out.
- **DigestScheduler:** the hourly bucketing job with the idempotency timestamp.

## Testing Decisions

- A good test exercises external behaviour through the public interface — endpoint contracts and module outputs, never internal queries or scheduler internals.
- **Committed — backend tests for DigestScheduler bucketing** (prior art: the backend's established pytest suite): hour-bucket selection against Asia/Dhaka, digest/instant/mute routing (instant-mode items never re-digested, muted items never pushed), empty-digest suppression, the one-push-per-user-per-day invariant, and idempotency across a re-run.
- **Committed — backend tests for the feed endpoint:** only followed masjids' items appear, only published announcements, only future events, correct per-type ordering, cursor stability across pages, and the embedded RSVP/attendee fields.
- **Considered and not committed:** review-upsert semantics (create-vs-replace, conditional body rule), ReviewPromptGate (pure logic — the natural first mobile test if prompt regressions appear), and FeedStore merge behaviour. Noted for the implementer per the pattern of PRDs 02–04.
- Manual verification checklist ships with the implementation PR description: follow → announcement publish → instant push deep-link; digest at a chosen hour with mixed modes; mute behaviour; RSVP → calendar insert → reminder → cancel-RSVP cancels reminder; review write → edit → delete; low-star body requirement; check-in in/out of range; prompt fires once and respects dismissal; guest gating on all four new gated actions; offline feed render; Bengali rendering across all new surfaces.

## Out of Scope

- **Halal food nearby tab** (§7 spec'd) — zero backend exists; needs its own data-model and sourcing decision before any PRD can spec it
- Emoji reactions on announcements (enhancement — declined in the grill session)
- Owner responses to reviews (enhancement — declined; also touches the web admin panel)
- Lost & found / community noticeboard post type (enhancement — declined)
- Comments on announcements (deliberately never — the doc's moderation rationale stands)
- Gamification surfaces: streaks, badges, ibadah journal (§8 — check-in data feeds them later)
- §9's full notification manager (this PRD ships only the minimal preferences surface it needs)
- Review moderation/flagging tooling and the NGO's abuse-handling workflow
- Web admin panel changes of any kind

## Further Notes

- **Sequencing is vertical slices** (grill decision): ① feed endpoint + Feed tab (announcements) + follow management → ② events segment + RSVP + calendar/reminders + profile sections → ③ reviews + check-in + prompt gate → ④ preferences + instant push + digest. Each slice is user-visible and testable; push lands last because it layers onto a working feed. This deliberately reverses PRD 04's backend-first call — community features have a usable pull-based core worth shipping early, which §4's profile page did not.
- **Dependency on PRD 03's push infra is hard for slice ④ only.** If PRD 03's token registry slips, slices ①–③ ship unaffected and the feed works pull-based; that cut line is pre-approved.
- **Dependency on PRD 04's profile page is hard for the profile sections and the reviews slot** (slices ②–③). The Feed tab itself (slice ①) needs only navigable masjid routes, which PRD 02 established.
- The Asia/Dhaka single-timezone digest decision is the one most likely to age: it is recorded on the user-model decision above and should be revisited before any international launch.
- The grill session's project memory (`masjidkoi-section7-community-design`) predates this synthesis; this PRD's reconciliations supersede it where they conflict (detail screen, push ownership, report flow).
