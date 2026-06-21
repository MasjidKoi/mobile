import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** Which gated action triggered the gate — picks the icon + copy. */
export type GateReason = "donate" | "community" | "contribute" | "submit" | "generic";

const ICON: Record<GateReason, keyof typeof Feather.glyphMap> = {
  donate: "heart",
  community: "lock",
  contribute: "edit-3",
  submit: "plus-circle",
  generic: "user",
};

export type LoginGateSheetProps = {
  visible: boolean;
  reason: GateReason;
  onContinue: () => void;
  onClose: () => void;
};

/**
 * The modal login gate (designs 05 Donate / 92 Community). One reusable sheet
 * parametrized by `reason`; presented by LoginGateProvider when a guest hits a
 * gated action. "Continue with email" opens the auth flow; "Not now" cancels.
 */
export function LoginGateSheet({ visible, reason, onContinue, onClose }: LoginGateSheetProps) {
  const { t } = useTranslation();
  const c = useColors();

  // Some reasons (e.g. `contribute`) add a "you'll return here" reassurance note;
  // others omit it. defaultValue keeps the raw key from leaking when absent.
  const note = t(`auth.gate.${reason}.note`, { defaultValue: "" });

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="items-center gap-3 pt-1">
        <View className="h-16 w-16 items-center justify-center rounded-[32px] bg-primary-soft">
          <Feather name={ICON[reason]} size={28} color={c.primary} />
        </View>
        <Text variant="title" className="text-center">
          {t(`auth.gate.${reason}.title`)}
        </Text>
        <Text variant="body" className="text-center text-content-secondary">
          {t(`auth.gate.${reason}.body`)}
        </Text>
        {note ? (
          <Text variant="caption" className="text-center text-content-muted">
            {note}
          </Text>
        ) : null}
      </View>
      <Button
        label={t("auth.gate.continueWithEmail")}
        leftIcon={<Feather name="mail" size={18} color={c["on-inverse"]} />}
        onPress={onContinue}
        className="mt-1"
      />
      <Button variant="text" label={t("common.notNow")} onPress={onClose} />
    </BottomSheet>
  );
}

export default LoginGateSheet;
