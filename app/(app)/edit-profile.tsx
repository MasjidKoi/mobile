import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, Card, Input, Text } from "@/components";
import {
  useUpdateProfile,
  type ProfilePhotoAsset,
} from "@/hooks/useUpdateProfile";
import { MADHABS, type Madhab } from "@/lib/forms/schemas";
import { useColors } from "@/lib/theme/useColors";
import { useAuth, type UserProfile } from "@/providers/AuthProvider";

function initialsFor(user: UserProfile | null): string {
  const source = user?.display_name?.trim() || user?.email || "";
  return source ? source.slice(0, 2).toUpperCase() : "🙂";
}

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.display_name ?? "");
  const [madhab, setMadhab] = useState<Madhab>(user?.madhab ?? "hanafi");
  const [photo, setPhoto] = useState<ProfilePhotoAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUri = photo?.uri ?? user?.profile_photo_url ?? null;

  const pickPhoto = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const a = result.assets[0];
      setPhoto({
        uri: a.uri,
        name:
          a.fileName ??
          `avatar.${(a.mimeType ?? "image/jpeg").split("/")[1] ?? "jpg"}`,
        type: a.mimeType ?? "image/jpeg",
      });
    } catch {
      setError("settings.editProfile.photoError");
    }
  };

  const onSave = async () => {
    setError(null);
    const trimmed = name.trim();
    try {
      await updateProfile.mutateAsync({
        madhab,
        ...(trimmed ? { display_name: trimmed } : {}),
        ...(photo ? { photo } : {}),
      });
      router.back();
    } catch {
      setError("settings.editProfile.saveError");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={t("profileTab.editProfile")} left={<BackButton />} />
      <ScrollView contentContainerClassName="grow gap-6 px-4 pb-5 pt-4">
        {/* Photo */}
        <View className="items-center gap-2.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("settings.editProfile.changePhoto")}
            onPress={pickPhoto}
            className="h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full bg-primary-soft"
          >
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{ width: 88, height: 88 }}
                contentFit="cover"
              />
            ) : (
              <Text className="text-[30px] font-semibold text-primary">
                {initialsFor(user)}
              </Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={pickPhoto}
            className="flex-row items-center gap-1.5"
            hitSlop={6}
          >
            <Feather name="camera" size={15} color={c.primary} />
            <Text className="text-caption font-semibold text-primary">
              {t("settings.editProfile.changePhoto")}
            </Text>
          </Pressable>
        </View>

        {/* Name */}
        <Input
          label={t("auth.profileSetup.nameLabel")}
          placeholder={t("auth.profileSetup.namePlaceholder")}
          value={name}
          onChangeText={setName}
          maxLength={100}
          accessibilityLabel={t("auth.profileSetup.nameLabel")}
        />

        {/* Madhab */}
        <View className="gap-2">
          <Text className="text-caption font-semibold text-content-secondary">
            {t("auth.profileSetup.madhabLabel")}
          </Text>
          <Card>
            {MADHABS.map((m) => {
              const selected = madhab === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setMadhab(m)}
                  className="flex-row items-center gap-3 px-4 py-[13px] active:bg-primary-soft"
                >
                  <Text className="flex-1 text-body font-regular text-content-primary">
                    {t(`auth.madhab.${m}`)}
                  </Text>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full ${
                      selected ? "bg-primary" : "border-2 border-border"
                    }`}
                  >
                    {selected ? (
                      <Feather
                        name="check"
                        size={13}
                        color={c["on-inverse"]}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </View>

        {error ? (
          <Text variant="caption" className="text-error">
            {t(error)}
          </Text>
        ) : null}

        <View className="grow" />

        <Button
          label={t("settings.editProfile.save")}
          onPress={onSave}
          disabled={updateProfile.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
