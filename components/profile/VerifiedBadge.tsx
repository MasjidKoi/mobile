import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Button, Dialog, Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/**
 * The trust badge beside a masjid's name. NGO-verified masjids get a tappable
 * green badge that opens the explainer (design 20 → 22); unverified masjids show
 * a muted "not verified" pill (design 21) rather than nothing.
 */
export function VerifiedBadge({ verified }: { verified: boolean }) {
  const { t } = useTranslation();
  const c = useColors();
  const [open, setOpen] = useState(false);

  if (!verified) {
    return (
      <View className="flex-row items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5">
        <Feather name="shield-off" size={12} color={c["text-muted"]} />
        <Text className="text-[12px] font-semibold text-content-muted">
          {t("masjid.verified.unverified")}
        </Text>
      </View>
    );
  }

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

      <Dialog visible={open} onClose={() => setOpen(false)}>
        <View className="items-center gap-3.5">
          <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-primary-soft">
            <Feather name="check-circle" size={28} color={c.primary} />
          </View>
          <Text className="text-[18px] font-bold text-content-primary">{t("masjid.verified.title")}</Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("masjid.verified.body")}
          </Text>
        </View>
        <Button label={t("masjid.verified.gotIt")} onPress={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export default VerifiedBadge;
