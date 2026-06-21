import "../global.css";
import {
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
  useFonts,
} from "@expo-google-fonts/hind-siliguri";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { initRTL } from "@/lib/theme/rtl";
import { AppProviders } from "@/providers/AppProviders";

SplashScreen.preventAutoHideAsync();
// Allow RTL at startup so an Arabic build can flip layout (forcing it needs a
// restart — see the Phase 7 "Arabic Restart" screen).
initRTL();

export default function RootLayout() {
  const [loaded] = useFonts({
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
  });

  // Keep the splash up until fonts are ready; ThemeProvider hides it once the
  // persisted color scheme is hydrated, so the first frame has the right palette.
  if (!loaded) {
    return null;
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
