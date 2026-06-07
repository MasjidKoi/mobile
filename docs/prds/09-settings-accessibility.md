# PRD — Settings & Accessibility (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native) only. **Zero new backend work** — account deletion (`DELETE /me`, soft-delete with 30-day purge), data export (`GET /me/export`, PDPO data-portability JSON), and profile/madhab update all exist and are consumed as-is.
> The web admin panel is untouched.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §9, 2026-06-07, grounded against the backend's existing deletion/export endpoints and the current two-screen state of the mobile app.
> Triage: `ready-for-agent`
> Amends: PRD 01 (fulfils its deferred obligations: account-deletion UI, full RTL/Arabic audit, and the Settings language switcher its i18n bootstrap pointed at; the "visible globe affordance" risk mitigation lands here). PRD 02 & 03 (fulfils their deferred Bengali-numerals option; their implementations are now bound by this PRD's colour-token, RTL-layout, and accessibility gate rules, and must render numbers through the shared formatting layer). PRD 07 (its minimal notification-preferences screen is absorbed as one section of this PRD's Notifications screen, exactly as 07 anticipated; whichever PRD is implemented second performs the integration). PRD 02/07 (the tab bar gains a **Profile** tab alongside Home, Explore, Feed).

---

## Problem Statement

A MasjidKoi user today has no way to make the app their own — and in several cases, no way to exercise rights the law and the backend already grant them. An older user who needs bigger text has no control and may never find the OS one. A user opening the app for Fajr in the dark gets a white screen. An Arabic reader was promised an RTL interface by the SRS and gets nothing. A Bengali user who grew up on printed prayer calendars reads ১২:৩০, but the app can only say 12:30. Once PRDs 03 and 07 land, prayer-reminder controls and community-notification controls will live in two unrelated corners with no single place to answer "why didn't I get a notification?" — or its angrier sibling, "how do I stop these?". And the backend has carried a Digital Security Act-compliant account-deletion endpoint and a PDPO data-export endpoint for months; the app exposes neither, which for a donation-handling product is a trust failure, not a missing feature.

There is also a structural problem this PRD is positioned to solve: seven other PRDs describe screens that are not yet built. If the colour tokens, RTL layout rules, and accessibility bar are not established *before* those screens are implemented, every one of them will be built wrong and retrofitted later — the most expensive way to do this work.

## Solution

A Profile tab and a Settings hub, plus the cross-cutting foundations every other PRD's screens will build on:

- A new **Profile tab** in the tab bar: account card (photo, name, madhab) for signed-in users, a sign-in CTA for guests, and rows into **Settings** — with reserved slots for Donation history (PRD 06) and the Ibadah journal (PRD 08), so future PRDs have a home without re-architecting navigation.
- **Appearance done as foundations**: a three-way theme setting (System default / Light / Dark) built on a semantic colour-token palette that becomes the binding rule for all future screens; an in-app font-size control (Default / Large / Extra large) that multiplies the OS scale under a combined cap, so the layout-audit burden stays bounded.
- **Language complete**: the Bengali/English/Arabic switcher PRD 01 pointed at, with full RTL shipping now — while the app is two screens and RTL is cheap — plus a logical-styles layout rule binding future work. Bengali↔English switches instantly; Arabic transitions show a one-tap restart prompt. An opt-in **Bengali numerals** toggle (১২:৩০), visible only in the Bengali UI, applied everywhere numbers render — times, counts, and ৳ amounts — through one shared formatting layer.
- **One Notifications screen** with an OS-permission status row (with fix-it deep link) and three sections: Prayer reminders (PRD 03's controls, behaviour unchanged), Followed masjids (PRD 07's three-state list and digest hour, behaviour unchanged), and Other (Eid alert, submission/moderation outcomes). This PRD owns the container; 03 and 07 stay authoritative over their controls.
- **Storage & offline** as a screen, not a toggle: what's cached, last-sync times, total size, and a confirmed clear action — offline behaviour itself stays automatic per PRDs 02/03/04/07, because a caching off-switch would only break the app's core reliability promise.
- An honest **Privacy & data** section: plain-language rows for what is private by design (check-ins and ibadah data are visible to no one but you), a reserved default-anonymity slot for PRD 05's donations, **Download my data** (the existing export endpoint through the OS share sheet), and **Delete account** — a two-step, type-to-confirm flow whose copy tells the truth: permanent, no undo, purged within 30 days, export offered first.
- **Accessibility as a gate, not an event**: a concrete checklist (accessibility labels on every interactive element, 44pt minimum targets, WCAG AA contrast in both themes via the token palette, survival at max font scale, Bengali screen-reader spot-check) applied to every screen existing at implementation time — and binding as an acceptance rule on every future PRD implementation.

