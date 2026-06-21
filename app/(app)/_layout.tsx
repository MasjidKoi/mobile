import { Stack } from "expo-router";

import { LocationProvider } from "@/providers/LocationProvider";
import { NudgeScheduler } from "@/providers/NudgeScheduler";
import { ReminderScheduler } from "@/providers/ReminderScheduler";

/**
 * The signed-in/guest app shell. The 4-tab bar lives in `(tabs)`. The auth flow
 * and permission explainers are modal screens presented OVER the current screen;
 * the flow pushes one screen and replaces in place, so completion `router.back()`s
 * to the screen that opened the gate (see LoginGateProvider). `masjid/[id]` is a
 * stub route (Discovery/Profile fill it in Phases 3/5).
 *
 * `LocationProvider` scopes the location authority to the app group (tabs +
 * masjid + future Qibla share one permission/coords state and one GPS watcher);
 * it stays inert until a screen calls `requestLocation()`.
 */
export default function AppLayout() {
  return (
    <LocationProvider>
      <ReminderScheduler />
      <NudgeScheduler />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="masjid/[id]" />
        <Stack.Screen name="search" />
        <Stack.Screen name="city-picker" options={{ presentation: "modal" }} />
        <Stack.Screen name="submit-masjid" />
        <Stack.Screen name="my-submissions" />
        {/* Phase 5 — masjid profile contributions */}
        <Stack.Screen name="gallery" options={{ presentation: "modal", animation: "fade" }} />
        <Stack.Screen name="add-photo" />
        <Stack.Screen name="ask-question" />
        <Stack.Screen name="suggest-edit" />
        <Stack.Screen name="my-photo-submissions" />
        <Stack.Screen name="my-questions" />
        <Stack.Screen name="donate/[id]" />
        <Stack.Screen name="donation/[id]" />
        <Stack.Screen name="campaign/[id]" />
        <Stack.Screen name="recurring" />
        <Stack.Screen name="recurring-setup" />
        <Stack.Screen name="donations" />
        <Stack.Screen name="receipt/[id]" />
        <Stack.Screen name="qibla" />
        <Stack.Screen name="hijri-calendar" />
        <Stack.Screen name="prayer-reminders" />
        <Stack.Screen name="azan-sound" />
        <Stack.Screen name="ramadan-reminders" />
        {/* Phase 7 — settings hub + sub-screens */}
        <Stack.Screen name="settings" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="appearance" />
        <Stack.Screen name="language" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="storage" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="delete-account" />
        <Stack.Screen name="delete-confirm" />
        <Stack.Screen name="account-deleted" />
        <Stack.Screen name="about" />
        {/* Phase 8 — community */}
        <Stack.Screen name="announcement/[id]" />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="reviews/[id]" />
        <Stack.Screen name="review/[id]" />
        {/* Check-in outcome + post-check-in review prompt are sheets over the
            dimmed profile (design 88/89/90). */}
        <Stack.Screen
          name="checkin/[id]"
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen
          name="review-prompt/[id]"
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen name="following" />
        {/* A card, not a modal: its location-denied state opens the city-picker
            modal, and modal-over-modal stacks awkwardly on iOS. */}
        <Stack.Screen name="set-home-masjid" />
        <Stack.Screen name="email" options={{ presentation: "modal" }} />
        <Stack.Screen name="otp" options={{ presentation: "modal" }} />
        <Stack.Screen name="profile-setup" options={{ presentation: "modal" }} />
        <Stack.Screen name="location-explainer" options={{ presentation: "modal" }} />
        <Stack.Screen name="notification-explainer" options={{ presentation: "modal" }} />
        {/* Phase 9 — gamification. Most screens auto-register with the default
            (headerShown:false) options; only the celebrations are modals. */}
        <Stack.Screen name="milestone" options={{ presentation: "modal", animation: "fade" }} />
        <Stack.Screen name="badge-earned" options={{ presentation: "modal", animation: "fade" }} />
      </Stack>
    </LocationProvider>
  );
}
