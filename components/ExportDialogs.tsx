import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { useColors } from "@/lib/theme/useColors";

import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Text } from "./Text";

import type { ExportState } from "@/hooks/useDataExport";

/**
 * The data-export progress (screen 69) + failure (screen 70) dialogs, shared by
 * the Privacy screen and the deletion consequences screen.
 */
export function ExportDialogs({
  state,
  onCancel,
  onRetry,
}: {
  state: ExportState;
  onCancel: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const c = useColors();

  return (
    <>
      <Dialog visible={state === "loading"} onClose={onCancel}>
        <View className="items-center gap-2.5">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary-soft">
            <ActivityIndicator color={c.primary} />
          </View>
          <Text className="text-[18px] font-bold text-content-primary">
            {t("settings.privacy.exportProgressTitle")}
          </Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("settings.privacy.exportProgressBody")}
          </Text>
        </View>
        <Button variant="text" label={t("settings.privacy.exportCancel")} onPress={onCancel} />
      </Dialog>

      <Dialog visible={state === "error"} onClose={onCancel}>
        <View className="items-center gap-2">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-error-soft">
            <Feather name="wifi-off" size={22} color={c.error} />
          </View>
          <Text className="text-[18px] font-bold text-content-primary">
            {t("settings.privacy.exportErrorTitle")}
          </Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("settings.privacy.exportErrorBody")}
          </Text>
        </View>
        <View className="gap-2.5 pt-2">
          <Button
            label={t("settings.privacy.exportRetry")}
            leftIcon={
              <Feather name="rotate-cw" size={16} color={c["on-inverse"]} />
            }
            onPress={onRetry}
          />
          <Button variant="text" label={t("common.cancel")} onPress={onCancel} />
        </View>
      </Dialog>
    </>
  );
}

export default ExportDialogs;