Data-saver mode and app-icon shortcuts are explicitly out of this release.

## User Stories

### Profile tab & settings discoverability

1. As a signed-in user, I want a Profile tab showing my photo, name, and madhab, so that my account has a visible home in the app.
2. As a signed-in user, I want to edit my name, photo, and madhab from the Profile account card, so that profile management is one obvious place (per PRD 01's profile fields).
3. As a guest, I want the Profile tab to show a friendly sign-in CTA above the Settings entry, so that I can reach every setting without being nagged to register.
4. As any user, I want a Settings screen organised into scannable sections (Appearance, Language, Notifications, Storage & offline, Privacy & data, About), so that I can find any control in seconds.
5. As a user who can't find the language control, I want a visible globe icon affordance on the language row, so that the Bengali-first launch never strands me (PRD 01's recorded risk mitigation).

### Dark mode & theming

6. As a user with system-wide dark mode, I want the app to follow my OS theme by default, so that it looks right on first launch with zero configuration.
7. As a user praying Fajr in the dark, I want to force Dark regardless of my OS setting, so that the app never blinds me at 5 AM.
8. As a user who prefers light UI, I want to force Light the same way, so that the override works in both directions.
9. As a user changing the theme, I want it applied instantly across the whole app without restart, so that the setting feels direct.
10. As a user of any future screen (map, feed, donation flow), I want it to respect my theme, so that dark mode is never half-finished — every surface builds on the semantic token palette, no hardcoded colours.

### Font size

11. As an older user who never found OS text settings, I want an in-app font-size control with three steps (Default / Large / Extra large), so that I can make the app readable myself.
12. As a user adjusting font size, I want a live preview on the setting row, so that I see the effect before leaving the screen.
13. As a user with OS-level large text already configured, I want the app to respect that and multiply my in-app step on top of it, so that the two systems cooperate instead of fighting.
14. As a user with both maxed out, I want a combined cap (~1.6×) so that layouts degrade gracefully instead of breaking.
15. As a user of every screen in the app, I want text to scale without truncation or overlap up to the cap, so that large text is usable, not cosmetic.

### Language, RTL & numerals

16. As a Bengali user (the default), I want the entire Settings surface in Bengali, so that the hub speaks the audience's language.
17. As an English-preferring user, I want to switch to English with the change applied instantly, so that switching is friction-free.
18. As an Arabic reader, I want the full UI in Arabic with right-to-left layout — mirrored navigation, text alignment, and icons — so that the app reads natively, not as a half-translation.
19. As a user switching to or from Arabic, I want a one-tap "restart to apply" prompt, so that the RTL relayout (an OS-level constraint) is comprehensible, not mysterious.
20. As a Bengali user, I want an optional Bengali-numerals toggle (১২:৩০ instead of 12:30), so that times read like the printed calendars I grew up with.
21. As a Bengali user with numerals on, I want every number in the app converted — prayer times, countdowns, attendee counts, and ৳ amounts — so that the screen never mixes numeral systems like a bug.
22. As a user of the English or Arabic UI, I want the Bengali-numerals row hidden, so that an incoherent option never appears.
23. As a user who hasn't touched the toggle, I want Western digits by default, so that the app matches every other Bangladeshi digital product (bKash, Nagad) out of the box.

### Notification manager

24. As a user, I want one Notifications screen holding every notification control in the app, so that "why didn't I get a notification?" has a single answer.
25. As a user who denied the OS notification permission, I want a status row at the top telling me notifications are off at the system level, with a one-tap deep link into OS settings, so that the most common failure is diagnosable in place.
26. As a user, I want the Prayer reminders section with PRD 03's controls — per-prayer toggles, offset, azan toggle, sounds, preview — exactly as 03 specced them, so that tuning is discoverable without behaviour changes.
27. As a user, I want the Followed masjids section with PRD 07's per-masjid three-state control (digest/instant/mute) and digest-hour picker, unchanged, so that community noise control lives in the same place.
28. As a user, I want an Other section for one-off notification types (Eid announcement, my submission/photo/Q&A outcomes), so that nothing notifies me without a visible switch behind it.
29. As a guest with prayer reminders set (per PRD 03), I want the Notifications screen fully functional without an account, so that the core utility is never login-walled.

