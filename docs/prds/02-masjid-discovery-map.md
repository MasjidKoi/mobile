# PRD — Masjid Discovery & Map (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native), plus the backend contracts and the one backend feature (masjid submissions) this section cannot ship without.
> The web admin panel's submission review queue UI is listed as a **dependency** — this PRD does not spec admin panel internals.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §2, 2026-06-06.
> Triage: `ready-for-agent`
> Amends: PRD 01 (`01-onboarding-authentication.md`) — see Implementation Decisions for the one recorded amendment.

---

## Problem Statement

A Muslim user in Bangladesh who wants to find a masjid today juggles Google Maps (which knows buildings, not Iqamah times or whether there is a sisters' section) and word of mouth. MasjidKoi's database exists and the backend can already answer "what masjids are within X metres of me" — but the mobile app has no map, no list, no search, and no way to reach a masjid profile at all. A worshipper in an unfamiliar neighbourhood cannot answer the app's namesake question: *where is the masjid?* Worse, with 300,000+ masjids in the country and an NGO that can only verify them one at a time, the masjids users need most — the small ones in their own area — are exactly the ones most likely to be missing, and there is currently no way for a user to tell anyone.

## Solution

A map-first Explore experience backed by the existing nearby/search APIs, plus a user-submission pipeline that turns coverage gaps into crowdsourced data:

- Opening Explore shows a **Google map centred on the user** with masjids within 1–2 km already pinned; panning anywhere loads that area's masjids automatically. Pins accumulate in a local store so revisited areas render instantly and the last session's pins survive offline cold-starts.
- Dense areas **cluster** into numbered bubbles that split apart on zoom; two masjids 50 m apart never overlap.
- Tapping a pin opens a **peek card** (photo, name, distance, verified badge, facilities, next prayer, Directions + Details) without leaving the map; the full profile is one more tap.
- **Search** autocompletes masjid names and areas, ranked by proximity to the user. **Facility filters** (Sisters section, Wudu, Wheelchair, Parking, Janazah, School) return exhaustive server-side results. **Distance chips** govern the list view, which is one pill-toggle away from the map.
- Location denied? A **district picker** stands in as the user's pseudo-location and everything still works.
- Every masjid has a **shareable link** that unfurls as a proper preview card in WhatsApp and opens the app (or the store) when tapped.
- Users who can't find a masjid **submit it** — name, dropped pin, optional photo — into an NGO review queue, after a dedupe screen that catches "it's already here" cases. Approval creates a live masjid and notifies the submitter.
- The home screen carries a **nearest-masjid card** with an Iqamah countdown — the app's single most glanceable answer, rendered cached-first so it appears instantly even offline.

## User Stories

### Map & pins
1. As a user opening the Explore tab, I want the map centred on my location with nearby masjids (1–2 km) already pinned, so that I see my options without typing anything.
2. As a user, I want masjid pins to load automatically for whatever area I pan or zoom to, so that I can scout any neighbourhood — my village, a city I'm visiting — not just where I'm standing.
3. As a user panning back to an area I already viewed, I want its pins to appear instantly without refetching, so that the map feels native, not like a webpage.
4. As a user in a dense area like old Dhaka, I want overlapping pins grouped into a numbered cluster bubble, so that the map stays readable.
5. As a user, I want tapping a cluster to zoom in until its masjids separate, so that I can drill into a dense block naturally.
6. As a user who opens the app with no connectivity, I want the last session's pins to still render on the map, so that the app degrades to "slightly stale" instead of blank.
7. As a user who has panned far away, I want a "near me" button that recentres the map on my position, so that I can always get home in one tap.
8. As a user, I want NGO-verified masjids visually distinguished (badge), so that I can trust the data is confirmed, not scraped.

### Pin tap & peek card
9. As a user tapping a pin, I want a sliding card with the masjid's photo, name, distance, and facility icons, so that I can evaluate it without losing my place on the map.
10. As a user viewing the peek card, I want the masjid's next prayer and Iqamah time to appear in it, so that the most important question — when is the next jama'ah — is answered right there.
11. As a user comparing masjids, I want to tap pin after pin and have the card swap content each time, so that comparing three options takes three taps, not six navigations.
12. As a user, I want to dismiss the card with a swipe-down or a tap on the map, so that getting back to browsing is frictionless.
13. As a user, I want a Details button on the card opening the full masjid profile, so that depth is one tap away when I want it.
14. As a user, I want the selected pin highlighted and kept visible above the card, so that I never lose track of which masjid I'm looking at.

### Search
15. As a user, I want a search bar that autocompletes masjid names after two characters, so that I can find a masjid faster than panning.
16. As a user in Chittagong searching "Baitul", I want results near me ranked first with distances shown, so that I get my Baitul Mukarram, not Dhaka's.
17. As a user, I want to search by area or city name, so that I can browse a locality I'm about to travel to.
18. As a user opening an empty search field, I want my last five searches shown, so that repeat lookups are one tap.
19. As a user tapping a search result, I want to land directly on that masjid's profile, so that search is a shortcut, not a map interaction.

### Filters
20. As a sister, I want to filter the map and list to masjids with a sisters' section, so that I only see masjids I can actually pray in.
21. As a wheelchair user, I want a wheelchair-access filter, so that I never travel to a masjid I cannot enter.
22. As a user filtering by any facility (Wudu, Parking, Janazah, School), I want the results to be complete for the area — not just a thinned version of what was already on screen — so that a sparse facility still shows me every option.
23. As a user toggling a filter, I want a brief loading indication while results refresh and the map never to blank out, so that filtering feels safe to play with.
24. As a user, I want distance chips (0.5/1/2/5/10 km/custom) that control the list's radius around me, so that "what's within walking distance" is one tap.
25. As a user, I want a custom radius option capped at the system maximum (50 km), so that rural areas with sparse masjids are still coverable.

### List view, favourites & recents
26. As a user, I want a List pill on the map (and a Map pill on the list) flipping between the two presentations of the same results, so that I can choose how I browse without losing state.
27. As a user, I want the list sorted by distance with each masjid's name, area, distance, photo thumbnail, verified badge, and facility icons, so that I can compare options at a glance.
28. As a user, I want a favourites rail at the top of the list, so that my regular masjids are always first.
29. As a guest user, I want to favourite masjids without logging in, so that saving a masjid never interrupts me (favourites live on-device and migrate to my account on first login, per PRD 01).
30. As a user, I want a recently-visited rail (last five profiles I opened), so that I can return to a masjid I just looked at.
31. As a new user with no favourites, I want the empty rail to teach me ("tap ♡ on any masjid"), so that the feature explains itself.

### Location & fallback
32. As a user opening the map for the first time, I want a one-screen explainer before the OS location prompt, so that I understand why the app wants my position (per PRD 01's progressive permissions).
33. As a user who denies location, I want to pick my district from a searchable list and have the map centre there, so that denial doesn't break discovery.
34. As a user with a manual district set, I want distances and the distance chips computed from my district's centre, so that sorting still means something.
35. As a user, I want a visible "Near: \<district\> ▾" control to change my manual location anytime, so that I can browse another city deliberately.
36. As a user who denied location and later taps "near me", I want to be shown how to enable it from OS Settings, so that the denial is recoverable.

### Directions
37. As a user, I want a one-tap Directions button that opens my maps app navigating to the masjid's exact coordinates with its name as the label, so that I am never misrouted by a fuzzy address.
38. As a user without a maps app installed, I want directions to fall back to the browser, so that the button never dead-ends.

### Sharing & deep links
39. As a user, I want to share a masjid through my phone's share sheet, so that I can send it to family on WhatsApp in two taps.
40. As a WhatsApp recipient, I want the shared link to unfurl as a card with the masjid's name and photo, so that the message looks trustworthy, not like a bare URL.
41. As a recipient with MasjidKoi installed, I want the link to open the masjid's profile directly in the app, so that there is no browser detour.
42. As a recipient without the app, I want the link to show a simple web preview and route me to the app store, so that sharing doubles as distribution.

### Add a missing masjid
43. As a user whose neighbourhood masjid isn't in the app, I want to submit it with its name and a pin I place on a mini-map, so that my community becomes findable.
44. As a submitter, I want the form to first show existing masjids near my dropped pin and ask "is it one of these?", so that I don't file a duplicate by accident.
45. As a submitter, I want to optionally attach a photo and address text, so that the NGO can verify faster.
46. As a guest tapping "add a missing masjid", I want to be asked to log in at that moment, so that submissions are accountable without walling off browsing.
47. As a submitter, I want to see my submissions and their status (pending/approved/rejected) in my profile, so that I know my contribution wasn't swallowed.
48. As a submitter, I want a push notification when my masjid goes live, so that I can tell my community and share it.
49. As the NGO, I want submissions held in a review queue completely separate from live data, so that unreviewed or junk entries can never appear on the public map.
50. As the NGO, I want per-user submission limits (pending cap, rate limit), so that spam cannot flood the review queue.

### Nearest masjid card (home)
51. As a user opening the app, I want a home-screen card naming my nearest masjid with distance and a countdown to its next Iqamah, so that the app's most common question is answered with zero taps.
52. As a user with a poor connection, I want that card to render instantly from cache and refresh quietly in the background, so that I never stare at a spinner for information I saw yesterday.
53. As a user, I want tapping the card to open that masjid's profile, so that the card is a doorway, not a dead end.

### Performance, offline & accessibility
54. As a user on metered rural data, I want previously loaded areas, favourites, and the nearest-masjid card to work offline, so that connectivity gaps degrade the experience instead of erasing it.
55. As a user on a low-end Android device, I want the map to stay smooth in dense areas, so that the app is usable on the hardware most of Bangladesh actually owns.
56. As a TalkBack/VoiceOver user, I want the map controls, list items, filter chips, and peek card fully labelled, so that I can discover masjids unassisted.
57. As a Bengali user, I want every Explore surface — search, filters, cards, submission form — in Bengali by default, so that the core feature speaks my language.

## Implementation Decisions

### Decisions inherited from the design session (binding)

- **Google Maps SDK on both platforms** through the existing react-native-maps dependency with the Google provider explicitly set on iOS too (Apple Maps' Bangladesh data is inadequate; one map engine halves the QA surface). Two API keys, each platform-restricted in Google Cloud Console. The OSM/MapLibre route was prototyped separately and rejected.
- **Viewport-driven loading:** initial fetch at 1–2 km around the GPS fix; thereafter every pan/zoom settle (debounced ~500 ms) fetches that area. The nearby endpoint's 50-result cap means zoomed-out views show nearest-50-to-centre — accepted for MVP; the map is a near-me tool, not a national directory, and no aggregation endpoint will be built yet.
- **Pins accumulate** in a session store keyed by masjid id (~500-pin soft cap, evict farthest from viewport; no TTL within a session), persisted to MMKV so offline cold-starts render last-known pins. Fetch errors never blank previously rendered pins.
- **Clustering is zoom-based via supercluster run over the app's own pin store** — not the wrapper library, which would fight the custom store for marker ownership. The SRS's "cluster within 50 m" requirement is subsumed: at any zoom where two pins are under 50 m apart they cluster. Cluster bubbles show counts; tapping zooms one level.
- **Facility filters are server-side** (exhaustive recall wins over instant toggles — explicit user choice overriding the default recommendation): a filter change clears and rebuilds the pin store with filtered fetches; while filters are unchanged, pan-fetches accumulate normally. The filter bar shows a loading state; the map never blanks.
- **Distance chips govern the list view only** (radius of its nearby query around the user, distance-sorted). The map is governed by viewport alone, plus a "near me" recentre FAB. Custom radius caps at the API's 50 km.
- **Peek card is a single-snap-point bottom sheet** (the established gesture-handling sheet library, not hand-rolled); the masjid detail page remains a plain navigable route so deep links bypass the map entirely. Search results and list rows navigate straight to the route — the sheet is purely a map affordance.
- **Next prayer is fetched lazily per masjid** when its peek card opens (cached per masjid per day) — never embedded in the nearby payload, which stays static and cacheable. The live "Iqamah in 12 min" pin badge is deferred.
- **Search gains location bias:** optional lat/lng on the search endpoint; when present, rank by match quality then distance and return distance for display. Client: 300 ms debounce, fires at the API's 2-char minimum, last-5 recent searches in MMKV.
- **Location fallback is a manual district picker** acting as a full pseudo-location: map centres there, list sorts by distance to the district centroid, chips work. Backed by a bundled static district/centroid list (no API). Surfaced as a persistent "Near: X ▾" affordance that doubles as a browse-another-city feature for everyone.
- **One Explore tab, map-first**, with a floating List/Map pill toggling a `viewMode` flag over one shared store — not two tabs, not an Airbnb-style persistent sheet (which would collide with the peek card).
- **Directions launch platform-natively:** `geo:` URI on Android, Apple Maps universal link on iOS, each falling back to the Google Maps web URL if unhandled. Navigation is always by **coordinates with the masjid name as label, never by address string** — Bangladeshi addresses geocode unreliably.
- **Favourites follow PRD 01, not this session's first instinct** (conflict found and resolved during PRD synthesis): guests favourite locally on-device; GuestStore migration pushes them to the account on first login; the ♡ never gates login. Recents are purely device-local (last five, deduped) and never sync.
- **Masjid submissions ship in full in MVP** (explicit user scope call — the costliest decision in this PRD): a separate submissions store, never rows in the live masjid table, so unreviewed data cannot reach public queries by construction. Auth required to submit; per-user pending cap (~3) and rate limiting. Mandatory fields: name + dropped-pin coordinates (mini-map, defaulting to GPS); optional: address text, one photo. Facility checkboxes deliberately omitted — the NGO verifies those. Approval creates a real masjid through the existing admin create path and push-notifies the submitter; pending/approved/rejected states are visible in the user's profile.
  - **Amendment to PRD 01:** the login wall now gates **three** actions — Donate, Follow, and Submit-a-masjid — extending PRD 01's "exactly two." Same gate component, same post-login continuation.
- **Dedupe-before-submit:** on pin drop, query the existing nearby endpoint at ~150 m and present matches ("Is it one of these?") routing to the existing profile instead of a new submission. This screen is the primary duplicate defence; no server-side fuzzy matching in MVP.
- **Share infrastructure is a public web URL per masjid:** a tiny server-rendered HTML page with OG meta tags (name, cover photo, address) plus an app-open redirect falling back to the store, and the two well-known association files (Android App Links / iOS Universal Links) served from the production domain. Built once here, reused later by campaigns, events, and announcements. Static OG content only — no live prayer times in previews.
- **Nearest-masjid card** on the home screen: nearest masjid's name, distance, next prayer + Iqamah countdown, rendered cached-first from MMKV and refreshed on foreground; tap navigates to the profile. This is the spec's "GPS-based nearest masjid auto-detection" made concrete.
- **Offline story for this section:** pins, favourites, recents, and the nearest card cache in MMKV; map tiles rely on the Google SDK's own ephemeral cache; downloadable offline tile regions are explicitly post-MVP.

### Mobile modules (the work of this PRD)

- **MasjidPinStore (deep module).** The single authority on which masjids the map knows about. Owns merge-on-fetch, viewport queries, the 500-pin eviction policy, the clear-and-rebuild cycle on filter changes, and MMKV hydration/persistence. Interface: merge results in, ask what's in a region, signal a filter change. Nothing else caches pins.
- **ClusterEngine (deep module, pure).** Pins + region + zoom in; clusters and standalone markers out. Wraps supercluster; recomputed on the same debounce as region settles. The 50 m spec guarantee lives (and is tested) here.
- **LocationResolver (deep module).** One interface answering "where is the user for discovery purposes": GPS when granted; the persisted district-centroid pseudo-location when not; exposes grant/deny state transitions and the current "Near: X" descriptor. Map, list, search bias, and the nearest card all consume this and never touch the permission APIs directly.
- **LinkBuilder (deep module, pure).** All outbound and inbound link construction: platform-split directions URIs (coords + label, web fallback), share URLs, and deep-link route parsing for incoming masjid links. Pure functions over (platform, masjid, coords).
- **RecentsStore (small, pure).** MMKV-backed last-5 ring with dedupe-on-revisit; appended on every profile open.
- **MasjidApiClient.** Typed calls for nearby (with the extended payload), biased search, favourites, submissions, and the lazy per-masjid next-prayer fetch with its per-day cache.
- **Explore screen.** The map/list surface: map with pins/clusters, search overlay, filter chips, distance chips (list mode), FAB, the List/Map pill, the peek card, and the favourites/recents rails. Consumes all the modules above; contains as little logic as possible.
- **Submission flow.** Entry points (map empty state, list footer, profile), the login gate reuse, the pin-drop form, the 150 m dedupe-check screen, and the my-submissions status list.
- **NearestMasjidCard.** Home-screen card; cached-first render, foreground refresh, countdown tick.

### Backend changes required

- **Nearby payload extension (blocking everything):** the nearby result currently carries no coordinates — pins cannot render at all. Add latitude/longitude, the six facility booleans, and a cover-photo URL to the nearby response. Static columns only; the response stays cacheable.
- **Search location bias:** optional lat/lng parameters; distance-aware ranking and a distance field in results, reusing the existing PostGIS machinery. Ships in the same PR as the payload extension.
- **Submissions feature (the big one):** submissions table + authenticated submit endpoint (pending cap, rate limit, reusing the existing rate-limit layer) + admin list/approve/reject endpoints; approve creates a masjid through the existing platform-admin create path; approval triggers the submitter's push notification through the existing FCM machinery.
- **Share page:** a public masjid OG-preview route serving minimal HTML + redirect, and the two static well-known association files. No authentication, cacheable, bot-friendly.

### Contract clarifications

- Nearby/search responses must include the masjid's verified flag (already present in the summary schema) — the mobile verified badge renders from it everywhere.
- The submission status enum (pending/approved/rejected) and the approved masjid's id (so "view it live" links work) must come back on the my-submissions endpoint.
- The dedupe screen reuses the public nearby endpoint as-is (~150 m radius query); no dedicated dedupe API.
- Mobile treats the nearby endpoint's 50-result cap and 30-requests/min rate limit as design constants: debounce and accumulate are sized so normal panning stays under the limit.

## Testing Decisions

A good test exercises **external behaviour through the module's public interface** — what a caller observes — never internal state or implementation sequencing. Tests should survive a rewrite of the module's internals.

- **Committed: the three pure-logic mobile modules** (user's explicit selection):
  - **ClusterEngine** — two pins under 50 m always cluster (the SRS guarantee); cluster counts are exact; clusters split correctly across zoom levels; empty input and single-pin input degrade sanely.
  - **LinkBuilder** — Android `geo:` and iOS Apple Maps URIs are built from coordinates + name (never address); web fallback URL is correct; incoming deep links round-trip to the right masjid route; malformed links fail closed.
  - **RecentsStore** — revisits dedupe to the front; the ring caps at five; ordering is most-recent-first; persistence round-trips.
- **Prerequisite this commits us to:** the mobile repo has no test runner yet (recorded in PRD 01); adding the standard Expo Jest setup is in scope for this PRD, sized for pure-logic unit tests only (no native/UI test infrastructure).
- **Considered and not committed:** MasjidPinStore and LocationResolver tests (stateful, higher setup cost — first candidates if regressions appear), and backend tests for the schema extension and submission lifecycle. Prior art exists for the latter: the backend's established pytest suite — noted for the implementer, not required by this PRD.
- Manual verification checklist for the map flows (pan/fetch/cluster → peek card → directions; filter rebuild; offline cold-start; district fallback; submission end-to-end) ships with the implementation PR description.

## Out of Scope

- Offline map tile regions / downloadable areas (post-MVP; Google SDK's ephemeral cache only)
- "Near a place" destination search and a national zoom-out aggregation endpoint (panning covers the need)
- Live "Jumu'ah starting soon" / next-Iqamah badges **on pins** (the peek card's lazy fetch is the MVP expression; payload-embedded prayer times deferred)
- Geofenced "you're near X masjid" notifications (background location; post-MVP at best)
- Masjid detail page **content** (§4 PRD — this PRD only delivers the route and the peek card that links to it)
- Community photo uploads, Q&A, suggest-an-edit, busyness hints, owner responses (§4/§7)
- Halal food nearby tab (§7)
- Server-side fuzzy/duplicate detection for submissions (the client dedupe screen is the MVP defence)
- Admin panel review-queue **UI** (dependency on the web admin codebase; the backend endpoints for it are in scope)
- Bengali numerals rendering option (§9)
- Apple Watch / Wear OS, widgets, Live Activities (§3)

## Further Notes

- **Open dependency, blocking the share feature only:** a production domain. Universal/App Links and OG previews cannot ship without one; everything else in this PRD is domain-independent. If the domain slips, share degrades gracefully to "copy link to web page" once a domain exists — but the well-known files and OG route should still be built behind it.
- **Open dependency:** a Google Cloud billing account for the two Maps SDK keys. Dynamic mobile maps are effectively free at this scale, but the billing account must exist.
- **The riskiest scope call is the full submission pipeline** — the only decision here touching all three codebases. The designed fallback if the timeline slips: ship the schema + submit endpoint + mobile flow (submissions accumulate), defer the admin review UI; nothing user-facing changes except approval latency.
- The 50-results-per-fetch cap means a fully zoomed-out map under-represents distant areas. Accepted deliberately: clusters communicate "many here" for loaded areas, and the product stance is near-me discovery. Revisit only if analytics show heavy zoomed-out browsing.
- PRD 01's note stands: the feature doc claims a Node.js backend; it is FastAPI. This PRD's contracts were written against the actual backend.
