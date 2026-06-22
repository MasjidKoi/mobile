# MasjidKoi — Mobile App

MasjidKoi connects Muslims with their local masjids. It brings prayer times, masjid
discovery, donations, community, and gamified worship tracking together in one app —
built with Expo and React Native for iOS and Android.

## What it does

**Prayer & home**
- Daily prayer times computed on-device with [adhan](https://github.com/batoulapps/adhan-js), with a live next-prayer countdown
- Home dashboard, Qibla direction, Hijri calendar, and selectable azan sounds

**Discover**
- Explore nearby masjids on an interactive map, search and filter, and open directions in the native maps app
- City picker and location-based ranking

**Masjids**
- Rich masjid profiles with photos, facilities, and contribution flows
- Community-driven "add a masjid" submissions and photo contributions
- Ask-the-masjid Q&A and geofenced check-ins

**Community**
- Activity feed, follow masjids, events with RSVP, and masjid reviews & ratings

**Donations**
- One-time and recurring donations, campaigns, secure checkout, and downloadable receipts
- Personal donations dashboard and annual statements

**Gamification**
- Prayer journal, streaks, badges, goals, milestones, reflections, and gentle nudges

**Personal & accessibility**
- Passwordless email-OTP sign-in
- Appearance/theme controls, multi-language (English, Bengali, Arabic) with full RTL support
- Push notifications, exempt mode, and full account data export / deletion

## Tech stack

- **Expo** SDK 54 · **React Native** 0.81 · **React** 19
- **expo-router** — file-based navigation
- **NativeWind v4** (Tailwind CSS) for styling
- **TanStack React Query** with AsyncStorage persistence for server state
- **react-hook-form** + **zod** for forms and validation
- **i18next / react-i18next** + **expo-localization** (en / bn / ar, RTL-aware)
- **react-native-maps** + **expo-location** for discovery
- **expo-notifications**, **expo-audio**, **expo-image**, **expo-secure-store**
- Hind Siliguri font for Bengali typography

The app talks to the **MasjidKoi backend** (FastAPI) over a REST API.

## Getting started

Prerequisites: Node.js 18+, npm, and the [Expo](https://docs.expo.dev) toolchain. For
native builds you'll also need Xcode (iOS) and/or Android Studio.

```bash
# 1. Install dependencies
npm install

# 2. Point the app at your backend API
#    (configure the API base URL in the Expo app config / environment)

# 3. Start the dev server
npx expo start
```

From the Expo dev server you can launch the app in:

- an iOS simulator — `npm run ios`
- an Android emulator — `npm run android`
- a physical device via [Expo Go](https://expo.dev/go)

## Project structure

```
app/                 # screens & routes (expo-router, file-based)
  (app)/(tabs)/      # main tabs: home, explore, feed, profile
  (app)/             # feature screens: donations, campaigns, events,
                     # badges, journal, goals, check-in, masjid, …
components/          # shared UI components
hooks/               # data + behavior hooks (React Query)
lib/                 # api client, i18n, forms, theme, config
assets/              # fonts, images, azan audio
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Run on the iOS simulator |
| `npm run android` | Run on the Android emulator |
| `npm run web` | Run in the browser |
| `npm run lint` | Lint the project |
| `npm test` | Run the Jest test suite |

## Localization

UI strings live in `lib/i18n/locales/{en,bn,ar}.json`. Arabic enables right-to-left
layout automatically. Bengali numerals and Hijri dates are supported throughout.

---

Built as part of the Internet Programming lab project.
