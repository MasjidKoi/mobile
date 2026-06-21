# Navigation Audit

_Generated 2026-06-22. Audit of Expo Router v6 (`expo-router ~6.0.23`) navigation across the app._

## TL;DR

The app uses **one single flat Stack** (`app/(app)/_layout.tsx`) that holds *every* non-tab
screen — settings, masjid profile, donation flow, journal, goals, auth modals, ~50 screens.
The 4-tab bar is just **one entry** (`(tabs)`) at the bottom of that stack.

Consequences (this is the "stacking" the report is about):

1. **No per-tab back stacks.** Every detail screen from any tab is pushed onto the *same* root
   stack, on top of the tab bar. There is no independent history per tab, and the tab bar is
   hidden the moment you open anything.
2. **`router.push` everywhere** (113 calls vs 29 `replace`). `push` *always* adds a new entry,
   even to a route already on the stack, so masjid→masjid→masjid (or any A→B→A bounce between
   related screens) grows the stack one screen per hop. Back then walks every hop in reverse.
3. **`completeAuthFlow()` calls `router.dismissAll()`** which pops the *entire* root stack back
   to the Home tab — not just the auth modals — so logging in mid-flow (e.g. tapping Donate on
   a masjid) throws you back to Home and loses the screen you came from. **(highest-impact bug)**
4. **Tab routes are reached with `push`** (5 sites push `/explore`), which stacks a *second*
   copy of the tab navigator instead of switching tabs.

---

## Fix status (2026-06-22)

