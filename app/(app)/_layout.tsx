import { Stack } from "expo-router";

import { LocationProvider } from "@/providers/LocationProvider";
import { ReminderScheduler } from "@/providers/ReminderScheduler";

/**
 * The signed-in/guest app shell. The 4-tab bar lives in `(tabs)`. The auth flow
 * and permission explainers are modal screens presented OVER the tabs; on
 * completion `router.dismissAll()` returns to the underlying tab. `masjid/[id]`
 * is a stub route (Discovery/Profile fill it in Phases 3/5).
 *
 * `LocationProvider` scopes the location authority to the app group (tabs +
 * masjid + future Qibla share one permission/coords state and one GPS watcher);
 * it stays inert until a screen calls `requestLocation()`.
 */
export default function AppLayout() {
  return (
    <LocationProvider>
      <ReminderScheduler />
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
        <Stack.Screen name="qibla" />
        <Stack.Screen name="hijri-calendar" />
        <Stack.Screen name="prayer-reminders" />
        <Stack.Screen name="azan-sound" />
        <Stack.Screen name="ramadan-reminders" />
        <Stack.Screen name="set-home-masjid" options={{ presentation: "modal" }} />
        <Stack.Screen name="email" options={{ presentation: "modal" }} />
        <Stack.Screen name="otp" options={{ presentation: "modal" }} />
        <Stack.Screen name="profile-setup" options={{ presentation: "modal" }} />
        <Stack.Screen name="location-explainer" options={{ presentation: "modal" }} />
        <Stack.Screen name="notification-explainer" options={{ presentation: "modal" }} />
      </Stack>
    </LocationProvider>
  );
}
