import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** Placeholder — the announcements/events Feed lands in Phase 8. */
export default function FeedTab() {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-lg">
        <EmptyState
          icon={<Feather name="file-text" size={28} color={c.primary} />}
          title={t("shell.comingSoon")}
          caption={t("shell.feed")}
        />
      </View>
    </SafeAreaView>
  );
}
