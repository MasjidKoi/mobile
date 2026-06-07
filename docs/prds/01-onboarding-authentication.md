# PRD — Onboarding & Authentication (Mobile)

> **Scope:** MasjidKoi consumer mobile app (Expo / React Native).
> Backend changes are listed as **dependencies** — this PRD does not spec backend internals beyond the contract the mobile app needs.
>
> Source decisions: grill session on `MasjidKoi_Mobile_Features.md` §1, 2026-06-06.
> Triage: `ready-for-agent`

---

## Problem Statement

A Muslim user in Bangladesh installing MasjidKoi for the first time has no way to sign in, no explanation of what the app does, and no path from "just browsing" to "donating to my masjid." Today the mobile app has only intro slides that dead-end into a home screen — there is no account system, so nothing a user does (favourites, reminders, follows, donations) can persist or attach to an identity. Worshippers who only want prayer times shouldn't be forced to create an account, but donors need a durable identity so their giving history and receipts survive across devices.

## Solution

A passwordless, email-OTP-only authentication system layered onto a guest-first onboarding flow:

- First launch shows skippable intro slides in **Bengali** and drops the user straight into the app as a **guest** — no login wall.
- Guests can do everything read-only **plus** keep favourites and prayer reminders locally on-device.
- Login is requested only at the two moments that genuinely need a server identity: **donating** and **following** a masjid. Logging in is: enter email → enter 6-digit code from inbox → done. No passwords, ever.
- On first login, locally saved guest data migrates silently to the account.
- Profile setup is fully skippable with **Hanafi pre-selected** as a visible, confirmable madhab default.
- OS permissions (location, notifications) are requested progressively at the moment of use, each preceded by an explainer screen, with graceful fallbacks on denial.

Phone OTP, Google/Apple social login, and account recovery are explicitly deferred from this release.

## User Stories

### First launch & intro
1. As a first-time user, I want a short skippable intro explaining what MasjidKoi does, so that I understand the app before using it.
2. As a first-time user, I want the intro and the whole app to appear in Bengali by default, so that I can read it in my own language.
3. As a returning user, I want the app to skip the intro on subsequent launches, so that I get to content immediately.
4. As an English- or Arabic-preferring user, I want to change the app language in Settings, so that I am not stuck in Bengali.

### Guest mode
5. As a guest user, I want to browse masjids, view profiles, and check prayer times without creating an account, so that I get value with zero commitment.
6. As a guest user, I want to save favourite masjids on my device, so that I can find them again quickly without logging in.
7. As a guest user, I want to set prayer reminders without an account, so that I never miss a prayer even if I never sign up.
8. As a guest user, I want to use the Qibla compass and search without an account, so that core utilities are never gated.
9. As a guest user, I want to be asked to log in only when I tap Donate or Follow, so that I am never interrupted while browsing.

### Login (email OTP)
10. As a user, I want to log in with just my email address and a one-time code, so that I never have to create or remember a password.
11. As a user, I want the OTP screen to tell me the code is valid for 10 minutes, so that I know how long I have to check my inbox.
12. As a user, I want a resend button with a visible 60-second countdown, so that I know when I can request a new code.
13. As a user, I want a clear error after entering a wrong code, with the number of attempts remaining, so that I know what is happening.
14. As a user, I want to be forced to request a fresh code after 5 wrong attempts, so that my account is protected from guessing.
15. As a user, I want a clear "code expired" state with a one-tap resend, so that a slow inbox doesn't strand me.
16. As a user who mistyped my email, I want an easy way to go back and edit it from the OTP screen, so that I don't get stuck waiting for a code that will never come.
17. As a user, I want logging in with a new email to just create my account implicitly, so that there is no separate "sign up" flow to figure out.
18. As a logged-in user, I want to stay signed in indefinitely, so that I never have to do the inbox round-trip again unless I log out.
19. As a logged-in user, I want a log out option, so that I can remove my account from a shared or sold device.
20. As a user logging in for the first time on this device, I want my locally saved favourites and reminders to move into my account automatically, so that nothing I did as a guest is lost.

### Profile setup
21. As a newly logged-in user, I want profile setup (name, photo, madhab) to be fully skippable, so that I reach the app in one tap.
22. As a Bangladeshi user, I want Hanafi pre-selected as my madhab with a visible confirmation chip, so that my Asr time is correct by default without silent assumptions.
23. As a Shafi'i/Maliki/Hanbali user, I want to change my madhab during setup or later in Settings, so that my prayer times follow my school.
24. As a user, I want to add or edit my name and photo later in Settings, so that skipping setup costs me nothing permanently.
25. As a donor, I want to be asked for my name at my first donation if I haven't provided one, so that my receipt carries my legal name without everyone being taxed for it upfront.

