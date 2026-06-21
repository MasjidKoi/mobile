import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, Button, EmptyState, Text } from "@/components";
import { useUploadCommunityPhoto } from "@/hooks/useUploadCommunityPhoto";
import { ApiError } from "@/lib/api/errors";
import { useColors } from "@/lib/theme/useColors";

type Picked = { uri: string; fileName?: string | null; mimeType?: string | null };
type Step = "form" | "submitted" | "limited";

/** 25–27 Add Photo — pick → upload → submitted / rate-limited. 🔒 entered via the login gate. */
export default function AddPhotoScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { masjidId } = useLocalSearchParams<{ masjidId: string }>();

  const [step, setStep] = useState<Step>("form");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryMins, setRetryMins] = useState<number | null>(null);

  const upload = useUploadCommunityPhoto(masjidId ?? "");

  const pickFrom = async (mode: "camera" | "library") => {
    setErrorMsg(null);
    try {
      if (mode === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setErrorMsg(t("masjid.contribute.photo.cameraDenied"));
          return;
        }
      }
      const res =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
      if (res.canceled || !res.assets?.length) return;
      const a = res.assets[0];
      setPicked({ uri: a.uri, fileName: a.fileName, mimeType: a.mimeType });
    } catch {
      setErrorMsg(t("masjid.contribute.photo.pickError"));
    }
  };

  const submit = async () => {
    if (!picked) return;
    setErrorMsg(null);
    try {
      await upload.mutateAsync(picked);
      setStep("submitted");
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setRetryMins(e.retryAfterSeconds ? Math.max(1, Math.ceil(e.retryAfterSeconds / 60)) : null);
        setStep("limited");
      } else {
        setErrorMsg(t("masjid.contribute.photo.error"));
      }
    }
  };

  const reset = () => {
    setPicked(null);
    setStep("form");
  };

  // ---- Submitted --------------------------------------------------------
  if (step === "submitted") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="check-circle" size={28} color={c.primary} />}
            title={t("masjid.contribute.photo.sentTitle")}
            caption={t("masjid.contribute.photo.sentCaption")}
            action={
              <View className="w-full gap-2 pt-1">
                <Button label={t("masjid.contribute.photo.addAnother")} onPress={reset} />
                <Button
                  variant="secondary"
                  label={t("masjid.contribute.myPhotos.cta")}
                  onPress={() => router.replace("/my-photo-submissions")}
                />
                <Button variant="text" label={t("common.done")} onPress={() => router.back()} />
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---- Rate limited -----------------------------------------------------
  if (step === "limited") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="clock" size={28} color="#8A6A1F" />}
            title={t("masjid.contribute.photo.limitTitle")}
            caption={
              retryMins != null
                ? t("masjid.contribute.photo.limitRetry", { minutes: retryMins })
                : t("masjid.contribute.photo.limitCaption")
            }
            action={
              <Button variant="text" label={t("common.close")} onPress={() => router.back()} />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---- Form -------------------------------------------------------------
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.contribute.photo.title")}
        left={
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8">
        {picked ? (
          <View className="overflow-hidden rounded-md border border-border">
            <Image source={{ uri: picked.uri }} style={{ width: "100%", height: 240 }} contentFit="cover" />
          </View>
        ) : (
          <View className="items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-10">
            <Feather name="camera" size={28} color={c.primary} />
            <Text className="text-center text-caption font-regular text-content-secondary">
              {t("masjid.contribute.photo.intro")}
            </Text>
          </View>
        )}

        <View className="flex-row gap-2">
          <Button
            variant="secondary"
            label={t("masjid.contribute.photo.camera")}
            leftIcon={<Feather name="camera" size={16} color={c["text-primary"]} />}
            className="flex-1"
            onPress={() => void pickFrom("camera")}
          />
          <Button
            variant="secondary"
            label={t("masjid.contribute.photo.library")}
            leftIcon={<Feather name="image" size={16} color={c["text-primary"]} />}
            className="flex-1"
            onPress={() => void pickFrom("library")}
          />
        </View>

        <Banner
          variant="info"
          icon={<Feather name="info" size={15} color={c.primary} />}
          message={t("masjid.contribute.photo.reviewNote")}
        />
        {errorMsg ? <Text className="text-caption text-error">{errorMsg}</Text> : null}
      </ScrollView>

      <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
        <Button
          label={upload.isPending ? t("masjid.contribute.photo.uploading") : t("masjid.contribute.photo.submit")}
          disabled={!picked || upload.isPending}
          leftIcon={upload.isPending ? <ActivityIndicator color={c["on-inverse"]} size="small" /> : undefined}
          onPress={() => void submit()}
        />
      </View>
    </SafeAreaView>
  );
}
