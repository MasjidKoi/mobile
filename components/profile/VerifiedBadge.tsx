import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Button, Dialog, Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/**
 * The NGO-verified badge shown beside a masjid's name (design 20). Tapping it
 * opens a one-line explainer of what verification means (design 22). Renders
 * nothing for unverified masjids.
 */
export function VerifiedBadge({ verified }: { verified: boolean }) {
  const { t } = useTranslation();
  const c = useColors();
  const [open, setOpen] = useState(false);

  if (!verified) return null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("masjid.verified.label")}
        onPress={() => setOpen(true)}
        hitSlop={8}
        className="flex-row items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5"
      >
        <Feather name="check-circle" size={13} color={c.primary} />
        <Text className="text-[12px] font-semibold text-primary">{t("masjid.verified.label")}</Text>
      </Pressable>

      <Dialog
        visible={open}
        onClose={() => setOpen(false)}
        title={t("masjid.verified.title")}
        description={t("masjid.verified.body")}
      >
        <View className="items-end">
          <Button variant="text" label={t("common.ok")} onPress={() => setOpen(false)} />
        </View>
      </Dialog>
    </>
  );
}

export default VerifiedBadge;