### Permissions
26. As a user opening the map for the first time, I want a one-screen explainer of why location is needed before the OS prompt, so that I can make an informed choice.
27. As a user who denies location, I want to pick my city manually and still see nearby masjids, so that denial doesn't break discovery.
28. As a user setting my first prayer reminder, I want the notification permission asked at that exact moment, so that the request makes obvious sense.
29. As a user who denied a permission, I want the app to show how to enable it from OS Settings when I later need it, so that the denial is recoverable.
30. As a privacy-conscious user, I want the app to never request permissions during onboarding, so that I'm not pressured before seeing any value.

### Sessions & account
31. As a logged-in user, I want my session refreshed silently in the background, so that I never see a surprise login screen mid-task.
32. As a user whose refresh token was revoked server-side, I want to be returned to guest mode with a gentle explanation rather than an error wall, so that the app stays usable.
33. As a donor, I want no extra app-level re-authentication before paying, so that donating stays as short as possible (the payment gateway verifies the transaction itself).
34. As a user, I want my email shown on my profile screen, so that I know which identity my donations attach to.

### Accessibility & localisation
35. As an older user, I want the OTP input to use large, clearly separated digit boxes with system font scaling respected, so that I can enter the code without errors.
36. As a TalkBack/VoiceOver user, I want every onboarding and auth screen fully labelled, so that I can complete login unassisted.
37. As a Bengali user, I want auth emails (OTP codes) to arrive with Bengali-language framing, so that the whole journey is consistent.

## Implementation Decisions

### Decisions inherited from the design session (binding)

- **Email-primary identity; email OTP is the only credential this release.** Phone OTP, Google sign-in, and Apple sign-in are deferred. The passwordless principle from the SRS survives the channel switch.
- **OTP policy:** 6-digit code, 10-minute validity, 60-second resend cooldown, maximum 5 wrong attempts before a fresh code is required, per-email and per-IP send limits, new code invalidates the old one. These numbers leak into UI copy (countdown, expiry messaging) and must match the backend exactly.
- **Sessions are indefinite:** short-lived access token plus long-lived rotating refresh token; ended only by logout or server-side revocation. No app-level re-auth before donations.
- **No account recovery this release.** Lost email access means an orphaned account. (Accepted risk, on record; the cheapest later mitigation is support-assisted recovery via payment-transaction matching.)
- **Login wall gates exactly two actions: Donate and Follow.** Everything else — including favourites and prayer reminders — works for guests via on-device storage.
- **Bengali always** as the launch language; changeable only via Settings. (Risk on record: a visible globe/icon affordance for the language setting is the recommended mitigation.)
- **Profile setup is fully skippable; Hanafi is the pre-selected, visibly confirmable madhab default.** Name is collected at first donation, not at setup.
- **Progressive permissions with pre-permission explainers:** location at first map use (manual city picker on denial), notifications at first reminder set.
- **Moot enhancements:** auto-read OTP (SMS Retriever) and voice-call OTP fallback — both SMS-dependent; revisit if phone login returns.

### Mobile modules (the work of this PRD)

- **AuthSession (deep module).** The single authority on authentication state. Owns secure token persistence, silent access-token refresh with rotation, attaching credentials to API requests, and a 401-retry-then-degrade policy. Exposes one hook returning a state of `guest | authenticated` plus `login`/`logout` transitions. Nothing else in the app touches tokens. On unrecoverable refresh failure it degrades to guest state and emits an event the UI uses to show a gentle re-login prompt.
- **GuestStore + migration (deep module).** On-device store for guest favourites and prayer-reminder preferences. On first successful login it runs a one-shot migration: push local favourites as follows/favourites to the account, register reminder preferences, then mark migration done. Merge rule: union with server state; server wins on conflict; migration is idempotent (safe to re-run after a crash mid-migration).
- **LoginGate (shallow).** A `requireAuth(action)` wrapper used by exactly the Donate and Follow entry points. If guest: presents the login flow modally, and on success resumes the original action (post-login continuation), including triggering GuestStore migration first.
- **Auth screens.** Two-step modal flow: email entry → OTP entry. OTP screen owns the 60s resend countdown, attempts-remaining display, expired-code state, and an edit-email affordance. Implicit signup: no separate register screen.
- **Onboarding revisions.** Keep the existing slide flow (already built) but: source all copy through i18n with Bengali as the hard default; remove any permission requests from onboarding; route to the app as guest on finish. Add the skippable profile-setup screen (Hanafi chip, optional name/photo) shown once after first login, not at first launch.
- **Permission explainer screens.** Reusable pre-permission explainer component invoked by the map (location) and the reminder flow (notifications); each records denial and routes to fallback (manual city picker / OS-settings deep link).
- **i18n bootstrap.** Initialise the already-installed i18n library with Bengali as default and English/Arabic available via Settings; existing hardcoded slide strings move into resource files. (Full RTL audit is out of scope here — Settings §9 work.)

