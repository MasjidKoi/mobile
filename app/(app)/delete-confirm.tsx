import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Text } from "@/components";
import { requestAccountDeletion } from "@/lib/account/deletion";
import { clearGuestData } from "@/lib/guest/store";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

export default function DeleteConfirmScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { logout } = useAuth();

  const confirmWord = t("settings.delete.confirmWord");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matched = typed.trim().toLowerCase() === confirmWord.toLowerCase();

  const onDelete = async () => {
    if (!matched || busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestAccountDeletion();
    } catch {
      setError(t("settings.delete.failed"));
      setBusy(false);
      return;
    }
    // Deletion accepted (202). Purge local state best-effort — a cleanup hiccup
    // must not mask the successful deletion — then drop to the confirmation screen.
    await Promise.allSettled([clearGuestData(), logout()]);
    router.replace("/account-deleted");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={t("settings.delete.confirmTitle")} left={<BackButton />} />
      <ScrollView
        contentContainerClassName="grow gap-4 px-4 pb-5 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="title" className="font-bold">
          {t("settings.delete.confirmTitle")}
        </Text>
        <Text className="text-body font-regular text-content-secondary">
          {t("settings.delete.confirmSub")}
        </Text>

        {/* Target word */}
        <View className="flex-row items-center gap-2 pt-1">
          <Text className="text-caption font-regular text-content-muted">
            {t("settings.delete.typeLabel")}
          </Text>
          <View className="rounded-lg bg-error-soft px-3 py-1">
            <Text className="text-body font-semibold text-error">
              {confirmWord}
            </Text>
          </View>
        </View>

        {/* Confirmation input */}
        <View
          className={`flex-row items-center gap-2 rounded-md bg-surface px-3.5 py-3 ${
            matched
              ? "border-[1.5px] border-primary"
              : "border-[1.5px] border-error"
          }`}
        >
          <TextInput
            value={typed}
            onChangeText={setTyped}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
            accessibilityLabel={t("settings.delete.confirmSub")}
            placeholder={confirmWord}
            placeholderTextColor={c["text-muted"]}
            className="flex-1 font-primary text-[16px] text-content-primary"
          />
          {matched ? (
            <Feather name="check-circle" size={18} color={c.primary} />
          ) : null}
        </View>

        {/* No-undo note */}
        <View className="flex-row items-center gap-2 rounded-md bg-error-soft px-3.5 py-3">
          <Feather name="info" size={16} color={c.error} />
          <Text className="flex-1 text-caption font-medium text-error">
            {t("settings.delete.noUndo")}
          </Text>
        </View>

        {error ? (
          <Text variant="caption" className="text-error">
            {error}
          </Text>
        ) : null}

        <View className="grow" />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !matched || busy }}
          disabled={!matched || busy}
          onPress={() => void onDelete()}
          className={`flex-row items-center justify-center gap-2 rounded-md bg-error px-4 py-3.5 ${
            !matched || busy ? "opacity-50" : "active:opacity-90"
          }`}
        >
          <Feather name="trash-2" size={17} color={c["on-inverse"]} />
          <Text className="text-body font-semibold text-on-inverse">
            {t("settings.delete.deleteBtn")}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="items-center rounded-md bg-surface px-4 py-3 active:bg-primary-soft"
        >
          <Text className="text-body font-semibold text-content-secondary">
            {t("settings.delete.cancel")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
