# PRD — Masjid Profile & Facilities (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native) — the full masjid profile page PRD 02 deferred ("this PRD only delivers the route and the peek card that links to it") — plus the two backend features this section cannot ship without: the community-photo submission pipeline and the masjid Q&A subsystem, including the shared moderation-routing rule both depend on.
> The web admin panel's moderation-queue and Q&A-inbox UIs are listed as **dependencies** — this PRD does not spec admin panel internals.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §4, 2026-06-06.
> Triage: `ready-for-agent`
> Amends: PRD 01/02 (the login wall now gates **five** actions — Donate, Follow, Submit-a-masjid, **Upload-photo, Ask-question** — extending PRD 02's "exactly three"; same gate component, same post-login continuation. Suggest-an-edit is deliberately **not** gated). PRD 03 (the profile page embeds PRD 03's masjid-page times section as-is; the Q&A answer push and photo-approval push are two new message types on PRD 03's push subsystem and token registry).

---

## Problem Statement

A worshipper who has found a masjid on the map still cannot answer the questions that decide whether to walk in: is there a sisters' section, can a wheelchair get in, who is the imam, is there parking, how do I call them? Today MasjidKoi's backend holds all of this — facilities, capacity, imam, contact, a photo gallery — and the mobile app shows none of it: the peek card's "Details" button leads nowhere. Worse, with 300,000+ masjids and an NGO that can photograph and verify only a fraction, most profiles will launch sparse or stale, and the people who know the truth — the worshippers standing inside the building — have no way to contribute a photo, ask the masjid a question, or flag that the phone number is wrong. The app's data-quality problem is also its users' daily frustration, and right now neither side can help the other.

## Solution

A single-scroll, prayer-times-first profile page rendered from the existing one-call profile endpoint, with three contribution channels that turn users into the NGO's data-quality workforce:

- The first viewport answers the visit decision: cover photo and gallery, name with a **verified badge** for NGO-confirmed masjids, distance and area, Directions / Follow / Share actions (PRD 02's machinery), and PRD 03's next-prayer block with azan and iqamah. **Donate stays sticky** at the bottom through the whole scroll — §5's "donate button on every masjid profile" survives any page length.
- Below the fold: facility chips (sisters' section, wudu M/F, wheelchair, parking, janazah, school), **capacity figures** from the data the backend already holds ("Capacity ~800 · Parking ~30"), the imam card (name, qualifications, languages), and tappable contact rows — phone, WhatsApp, email, website.
- **Photos from visitors:** any logged-in user can submit photos (rate-limited), which enter a moderation queue and, once approved, render in a visitor strip **separate from** the admin's curated ≤10-photo gallery — the admin never loses control of the cover or the gallery; the community never hits the cap.
- **Ask the masjid:** logged-in users submit questions; only the masjid admin (or the NGO, for unclaimed masjids) answers — every answer is inherently verified. **Only answered Q&A is public**, so a profile reads as a curated FAQ and never as "14 questions · 0 answers". The asker gets a push when their answer lands.
- **Suggest an edit** on any displayed field — wrong phone, parking closed, imam changed — as a field-picker + free-text report into the existing per-field report model. Open to guests: a wrong phone number reported anonymously is still a fix.
- One **moderation-routing rule** keeps contributions from rotting: items route to the masjid admin's queue when the masjid has a claimed admin; unclaimed masjids route to the NGO; anything pending longer than 7 days becomes visible to the NGO as well — shared visibility, not a handoff, so a dormant admin can never silently kill the feature for their masjid.

## User Stories

### Profile page & header
1. As a user tapping "Details" on the map peek card, I want a full profile page for that masjid, so that the map's promise of depth is kept.
2. As a user opening a profile, I want the cover photo, name, area, and my distance to it in the first viewport, so that I instantly confirm I'm looking at the right masjid.
3. As a user, I want the admin's photo gallery (up to 10) swipeable from the header, so that I can see the masjid before I visit.
4. As a user, I want Directions, Follow, and Share actions directly on the profile header, so that the three most common next steps are one tap (per PRD 02's directions, follow gate, and share links).
5. As a user, I want the next prayer with azan and iqamah, today's five-prayer table, and the Jumu'ah schedule on the profile, so that the visit-planning question is answered on this page (per PRD 03's times section).
6. As a donor, I want a Donate button that stays visible while I scroll, so that the impulse to give never requires hunting (wired per §5; hidden when the masjid has donations disabled).
7. As a user opening a profile I've viewed before, I want the cached version rendered instantly while fresh data loads silently, so that I never watch a spinner for data I saw yesterday.
8. As a user following a deep link (per PRD 02's share URLs), I want it to open this profile directly, so that a WhatsApp share lands somewhere real.

### Verified badge
9. As a user, I want NGO-verified masjids to show a verified badge beside the name, so that I can tell confirmed data from crowd-sourced or imported data.
10. As a user tapping the badge, I want one sentence explaining what verification means, so that the trust signal is comprehensible, not decorative.
11. As a user, I want the same badge on the profile that I saw on the pin, peek card, and list row, so that the trust signal is consistent everywhere (per PRD 02).

### Facilities, capacity & imam
12. As a sister, I want the sisters'-section indicator prominent on the profile, so that I know whether I can pray there before travelling.
13. As a wheelchair user, I want the wheelchair-access indicator with equal prominence, so that accessibility is a first-class fact.
14. As a user, I want all facility indicators (wudu M/F, parking, janazah, Islamic school) as scannable chips, so that I absorb the facts in one glance.
15. As a user, I want facilities the masjid doesn't have shown as absent rather than hidden, so that "no parking" is information, not a gap I must guess about.
16. As a Jumu'ah attendee, I want the masjid's capacity figures shown ("Capacity ~800 · Parking ~30") when the data exists, so that I can judge how early to arrive.
17. As a user, I want the imam's name, qualifications, and languages on the profile, so that I know who leads and whether I'll understand the khutbah.
18. As a user viewing a sparse profile, I want missing sections (no imam set, no capacity, no photos) to collapse gracefully, so that an unclaimed masjid's page still looks intentional, not broken.

### Contact
19. As a user, I want the masjid's phone number to dial on tap, so that calling takes one touch.
20. As a user, I want a WhatsApp row that opens a chat with the masjid's WhatsApp number, so that I can use Bangladesh's default messaging channel.
21. As a user, I want email and website rows that open my mail app and browser, so that every contact channel works the way the platform expects.
22. As a user, I want contact rows shown only for channels the masjid actually has, so that I never tap a dead row.

### Photos from visitors — contributing
23. As a visitor who took a good photo of the masjid, I want to submit it from the profile, so that I can improve a sparse page myself.
24. As a guest tapping "Add photo", I want the login sheet at that moment (per PRD 01's deferred wall), so that contributing is gated but browsing never was.
25. As a contributor, I want to pick a photo, see it compressed and uploaded with progress, and get a clear "submitted for review" confirmation, so that I know my contribution is in the pipeline, not lost.
26. As a contributor, I want my pending/approved/rejected submissions visible in my profile, so that I can see my contribution wasn't swallowed (mirrors PRD 02's my-submissions pattern).
27. As a contributor, I want a push notification when my photo is approved, so that I get the small reward that keeps contributors contributing.
28. As a user, I want photo submission rate-limited (a few per masjid per day, a daily total cap), so that the moderation queue can't be flooded and my own genuine photos always fit.

### Photos from visitors — viewing
29. As a user, I want approved visitor photos in a strip separate from the admin gallery, so that I can see both the official face and the lived reality of the masjid.
30. As a user, I want the visitor strip to lazy-load and paginate, so that a popular masjid's hundreds of photos don't weigh down the profile.
31. As a masjid admin, I want my curated gallery, cover photo, and ordering untouched by community photos, so that I keep control of how my masjid presents itself.

### Q&A — asking
32. As a user with a practical question ("Is there women's parking?", "When does the gate open for Fajr?"), I want to ask it from the profile, so that I don't need to find a phone number for a small question.
33. As a guest tapping "Ask a question", I want the login sheet at that moment, so that questions are accountable without walling off reading.
34. As an asker, I want my question acknowledged as "sent to the masjid" with a visible pending state in my profile, so that I know it reached someone.
35. As an asker, I want a push notification when my question is answered, deep-linking to the answer, so that the loop closes without me polling.
36. As an asker whose question was rejected (off-topic, abusive), I want to see that status in my profile without a public trace, so that moderation is firm but not humiliating.

### Q&A — reading
37. As a user, I want answered questions visible on the profile as a FAQ section, so that common questions are answered before I ask them.
38. As a user reading an answer, I want it visibly attributed to the masjid (admin-answered) or the NGO, so that every published answer carries authority.
39. As a user on a profile with no answered questions yet, I want the section to show only the "Ask" affordance, so that an empty Q&A never reads as a dead app.
40. As a user about to ask, I want existing answered questions surfaced first, so that duplicates are deflected before they're typed.

### Suggest an edit
41. As a user spotting a wrong field (phone, parking, imam name, prayer time), I want a "Suggest an edit" entry point on the profile, so that fixing the app's data takes seconds.
42. As a reporter, I want to pick the specific field that's wrong and describe the fix in free text, so that my report is actionable, not a vague complaint.
43. As a guest, I want to suggest an edit without logging in, so that the lowest-friction contribution channel has no gate at all (the existing report model already accepts anonymous reports).
44. As a reporter, I want a confirmation that my report went to the masjid/NGO, so that the action feels consequential.
45. As the NGO, I want suggest-an-edit reports to land in the existing per-field report queue with its pending→reviewed→resolved lifecycle, so that no parallel triage process is invented.

### Moderation & routing
46. As a masjid admin, I want photo submissions and questions for my masjid in my own queue, so that I control my masjid's public face and answer with authority.
47. As the NGO, I want submissions for unclaimed masjids routed to the central queue, so that the majority of the 300k masjids still get moderated contributions.
48. As the NGO, I want any item pending longer than 7 days to appear in my queue even when the masjid has an admin, so that a dormant admin can't silently kill contributions for their masjid.
49. As either moderator, I want approve/reject actions on photos and answer/reject actions on questions, so that the queue is a workflow, not a report.
50. As the NGO, I want a banned or repeatedly-rejected uploader identifiable by account, so that abuse has a handle (uploads require login by design).

### Guest access
51. As a guest, I want to read everything on the profile — photos, facilities, contact, answered Q&A — so that the app's core information is never login-walled (per PRD 01).
52. As a guest tapping a gated contribution (photo, question), I want the login sheet to return me to my in-progress action after login, so that the gate is a step, not a restart.

### Performance, offline & accessibility
53. As a user on rural connectivity, I want previously viewed profiles (including their facility and contact data) cached and rendered offline with a stale-data banner, so that connectivity gaps degrade the page instead of erasing it (per the NFR).
54. As a user on metered data, I want gallery and visitor photos loaded at screen-appropriate resolution and only when scrolled into view, so that one profile visit doesn't burn my data budget.
55. As a TalkBack/VoiceOver user, I want facility chips announced with their state ("Sisters' section: available"), contact rows labelled with their action ("Call masjid"), and the gallery navigable, so that the profile is usable unassisted.
56. As a Bengali user, I want every profile surface — facility labels, Q&A, edit-report form, moderation copy — in Bengali by default, so that the page speaks the audience's language.
57. As an older user, I want the profile to respect system font scaling with 44pt touch targets throughout, so that "intuitive for all age groups" is real on this page.

## Implementation Decisions

### Decisions inherited from the design session (binding)

- **All four §4 enhancements are in scope** (explicit user call): verified badge, per-field suggest-an-edit, capacity display, community photo uploads, and Q&A. The first three are nearly free against the existing backend; the last two are the new backend work of this PRD.
- **Sequencing is backend-first** ⚠️ (user's call over the recommended screen-first phasing): all backend work — photo pipeline, Q&A subsystem, moderation routing — lands before mobile profile work begins, and the mobile screen is built once against the final contract. Consequence: the API contract in this PRD is binding, not provisional. The recorded fallback if timelines slip: the profile screen with everything the existing API already serves (spec'd content + badge + capacity + suggest-an-edit) is a clean cut line; nothing in the decisions below precludes cutting there.
- **Moderation is hybrid with a precise routing predicate:** an item routes to the masjid admin's queue when the masjid has a claimed admin, otherwise to the NGO central queue; any item still pending after **7 days** becomes visible in the NGO queue as well. Shared visibility, not a handoff — either party can action it. The predicate is one pure rule over (has-claimed-admin, pending-since) used identically by the photo and Q&A queues.
- **Community photos: two sections, cap on admin only.** The existing photo model is extended with `source` ('admin' | 'community'), `status` ('pending' | 'approved' | 'rejected'), and a nullable `uploaded_by` (SET NULL on user deletion); existing rows backfill as admin/approved. The admin gallery keeps the SRS's 10-photo cap, the cover flag, and display ordering; approved community photos render in a separate "Photos from visitors" strip and never count against the cap or participate in cover/ordering. Rejected single-merged-gallery (cap eviction fights, curation entangled with UGC) and a separate submissions table (two tables to sync for the same lifecycle).
- **Photo upload gate: logged-in + rate-limited.** Login required via the deferred login sheet (amending the gate list to five actions); limits of ~3 photos per masjid per day and ~10 per day total per user, 5 MB each (matching the existing admin upload limit), enforced through the existing rate-limit layer. Check-in gating was considered and rejected (check-in is optional and privacy-gated — it would block legitimate contributors); guest uploads rejected (no accountability handle for the moderation pipeline).
- **Q&A is "ask the masjid": admin-only answers at launch.** Any logged-in user asks; only the masjid admin — or the NGO for unclaimed masjids — answers, so every published answer is inherently verified and the moderation surface is questions-only. The answer record carries an author-role field so community answers can be opened up later without a schema change. Full Google-Maps-style community answers rejected for launch (doubles moderation volume; religious misinformation under the app's brand).
- **Only answered Q&A is public.** A question's lifecycle is pending → answered | rejected; it appears on the profile only once answered. The asker sees their own pending/rejected items in their profile and gets a push (riding PRD 03's push subsystem) when answered; rejection is visible to the asker only — no public trace, no rejection push. Public-unanswered (Google's model) rejected: most of the 300k masjids are unclaimed, and "14 questions · 0 answers" reads as a dead app.
- **Suggest-an-edit reuses the existing per-field report model as-is:** the mobile flow is a field picker (mapping to the report model's `field_name`) plus free-text description, feeding the existing pending→reviewed→resolved queue. Open to guests — the model's nullable reporter contact already supports it, and anonymous data-quality signal is worth more than gate-consistency. A structured `suggested_value` (one-click admin apply) is deliberately deferred until edit volume justifies it; the hybrid (structured booleans only) was rejected as two code paths from day one.
- **Capacity display only — no busyness column** ⚠️ (user's call over the recommended advisory-text field): the profile renders the capacity and parking-capacity figures the facilities model already holds; no "arrive 20 min early" admin-entered text ships, and no migration touches the facilities table. Consequence: the only §4 advisory the user sees is numeric.
- **Page layout is prayer-times-first, single scroll:** header (gallery, name + verified badge, distance/area, Directions/Follow/Share) → PRD 03's next-prayer block and times table → facilities/capacity/imam/contact → visitor photos, answered Q&A, reviews slot, suggest-an-edit → sticky Donate bar. Tabs rejected (hides the glance-and-go content); donation-first rejected (misreads intent and erodes trust).
- **Verified badge** renders from the verified flag already present in the profile and summary schemas, identically on profile, peek card, list, and pins (PRD 02 already requires it in summaries); tapping it shows a one-line explainer. No new backend work.

### Mobile modules (the work of this PRD)

- **MasjidProfileScreen.** The composition surface: header with gallery and actions, embedded PRD 03 times section, facility/imam/contact sections, visitor-photo strip, answered-Q&A list, suggest-an-edit entry, sticky Donate bar, cached-first rendering with stale banner, deep-link target (route already exists from PRD 02). As little logic as possible; everything below does the work.
- **FacilityPresenter (deep module, pure).** Facilities/capacity/imam response → display model: chip list with present/absent states, capacity line formatting (handles any subset of male/female/parking being null), imam card descriptor, section-collapse signals for sparse profiles. The null-tolerance guarantee for unclaimed masjids lives (and is tested) here.
- **ContactLinks (extends PRD 02's LinkBuilder).** Pure construction of `tel:`, `mailto:`, WhatsApp chat, and website URIs from the contact record, with per-channel presence flags; same fail-closed posture as LinkBuilder's existing functions.
- **CommunityPhotoFlow.** The contribution pipeline's client: login-gate reuse, image pick + client-side compression, upload with progress against the community endpoint, rate-limit error presentation, and the my-submissions status list (pattern-matching PRD 02's submission status UI).
- **QnAFlow.** Ask form behind the login gate (with answered-questions-first deflection), the public answered list with attribution, the my-questions status list, and the answer-push deep-link target.
- **SuggestEditFlow.** Field picker + free-text form posting to the existing report endpoint; guest-accessible; field vocabulary from the contract below.
- **ProfileApiClient (extends PRD 02's MasjidApiClient).** Typed calls for the profile read (existing), community-photo submit/list, questions submit/list/mine, and the existing report endpoint.

### Backend changes required

- **PhotoSubmissionPipeline:** the photo-model extension and backfill above; a community upload endpoint (authenticated, rate-limited, same file constraints as the admin path, always created as pending); approve/reject moderation endpoints authorised for the masjid's admin and platform admins; public listing of approved community photos, paginated, separate from the profile's admin gallery; a my-photo-submissions read; an approval push (new message type on PRD 03's subsystem).
- **QnAService:** a questions model (masjid, asker, question text, status, answer text, answerer, timestamps); authenticated ask endpoint (length-validated, rate-limited); public answered-questions listing per masjid; my-questions listing; an answer endpoint (sets answer + status atomically, fires the asker's push) and a reject endpoint, both authorised like photo moderation.
- **ModerationRouting (deep module, pure):** the queue-visibility predicate over (item, masjid-has-claimed-admin, pending-since, now) shared by both moderation list endpoints — implemented once, used by both, so the 7-day rule can never drift between content types.
- **Existing endpoints reused as-is:** the one-call profile read (already aggregates facilities, contact, photos, verified), the per-field report endpoint, follows, and PRD 03's prayer-times and push-token machinery.

### Contract clarifications

- The profile response's photo list carries **admin gallery photos only** (community photos arrive via their own paginated endpoint) — existing mobile consumers of the profile payload are unaffected by the pipeline.
- The community-photo and question status enums (pending/approved|answered/rejected) are stable strings; "mine" endpoints return them with timestamps so the status UIs need no extra calls.
- The suggest-an-edit field vocabulary is a fixed list agreed in the implementation PR (covering at minimum: each facility flag, capacity figures, imam fields, each contact channel, address/location, prayer times, "other") — mobile's field picker and the admin queue's display both bind to it.
- The answer push and photo-approval push are distinct message types on PRD 03's discriminator field, each carrying the masjid id and the item id so PushLink can deep-link to the answer / the contributor's submission list.
- Rate-limit responses for uploads and questions must be distinguishable from validation failures so the client can say "try again tomorrow" rather than "something's wrong with your photo".

## Testing Decisions

A good test exercises **external behaviour through the module's public interface** — what a caller observes — never internal state or implementation sequencing. Tests should survive a rewrite of the module's internals.

- **Committed: the two pure-logic mobile modules** (user's explicit selection; the Jest setup exists from PRD 02):
  - **FacilityPresenter** — every facility-flag combination renders a chip with the right present/absent state; capacity line formats correctly for each subset of (male, female, parking) being null and is absent when all are; imam card descriptor handles partial fields; sparse-profile collapse signals fire exactly when a section has no data.
  - **ContactLinks** — `tel:`/`mailto:`/WhatsApp/website URIs are built correctly from the contact record; channels absent from the record produce no row; malformed inputs fail closed (consistent with LinkBuilder's existing tests).
- **Considered and not committed:** backend pytest for ModerationRouting (the claimed/unclaimed × fresh/stale matrix), the Q&A lifecycle (answered-only public listing, exactly-one push per answer), and photo-submission rules (rate limits, admin-cap-untouched invariant). Prior art: the backend's established pytest suite — noted for the implementer as the natural first additions if moderation or Q&A regressions appear, the routing predicate first among them.
- Manual verification checklist for the end-to-end flows (upload → pending → approve → strip render + push; ask → answer → public + push; guest suggest-an-edit; 7-day NGO visibility; gallery cap untouched by community approvals; offline profile render) ships with the implementation PR description.

## Out of Scope

- Web admin panel **UIs** for the moderation queues and Q&A inbox (backend endpoints in scope; admin UI is a dependency, per PRD 02/03 convention)
- Busyness advisory text / "arrive 20 min early" hints (⚠️ rejected for this release, user's call — capacity figures only)
- Structured `suggested_value` on suggest-an-edit and one-click admin apply (deferred until edit volume justifies it)
- Community answers on Q&A (schema ships ready via the author-role field; product decision deferred)
- Ratings & reviews **content** (§7, post-MVP per the SDD — the layout reserves the slot; backend endpoints that already exist are not surfaced by this PRD)
- Owner responses to reviews (§7)
- EXIF-based photo verification, image-recognition pre-screening, or any automated moderation
- Photo captions, likes, or attribution display beyond the moderation system's internal record
- Check-in-gated contribution privileges (rejected for the upload gate; unrelated to §7's check-in feature itself)
- Q&A search, voting, or "N people asked this" social proof

## Further Notes

- **The riskiest decision is backend-first sequencing** ⚠️: the profile page — the destination for every pin, list row, search result, and share link shipped in PRD 02 — does not exist until the least-validated features (Q&A, photo pipeline) have landed. The cut line is recorded in the binding decisions: if dates slip, ship the screen against the existing API and let the two pipelines follow. Whoever owns the roadmap should treat that line as pre-approved.
- **ModerationRouting is deliberately one shared module**, not two WHERE clauses: the 7-day rule is the kind of constant that silently forks between content types. If the NGO later tunes the window (7 → 3 days during a launch push), it changes in one place.
- The moderation queues will be exercised through the API before any admin UI exists (backend-first); seeding a few claimed and unclaimed masjids in the dev environment is the practical way to verify routing during development.
- Photo storage rides the existing storage service and the existing 5 MB constraint; community volume is bounded by the rate limits, not by trust.
- The five-action login-gate list (Donate, Follow, Submit, Upload-photo, Ask-question) should be recorded wherever PRD 01's gate component is documented — three PRDs have now amended it, and the next (§5, Donate) closes the list.
- PRD 01's note stands: the feature doc claims a Node.js backend; it is FastAPI. Contracts here are written against the actual backend.
