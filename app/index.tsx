import { Redirect } from "expo-router";
import { View } from "react-native";

import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

/**
 * Entry gate. Reads the persisted first-run flag and sends the user to the
 * intro carousel (first launch) or straight into the app (returning user).
 * Holds a neutral background while the flag loads to avoid flashing a route.
 */
export default function Index() {
  const status = useOnboardingStatus();

  if (status === "loading") {
    return <View className="flex-1 bg-background" />;
  }

  return <Redirect href={status === "complete" ? "/home" : "/onboarding"} />;
}