### Storage & offline

30. As a user on a low-end phone, I want a Storage & offline screen showing what the app has cached (prayer times, viewed masjids, feed) with last-sync times and total size, so that the app's offline magic is inspectable.
31. As a storage-constrained user, I want a "Clear cached data" action with a confirmation explaining the consequence (offline data re-downloads on next use), so that I can reclaim space without uninstalling.
32. As a user, I want my settings and account state to survive a cache clear, so that clearing storage never resets my preferences.
33. As a user, I want no offline on/off toggle anywhere, so that the app's offline reliability (PRD 03's 5 AM Fajr promise) can never be accidentally disabled.

### Privacy & data

34. As a privacy-conscious user, I want plain-language rows stating what is private by design — my check-ins and ibadah data are visible to no one but me — so that I learn the app's posture without reading a policy.
35. As a future donor, I want a "donate anonymously by default" control to appear in this section when donations ship, so that privacy controls stay in one place (slot reserved; behaviour specced in PRD 05).
36. As a user, I want a "Download my data" row that produces a JSON file via the OS share sheet, so that I can take my data anywhere (PDPO data portability, existing endpoint).
37. As a user exporting data, I want clear progress and failure states (no connection, server error with retry), so that a slow export doesn't look broken.

### Account deletion

38. As a user leaving the platform, I want a Delete account flow reachable from Privacy & data, so that my Digital Security Act 2018 right is exercisable in-app.
39. As a deleting user, I want a consequences screen first — permanent, no undo, purged within 30 days, reviews and photos removed — so that I consent to what actually happens.
40. As a deleting user, I want the consequences screen to offer "Download my data first" inline, so that export-before-delete is one tap, not a separate expedition.
41. As a deleting user, I want a deliberate confirmation gate (typing a confirmation word or press-and-hold), so that an irreversible action cannot be misclicked.
42. As a user whose deletion succeeds, I want the app to clear my local data and return me to guest mode immediately, so that the device reflects the deletion at once.
43. As a deleting user, I want the flow's copy to never promise a grace-period undo, so that the UI tells the truth about a backend that has no reactivation path.
44. As a guest, I want the deletion and export rows absent (nothing to delete or export), so that the section never shows dead controls.

### Accessibility

