import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, Input, Text } from "@/components";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { MADHABS, type Madhab } from "@/lib/forms/schemas";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/**
 * 09 Profile Setup — shown once after first login, fully skippable. Also reused
 * as "edit profile" from the Profile tab (prefilled from the current user).
 * Photo is deferred to Phase 7; Phase 1 collects name + madhab (Hanafi default).
 */
export default function ProfileSetup() {
  const { t } = useTranslation();
  const c = useColors();
  const { user } = useAuth();
  const { completeAuthFlow } = useLoginGate();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.display_name ?? "");
  const [madhab, setMadhab] = useState<Madhab>(user?.madhab ?? "hanafi");
  const [photoNote, setPhotoNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onContinue = async () => {
    setError(null);
    const trimmed = name.trim();
    try {
      await updateProfile.mutateAsync({
        madhab,
        ...(trimmed ? { display_name: trimmed } : {}),
      });
      completeAuthFlow();
    } catch {
      setError("auth.profileSetup.saveError");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <AppBar
        title={t("auth.profileSetup.appBar")}
        className="bg-surface"
        right={
          <Pressable accessibilityRole="button" onPress={completeAuthFlow} hitSlop={8}>
            <Text variant="body" className="font-medium text-content-secondary">
              {t("common.skip")}
            </Text>
          </Pressable>
        }
      />

      <View className="flex-1 gap-6 px-lg pt-md">
        {/* Avatar (photo deferred to Phase 7) */}
        <View className="items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("auth.profileSetup.addPhoto")}
            onPress={() => setPhotoNote(true)}
            className="h-24 w-24 items-center justify-center rounded-full bg-primary-soft"
          >
            <Feather name="camera" size={32} color={c.primary} />
          </Pressable>
          <Text variant="caption" className="font-semibold text-primary">
            {t("auth.profileSetup.addPhoto")}
          </Text>
          {photoNote ? (
            <Text variant="micro" className="text-content-muted">
              {t("auth.profileSetup.photoComingSoon")}
            </Text>
          ) : null}
        </View>

        {/* Name */}
        <Input
          label={t("auth.profileSetup.nameLabel")}
          leftIcon={<Feather name="user" size={18} color={c["text-muted"]} />}
          placeholder={t("auth.profileSetup.namePlaceholder")}
          value={name}
          onChangeText={setName}
          maxLength={100}
          accessibilityLabel={t("auth.profileSetup.nameLabel")}
        />

        {/* Madhab */}
        <View className="gap-1">
          <Text variant="body" className="font-semibold">
            {t("auth.profileSetup.madhabLabel")}
          </Text>
          <Text variant="caption" className="text-content-muted">
            {t("auth.profileSetup.madhabHint")}
          </Text>
          <View className="flex-row flex-wrap gap-2 pt-2.5">
            {MADHABS.map((m) => {
              const selected = madhab === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setMadhab(m)}
                  className={`rounded-[20px] px-4 py-2.5 ${
                    selected
                      ? "border-[1.5px] border-primary bg-primary-soft"
                      : "border border-border bg-surface"
                  }`}
                >
                  <Text
                    variant="caption"
                    className={selected ? "font-semibold text-primary" : "text-content-secondary"}
                  >
                    {t(`auth.madhab.${m}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text variant="caption" className="text-content-muted">
          {t("auth.profileSetup.laterNote")}
        </Text>

        {error ? (
          <Text variant="caption" className="text-error">
            {t(error)}
          </Text>
        ) : null}

        <View className="flex-1" />

        <Button
          label={t("auth.profileSetup.continue")}
          onPress={onContinue}
          disabled={updateProfile.isPending}
          className="mb-3"
        />
      </View>
    </SafeAreaView>
  );
}
