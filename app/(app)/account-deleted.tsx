import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/**
 * Terminal screen after a successful deletion (the flow `router.replace`s here,
 * so there's no back path). The session is already cleared to guest mode.
 */
export default function AccountDeletedScreen() {
  const { t } = useTranslation();
  const c = useColors();

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center gap-3.5">
          <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-soft">
            <Feather name="check" size={32} color={c.primary} />
          </View>
          <Text variant="title" className="text-center font-bold">
            {t("settings.delete.deletedTitle")}
          </Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("settings.delete.deletedBody")}
          </Text>
        </View>
      </View>
      <View className="px-6 pb-4">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/home")}
          className="items-center rounded-md bg-primary px-4 py-3.5 active:bg-primary-pressed"
        >
          <Text className="text-body font-semibold text-on-inverse">
            {t("settings.delete.continueGuest")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