45. As a TalkBack/VoiceOver user, I want every interactive element in the app to carry a meaningful accessibility label, so that the screen reader speaks the interface, not silence.
46. As a Bengali screen-reader user, I want labels tagged with the right language, so that TalkBack doesn't mangle Bengali text with an English voice.
47. As a user with motor difficulties, I want every touch target at least 44pt, so that buttons are hittable for all age groups (the SRS's promise made concrete).
48. As a low-vision user, I want both themes to meet WCAG AA contrast through the token palette, so that dark mode is readable, not just fashionable.
49. As a user of any future feature, I want its screens held to the same accessibility checklist before they ship, so that accessibility is an acceptance gate, not a launch-week audit.

### Cross-cutting

50. As a Bengali user, I want every surface in this PRD — settings rows, confirmation flows, deletion copy, storage labels — in Bengali by default, so that the hub speaks my language.
51. As a guest, I want appearance, language, numerals, notifications, and storage settings fully functional without an account, so that settings respect the deferred-login principle (PRD 01).
52. As a user reinstalling the app, I accept that device-local preferences (theme, font, numerals) reset, so that no new sync infrastructure is needed for cosmetic state.
53. As a user changing any setting, I want it applied optimistically and persisted immediately, so that settings never need a save button.
54. As a returning user, I want my settings read from local storage at cold start before first paint, so that the app never flashes the wrong theme or language.

## Implementation Decisions

### Decisions from the grill session (binding)

- **Hub + new work, not a re-spec.** This PRD owns the Settings information architecture and the genuinely new cross-cutting work. Settings specced in PRDs 01/03/07 (madhab, language bootstrap, prayer-reminder controls, community-notification preferences) are *placed* by this PRD, never redefined. 03 and 07 remain authoritative over their controls' behaviour.
- **Scope cut:** the section's spec'd items + Bengali numerals (deferred here by PRDs 02 and 03) + the accessibility checklist + data export. Data export was initially cut, then **re-included when the backend's existing export endpoint was discovered** — the mobile cost is one row and a share sheet. Data-saver mode and app-icon shortcuts are out (post-MVP).
- **Settings state splits by consumer.** Device-local (MMKV) for anything only the client acts on: theme, font step, language, numerals, sound choices. Server-side only for what the backend must act on — madhab (profile field, PRD 01), follow-notification modes and digest hour (PRD 07). No new sync infrastructure; reinstall loses cosmetic prefs by design.
- **Profile tab → Settings.** A new tab-bar tab (Home, Explore, Feed, **Profile**): account card, Settings entry, and reserved rows for PRD 06's donation dashboard and PRD 08's ibadah journal. Madhab editing lives on the Profile account card since it is a profile field.
- **Dark mode:** three-way System (default) / Light / Dark, stored locally, applied via the styling layer's colour-scheme support. Ships with a **semantic colour-token palette**; "no hardcoded colours" becomes a binding rule on all future PRD implementations.
- **Font size:** three in-app steps (Default / Large / Extra large) multiplying the OS font scale, combined cap ~1.6×, live preview on the row. The cap bounds the layout-audit burden.
- **Arabic + RTL ships now**, while the app is two screens: audit what exists at implementation time, and bind a logical-styles rule (start/end, no left/right hardcoding) on all future work. Bengali↔English switches in place; Arabic transitions prompt a one-tap restart (OS-level RTL constraint).
- **Bengali numerals:** opt-in toggle, default off, visible only when the UI language is Bengali, applied app-wide (times, counts, currency) through one shared formatting layer. Default-off matches dominant BD digital convention (bKash, Nagad render Western digits).
- **Notification manager: one screen, three sections** plus an OS-permission status row with a fix-it deep link. PRD 07's standalone minimal-preferences screen becomes this screen's Followed-masjids section — no logic rewrite; whichever PRD lands second integrates. No in-app global mute and no quiet-hours window: a global mute that silences the Fajr azan is a footgun, and the OS already provides both.
- **"Offline mode" becomes a Storage & offline screen**, not a toggle. Offline caching stays automatic per PRDs 02/03/04/07. The screen lists registered caches, last-sync times, and sizes, with a confirmed clear action that never touches settings or auth state.
- **Privacy is honest and minimal:** statements for what is private by design, a reserved donation-anonymity-default slot (placed here, specced in PRD 05), export, and deletion. No invented toggles implying private things could be public.
- **Deletion: hard confirm, honest copy.** The backend soft-deletes (`202`, purge within 30 days) and returns `410 Gone` on every subsequent call — **there is no reactivation path**, so the UI copy promises no undo. Two-step flow: consequences screen (with inline export offer) → type-to-confirm or hold-to-delete → on `202`, purge local state and drop to guest mode. Backend unchanged.
- **Accessibility is a checklist + gate rule:** labels on every interactive element, 44pt targets, AA contrast in both themes via the token palette, survival at max combined font scale, Bengali screen-reader spot-check. Applied to every screen existing at implementation time, then binding as an acceptance rule on all future PRD implementations — same enforcement pattern as the token and RTL rules.

### Modules

Deep (isolated, testable interfaces):

- **SettingsStore (deep).** Typed, MMKV-backed store for every device-local preference, with declared defaults, change subscription, and a schema-version field for future migrations. Read at cold start before first paint. Every other module reads through it; its interface is the contract that rarely changes.
- **LocaleFormat (deep, pure logic).** The single formatting layer: time, number, and currency formatting honouring (language, bengali-numerals). Every surface in the app renders numbers through it — including PRDs 02/03's screens when implemented (binding).
- **FontScale resolver (deep, pure logic).** (in-app step, OS font scale) → effective scale with the combined cap. No I/O.
- **ThemeController + token palette (deep).** Semantic colour tokens for both themes wired into the styling layer, plus pure resolution (setting, system scheme) → applied scheme.

Shallow (thin orchestration over OS/backend):

- **LanguageSwitcher.** In-place i18n swap for Bengali/English; RTL flip + restart prompt for Arabic transitions.
- **AccountDeletionFlow.** Consequences screen → confirm gate → existing deletion endpoint → local purge → guest mode.
- **DataExportFlow.** Existing export endpoint → temp file → OS share sheet, with progress and retryable failure states.
- **CacheRegistry + Storage screen.** Feature modules register caches (name, size, last-sync, clear); the screen renders the registry. The registry interface is the deep part — future PRDs plug in without touching the screen.
- **Settings UI.** Profile tab, Settings screen sections, Notifications container, Privacy & data section.

Plus the **accessibility checklist** — a documented, binding acceptance artifact, not code.

### Backend changes required

**None.** Deletion, export, and profile/madhab endpoints exist and are consumed as-is. The donation-anonymity default is a PRD 05 dependency, not a backend ask from this PRD.

### Sequencing (vertical slices)

Implementation is **independent of PRDs 02/03/07 landing**, and deliberately early — the token, RTL, and accessibility rules must exist *before* other PRDs' screens are built:

1. Profile tab + Settings skeleton + appearance (token palette, dark mode, font size)
2. Language switch + RTL + the numerals formatting layer
3. Privacy & data (export, deletion)
4. Notifications and Storage screens as containers whose sections activate as PRD 03/07 implementations land — whichever ships second integrates

The accessibility checklist applies per-slice, not as a final pass.

## Testing Decisions

- A good test exercises external behaviour through the public interface — formatter outputs, resolved scales, persisted values — never internal storage layout or styling internals.
- **The four deep modules get automated tests:** SettingsStore (defaults, persistence round-trip, schema-version handling), LocaleFormat (Bengali/Western digits across times, counts, and ৳ amounts in both relevant languages; toggle-off passthrough), FontScale resolver (step math, cap boundaries, extreme OS scales), ThemeController resolution (all setting × system-scheme combinations).
- Shallow flows (deletion, export, language restart prompt, storage clear) are covered by the **manual verification checklist** shipping with the implementation PR description, per the convention in PRDs 02–07: theme flip across screens; font steps at OS extremes; bn↔en instant switch; Arabic restart → full RTL render; numerals toggle across times/counts/currency; permission status row deep link; cache clear preserves settings; export → share sheet; deletion end-to-end → guest mode; guest visibility of every section; TalkBack/VoiceOver pass on the settings surfaces in Bengali.
- Prior art: the pure-logic module tests established by PRD 03 (reminder scheduling logic) and PRD 07 (ReviewPromptGate).

## Out of Scope

- Data-saver mode (post-MVP)
- App-icon shortcuts / quick actions (post-MVP)
- Settings sync across devices / new backend settings model (split-by-consumer decision)
- Backend reactivation/undo path for deletion (UI copy is honest about its absence instead)
- Donation-anonymity default behaviour (slot reserved here; specced in PRD 05)
- Donation-history and ibadah-journal Profile rows (slots reserved; PRDs 06 and 08)
- Any change to PRD 03/07 notification control behaviour (placed, not redefined)
- An offline on/off toggle (rejected — contradicts PRD 03's reliability guarantees)
- Quiet hours / global notification mute (OS-provided)
- PDF export format (JSON only, matching the existing endpoint)

## Further Notes

- This PRD is the cheapest moment for its foundational work: the app is two screens, so RTL, tokens, and the accessibility gate cost almost nothing now and bind everything later. Implementing it after PRDs 02–07's screens would convert all three into retrofits.
- The SRS lists "Offline mode" as a setting; the grill session resolved this as a *visibility* feature (Storage & offline screen), since other PRDs made offline behaviour automatic and a disable toggle helps no one.
- The deletion endpoint's `410 Gone` semantics mean a deleted user who reinstalls and re-verifies the same email gets a fresh profile row per PRD 01's bootstrap — that is acceptable and out of this PRD's hands.
- The Bengali screen-reader spot-check matters more than it looks: TalkBack with an English TTS voice renders Bengali labels as gibberish unless language is tagged correctly — a detail a Western-checklist audit would miss.