| # | Issue | Status |
|---|---|---|
| 1 | `completeAuthFlow` over-dismissed (login → dumped to Home) | ✅ Fixed — `dismissAll()` → `back()`. **Verified E2E in sim**: login from a masjid returns to the masjid + runs the gated action; Back then cleanly returns to Home. |
| 3 | `push` to entity detail stacks duplicates | ✅ Fixed — cross-entity → masjid links (announcement, event) and the notification deep-link use `navigate`. List→detail stays `push` (correct drill-down). |
| 4 | Tab routes opened with `push` | ✅ Fixed — 5× `push("/explore")` → `navigate("/explore")`. **Verified in sim**: the Donations empty-state CTA now switches to the Explore tab cleanly. |
| 5 | Modal-over-modal (`set-home-masjid` → `city-picker`) | ✅ Fixed — `set-home-masjid` is now a card (back chevron). Not live-tested (only reachable with no home masjid set). |
| 7 | Deep-link stacks masjid-over-masjid | ✅ Fixed — notification tap uses `navigate` for masjid + journal. |
| 6 | `badge-earned` modal→card `replace` | ⏸ No change — `replace` is the correct end state (Back from the badge returns to Journal, not the celebration). The audit's suggested `push` alternative would *regress* (re-show the celebration on Back). Only the transition animation differs; changing it risks a back()+push navigation race. |
| 2 | Single flat stack / no per-tab history | ⏸ Deferred — large architectural restructure (~50 screens), separate from the reported "stacking" symptom (which #1/#3/#4/#7 address). See §4. |

---

## 1. Navigator architecture

```
RootLayout  app/_layout.tsx            Stack (headerShown:false)
└─ (app)    app/(app)/_layout.tsx      Stack (headerShown:false)   ← THE single flat stack
   ├─ (tabs)  app/(app)/(tabs)/_layout.tsx   Tabs (custom NavBar)  ← one screen in the stack
   │   ├─ home      (tabs)/home.tsx
   │   ├─ explore   (tabs)/explore.tsx
   │   ├─ feed      (tabs)/feed.tsx
   │   └─ profile   (tabs)/profile.tsx
   └─ ~50 sibling screens: masjid/[id], settings, donate/[id], journal/*, goals/*, auth, …
```

Only **3 navigators exist**: root Stack → app Stack → tabs Tabs. The sub-route folders
(`journal/`, `goals/`, `badges/`, `donate/`, …) have **no `_layout`** of their own, so their
screens are *not* grouped — they all live directly in the one `(app)` stack.

### Entry / gating

| Route | File | Role |
|---|---|---|
| `/` | `app/index.tsx` | Reads first-run flag → `Redirect` to `/onboarding` or `/home`. |
| `/onboarding` | `app/onboarding.tsx` | Intro carousel → `replace("/home")` (good: Back can't return). |
| auth (modals) | `email`, `otp`, `profile-setup` | `presentation:"modal"`, opened by the login gate. |

Auth is **guest-first**: you browse freely; logged-in-only actions go through
`requireAuth(action, reason)` (`providers/LoginGateProvider.tsx`), which shows a bottom sheet,
then `push("/email")`, and resumes `action` after `completeAuthFlow()`.

### Modal screens (`presentation:"modal"`)
`city-picker`, `gallery` (fade), `set-home-masjid`, `email`, `otp`, `profile-setup`,
`location-explainer`, `notification-explainer`, `milestone` (fade), `badge-earned` (fade).
Everything else is a standard card push.

---

## 2. Screen inventory & flow

Navigation is **100% imperative** (`router.*`) — there are **no `<Link>` components** and no
direct React Navigation usage except the tab bar's `navigation.navigate` in the tabs layout.

### Tabs (the 4 roots)

| Tab | Pushes to |
|---|---|
| **home** | `city-picker`, `qibla`, `hijri-calendar`, `set-home-masjid`, `masjid/[id]` |
| **explore** | `masjid/[id]`, `city-picker`, `search`, `my-submissions`†, `submit-masjid`† |
| **feed** | `announcement/[id]`, `event/[id]`, `explore`⚠ |
| **profile** | `edit-profile`, `settings`, `donations`, `following`, `journal`, `goals`, `badges`, `about` |

† gated via `requireAuth`. ⚠ pushes a tab route — see Issue #4.

### Discovery / masjid
```
masjid/[id]  ← home, explore, search, feed, following, announcement/[id],
                event/[id], notification tap, NearestMasjidCardLive
  ├─ gallery (modal)
  ├─ hijri-calendar
  ├─ campaign/[id] ──► donate/[id] ──(checkout)──► donation/[id] ──► receipt/[id]
  │                                                      └─► replace masjid/[id]
  ├─ reviews/[id] ──► review/[id]
  ├─ suggest-edit
  ├─ add-photo / ask-question        (gated)
  ├─ checkin/[id]                    (gated; perm-denied → location-explainer)
  └─ donate/[id]                     (gated)

search ──► masjid/[id]
submit-masjid ──► replace my-submissions  |  replace masjid/[id]
```

### Donations
```
profile ──► donations ──► recurring ──► explore⚠
              └─► donation/[id] ──► receipt/[id] | re-donate donate/[id] | replace masjid/[id]
recurring-setup ──► replace recurring
```

### Community
```
feed ──► announcement/[id] ──► masjid/[id]
feed ──► event/[id] ──► masjid/[id]   (RSVP gated)
profile ──► following ──► masjid/[id] | explore⚠
masjid/[id] ──► reviews/[id] ──► review/[id]
checkin/[id] ──► replace review/[id]
```

### Gamification (Profile → …)
```
profile ──► journal(index) ──► journal/history ──► journal/[date]
              ├─► streak ──► exempt-mode
              ├─► weekly-reflection
              ├─► journal-setup
              └─► milestone (modal) / check-in prefill sheet
profile ──► goals(index) ──► goals/templates ──► goals/new ──► replace goals/[id]
              └─► goals/[id]
profile ──► badges ──► badges/[type]
badge-earned (modal) ──► replace badges/[type]
```

### Settings (Profile → settings)
```
settings ──► appearance | language | notifications | storage | privacy | about
notifications ──► prayer-reminders ──► azan-sound | ramadan-reminders
                  └─► azan-sound
privacy ──► delete-account ──► delete-confirm ──► replace account-deleted ──► replace /home
```

### Auth (login gate)
```
requireAuth ─(guest)─► LoginGateSheet ─continue─► push email
email ─► replace otp ─► (new user)  replace profile-setup ─► completeAuthFlow()
                        (existing)   completeAuthFlow()
completeAuthFlow() ─► router.dismissAll()  ‼  then resume pendingAction()
```
`replace` between `email`/`otp`/`profile-setup` is correct (they don't pile up). The problem is
the final `dismissAll()` — see Issue #1.

---

## 3. Issues & buggy navigation

Ranked by impact. Line numbers are at audit time.

### 🔴 #1 — `completeAuthFlow()` dismisses the whole stack, not just the auth modals
`providers/LoginGateProvider.tsx:70` → `router.dismissAll()`

`dismissAll()` pops the **current stack down to its first screen**. Because auth modals share
the *single* `(app)` stack with every other screen, the first screen is `(tabs)`/home — so
`dismissAll()` tears down **everything underneath the auth modal too**.

Concrete repro: guest opens a masjid → taps **Donate** → login gate → completes login →
`dismissAll()` pops `otp` **and the masjid profile** back to the Home tab, then `pendingAction`
pushes `donate/[id]` on top. Back from Donate now goes to **Home**, not the masjid. The masjid
profile (and any breadcrumb to it) is gone.

- Bites every gate triggered from a **non-tab** screen: masjid Donate / Check-in / Add-photo /
  Ask-question / Follow (`masjid/[id].tsx:135,139,152,229`), campaign Donate
  (`campaign/[id].tsx:67`), review CTA (`reviews/[id].tsx:49`), event RSVP (`event/[id].tsx:187,193`).
- The `_layout.tsx:10` comment ("`dismissAll()` returns to the underlying tab") assumes the auth
  flow is a separate stack over a tab. It isn't — it's in the same stack as everything else.
- Fix direction: dismiss only the auth screens (e.g. `router.dismissTo(...)` back to the gate
  origin, or `router.back()` per auth screen / track depth), or put the auth flow in its own
  nested stack/group so `dismissAll` is scoped to it.

### 🟠 #2 — Single flat stack → no per-tab history, unbounded stacking
`app/(app)/_layout.tsx` (whole stack)

All ~50 detail screens are siblings of `(tabs)` in one stack. There is no per-tab back stack,
so you can't deep-link in one tab and switch to another without backing out, and unrelated
journeys share one history. This is the structural root of "everything stacks in one pile."
Fix direction: give each tab its own nested Stack (`(tabs)/home/_layout`, etc.) and move each
detail screen under the tab that owns it, so Back is scoped per tab and switching tabs preserves
each tab's position.

### 🟠 #3 — `push` to the same route stacks duplicates (esp. `masjid/[id]`)
`masjid/[id]` is reachable from ≥8 places and is always opened with `push`
(`search.tsx:41`, `explore.tsx:66`, `home.tsx:241/256`, `feed`/`following`/`announcement`/`event`,
`NearestMasjidCardLive.tsx:41`, `NotificationsBootstrap.tsx:25`). Following any masjid→masjid
link (announcement→masjid, event→masjid, then onward) keeps pushing fresh copies, so the back
stack grows one screen per masjid viewed. Same pattern for `goals/[id]`, `donation/[id]`, etc.
Fix direction: use `router.navigate(...)` (de-dupes / pops back to an existing instance) for
"go to entity X" links, reserving `push` for genuine drill-down.

### 🟠 #4 — Navigating to a tab via `push` stacks a 2nd tab navigator
5 sites push the `/explore` **tab** route:
`following.tsx:118`, `recurring.tsx:72`, `recurring.tsx:124`, `donations.tsx:186`,
`feed.tsx:170` (these are "no masjids yet → Explore the map" empty-state CTAs).

`push("/explore")` does not switch to the Explore tab from a pushed screen — it adds another
copy of the `(tabs)` navigator on top of the stack (with Explore active), leaving the current
screen underneath. Back goes to that screen, not Home. From the Feed tab it's tab→tab stacking.
Fix direction: `router.navigate("/explore")` (switches tabs, pops back to the existing tabs),
or `dismissAll()` + navigate.

### 🟡 #5 — Modal-over-modal
`home.tsx:206` pushes `set-home-masjid` (modal), which at `set-home-masjid.tsx:65` pushes
`city-picker` (also modal). Two stacked modal presentations; works but the layered sheet
presentation/back behavior is awkward on iOS. Consider presenting `city-picker` as a push
inside the sheet, or making one of them a card.

### 🟡 #6 — `replace` from a modal to a card route
`badge-earned.tsx:48` (modal, fade) → `replace("/badges/[type]")` (a card route). Replacing a
modal presentation with a card mid-stack yields an inconsistent transition and leaves
`badges/[type]` sitting where the modal was. Prefer `back()` then `push`, or open
`badges/[type]` as a normal push.

### 🟡 #7 — Deep-link push can stack masjid-over-masjid
`NotificationsBootstrap.tsx:25` always `push`es `masjid/[id]` on notification tap. If a masjid
is already open, tapping a prayer reminder for another masjid stacks a second profile. Low
severity but compounds #3. Consider `navigate`, or dismiss to root before pushing the deep link.

### ✅ Things done right (not bugs)
- `onboarding → replace("/home")`, `delete-confirm → replace("/account-deleted")`,
  `goals/new|templates → replace goals/[id]`, `recurring-setup → replace recurring`,
  `submit-masjid → replace …` — all correctly use `replace` so Back doesn't return to a
  consumed form/intermediate.
- `email → replace otp → replace profile-setup` — auth steps don't pile up.
- `my-questions ↔ my-photo-submissions` segmented switch via `replace` — no stacking.
- Shared `BackButton` (`components/BackButton.tsx`) consistently calls `router.back()`.

---

## 4. Recommended remediation order

1. **Fix #1** (scope `completeAuthFlow`'s dismissal) — smallest change, biggest UX win; stops
   login from teleporting users to Home.
2. **Adopt `navigate` for entity/tab links** (#3, #4, #7) — mechanical, removes most duplicate
   stacking.
3. **Restructure into per-tab nested stacks** (#2) — larger refactor; the real fix for "back
   walks through every screen," and makes the tab bar persist inside flows.
4. Polish modals (#5, #6).