### Backend changes required (dependencies, not specced here)

The backend already proxies all auth through GoTrue and verifies JWTs locally; consumer login reuses that machinery. Needed:

- **Two new consumer endpoints** on the existing auth proxy: request-OTP (email in, always-202 response to avoid account enumeration) and verify-OTP (email + code in; access token, refresh token, and is-new-user flag out). GoTrue's native email-OTP flow backs both — no new auth infrastructure.
- **OTP policy enforcement server-side** using the existing Redis rate-limit layer: 60s per-email resend cooldown, per-email and per-IP hourly send caps, 5-attempt verify limit, 10-minute code TTL.
- **Profile-row bootstrap:** first successful verify creates the user-profile row (all fields null; madhab is set only when the user confirms it client-side).
- **Consumer role distinction:** consumer JWTs carry no admin role; existing admin-gated dependencies must reject consumers (they already gate on role, so this is a verification task, not new code).
- **Existing endpoints reused as-is:** token refresh, logout (revokes refresh tokens), get/update own profile (name, madhab, photo), follow/unfollow.

### Contract clarifications

- Verify-OTP response must distinguish "wrong code (n attempts left)", "code expired", and "too many attempts — request a new code" so the OTP screen can render distinct states.
- Request-OTP returns the resend-cooldown seconds remaining when called inside the cooldown window, so the client countdown can resync after app restarts.
- The mobile app treats OTP policy numbers (10 min, 60 s, 5 attempts) as display constants that must mirror server policy; they are not client-enforced security.

## Testing Decisions

A good test exercises **external behaviour through the module's public interface** — what a caller observes — never internal state, private functions, or implementation sequencing. Tests should survive a rewrite of the module's internals.

- **Backend — OTP auth service (committed):** pytest (already set up in the backend) covering: resend cooldown enforced and reported; per-email/per-IP send caps; 5-attempt lockout requiring a fresh code; code expiry; successful verify returns tokens + is-new-user flag; profile row bootstrapped exactly once. Prior art: existing pytest suite in the backend repo and its rate-limit layer.
- **Mobile:** no test runner exists yet; mobile module tests (GuestStore migration idempotency, AuthSession refresh behaviour) were considered and **not committed** for this release. If a runner is added later, GuestStore migration is the first candidate — it is pure logic with high data-loss consequence.
- Manual verification checklist for mobile flows (guest → gate → login → migration → resume action) ships with the implementation PR description.

## Out of Scope

- Phone/SMS OTP login and all SMS infrastructure (deferred; revisit post-MVP)
- Google and Apple social login (deferred together to avoid platform-divergent auth)
- Account recovery of any kind, self-serve or support-assisted
- Personalised onboarding questions (fasting habits, per-prayer notification tailoring)
- Biometric app lock
- Account deletion UI (exists as a backend endpoint; surfaced via Settings §9 work, not this PRD)
- Full RTL/Arabic layout audit (Settings §9)
- Web admin panel auth (already live: email + password + TOTP via GoTrue)
- Donation flow itself (§5 PRD) — this PRD only delivers the login gate it triggers

## Further Notes

- The feature doc says the backend is Node.js; the actual backend is **FastAPI + GoTrue**. The feature doc should be corrected to avoid misleading future agents.
- The existing onboarding has **4** slides; the spec says 3. Keeping 4 is fine — the binding requirement is skippability and Bengali copy, not the count.
- Two accepted risks are deliberately on the record in the decisions above: (1) email-only identity with no recovery path for a phone-first demographic; (2) Bengali-always first screen for non-Bengali readers. Neither blocks this release; both have named cheap mitigations.
- GoTrue sends the OTP emails; email deliverability (sender domain, spam-folder rates on Gmail/Yahoo, Bengali templates) needs a one-time verification pass during implementation — it is the practical failure mode of this entire flow.
