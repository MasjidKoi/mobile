import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { resetOnboarding } from "@/lib/onboarding";

// Placeholder landing screen after onboarding finishes. Swap for the real app
// home (Prayer Times) once those screens are built.
export default function Home() {
  const { t } = useTranslation();

  const replayOnboarding = async () => {
    await resetOnboarding();
    router.replace("/onboarding");
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-lg">
      <Text variant="title" className="text-center">
        {t("common.brand")}
      </Text>
      <Text variant="body" className="mt-sm text-center text-content-secondary">
        {t("home.placeholder")}
      </Text>
      <Button
        variant="secondary"
        label={t("home.replayOnboarding")}
        className="mt-lg"
        onPress={replayOnboarding}
      />
    </SafeAreaView>
  );
}
