import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, Button, Text } from "@/components";
import { useMasjid } from "@/hooks/useMasjid";
import { useMyPhotoSubmissions } from "@/hooks/useMyPhotoSubmissions";
import { useUploadCommunityPhoto } from "@/hooks/useUploadCommunityPhoto";
import { ApiError } from "@/lib/api/errors";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

type Picked = { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number | null };
type Step = "form" | "submitted" | "limited";

// Mirrors the backend abuse guards (community_photo_service) for the limit card.
const PER_MASJID_LIMIT = 3;
const PER_DAY_LIMIT = 10;

const GOLD = "#8A6A1F";
const GOLD_BG = "#F4EDDB";

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Indeterminate upload bar — the `fetch` client exposes no byte progress, so a
 * sweeping fill honestly signals "uploading" without faking a percentage. */
function UploadingBar() {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 1100, useNativeDriver: false }),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const left = x.interpolate({ inputRange: [0, 1], outputRange: ["-40%", "100%"] });
  return (
    <View className="h-2 overflow-hidden rounded-[4px] bg-[#EDEFEC]">
      <Animated.View
        style={{ position: "absolute", left, width: "40%", height: "100%" }}
        className="rounded-[4px] bg-primary"
      />
    </View>
  );
}

/** 25–27 Add Photo — pick → upload → submitted / rate-limited. 🔒 entered via the login gate. */
export default function AddPhotoScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { masjidId } = useLocalSearchParams<{ masjidId: string }>();
  const masjid = useMasjid(masjidId ?? "").data;
  const mySubs = useMyPhotoSubmissions(true).data ?? [];

  const [step, setStep] = useState<Step>("form");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryMins, setRetryMins] = useState<number | null>(null);

  const upload = useUploadCommunityPhoto(masjidId ?? "");

  // Reset the flow when the target masjid changes (e.g. the screen instance is
  // reused for a new deep link) so a prior submitted/limited state never leaks.
  useEffect(() => {
    setStep("form");
    setPicked(null);
    setErrorMsg(null);
  }, [masjidId]);

  const back = () => router.back();
  const goMyPhotos = () => router.replace("/my-photo-submissions");

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
      setPicked({ uri: a.uri, fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize });
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

  /** Shared chrome for the result screens (design 26/27): top bar, centered
   * content, and a bottom CTA bar with the primary "back to profile" action. */
  const ResultScreen = ({ children, link }: { children: React.ReactNode; link?: React.ReactNode }) => (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.contribute.photo.title")}
        left={
          <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <View className="flex-1 items-center justify-center gap-4 px-7">{children}</View>
      <View className="gap-2 border-t border-border bg-surface px-4 pb-2 pt-3">
        <Button label={t("masjid.contribute.backToProfile")} onPress={back} />
        {link}
      </View>
    </SafeAreaView>
  );

  // ---- Submitted (26) ---------------------------------------------------
  if (step === "submitted") {
    return (
      <ResultScreen
        link={
          <Button variant="text" label={t("masjid.contribute.myPhotos.cta")} onPress={goMyPhotos} />
        }
      >
        <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-primary-soft">
          <Feather name="check" size={40} color={c.primary} />
        </View>
        <Text className="text-center text-[22px] font-bold text-content-primary">
          {t("masjid.contribute.photo.sentTitle")}
        </Text>
        <Text className="max-w-[300px] text-center text-body font-regular text-content-secondary">
          {t("masjid.contribute.photo.sentCaption")}
        </Text>
        <View className="flex-row items-center gap-1.5 rounded-full bg-[#F5EEDC] px-3 py-1.5">
          <Feather name="clock" size={13} color={GOLD} />
          <Text className="text-caption font-semibold text-[#8A6A1F]">
            {t("masjid.contribute.photo.status.pending")}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Feather name="bell" size={15} color={c["text-muted"]} />
          <Text className="text-caption text-content-muted">{t("masjid.contribute.photo.pushNote")}</Text>
        </View>
      </ResultScreen>
    );
  }

  // ---- Rate limited (27) ------------------------------------------------
  if (step === "limited") {
    const perMasjid = mySubs.filter((p) => p.masjid_id === masjidId && isToday(p.created_at)).length;
    const perUser = mySubs.filter((p) => isToday(p.created_at)).length;
    const Row = ({ label, used, max, gold }: { label: string; used: number; max: number; gold?: boolean }) => (
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-sm font-regular text-content-secondary">{label}</Text>
        <Text className={`text-sm font-bold ${gold ? "text-[#8A6A1F]" : "text-content-primary"}`}>
          {`${f.number(Math.min(used, max))} / ${f.number(max)}`}
        </Text>
      </View>
    );
    return (
      <ResultScreen
        link={
          <Button variant="text" label={t("masjid.contribute.myPhotos.cta")} onPress={goMyPhotos} />
        }
      >
        <View style={{ backgroundColor: GOLD_BG }} className="h-[84px] w-[84px] items-center justify-center rounded-full">
          <Feather name="clock" size={38} color={GOLD} />
        </View>
        <Text className="text-center text-[22px] font-bold text-content-primary">
          {t("masjid.contribute.photo.limitTitle")}
        </Text>
        <Text className="max-w-[300px] text-center text-body font-regular text-content-secondary">
          {retryMins != null
            ? t("masjid.contribute.photo.limitRetry", { minutes: retryMins })
            : t("masjid.contribute.photo.limitCaption")}
        </Text>
        <View className="w-full overflow-hidden rounded-md border border-border bg-surface">
          <View className="border-b border-border">
            <Row label={t("masjid.contribute.photo.limitPerMasjid")} used={perMasjid} max={PER_MASJID_LIMIT} gold />
          </View>
          <Row label={t("masjid.contribute.photo.limitPerDay")} used={perUser} max={PER_DAY_LIMIT} />
        </View>
        <View className="flex-row items-center gap-1.5">
          <Feather name="shield" size={15} color={c["text-muted"]} />
          <Text className="text-caption text-content-muted">{t("masjid.contribute.photo.limitReassure")}</Text>
        </View>
      </ResultScreen>
    );
  }

  // ---- Form (25) --------------------------------------------------------
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.contribute.photo.title")}
        left={
          <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8">
        {masjid?.name ? (
          <View className="flex-row items-center gap-1.5">
            <Feather name="map-pin" size={14} color={c["text-muted"]} />
            <Text numberOfLines={1} className="text-caption font-semibold text-content-secondary">
              {masjid.name}
            </Text>
          </View>
        ) : null}

        {picked ? (
          <>
            <View className="overflow-hidden rounded-md border border-border">
              <Image source={{ uri: picked.uri }} style={{ width: "100%", height: 230 }} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.close")}
                onPress={() => setPicked(null)}
                hitSlop={8}
                style={{ backgroundColor: "rgba(24,36,32,0.8)" }}
                className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full"
              >
                <Feather name="x" size={16} color="#FFFFFF" />
              </Pressable>
            </View>

            <View className="gap-2.5 rounded-md border border-border bg-surface p-3.5">
              <View className="flex-row items-center gap-2.5">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                  <Feather name="image" size={18} color={c.primary} />
                </View>
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-caption font-semibold text-content-primary">
                    {picked.fileName ?? picked.uri.split("/").pop() ?? "photo.jpg"}
                  </Text>
                  {picked.fileSize ? (
                    <Text className="text-[12px] font-regular text-content-muted">
                      {formatBytes(picked.fileSize)}
                    </Text>
                  ) : null}
                </View>
                {upload.isPending ? <ActivityIndicator color={c.primary} size="small" /> : null}
              </View>
              {upload.isPending ? (
                <>
                  <UploadingBar />
                  <Text className="text-[12px] font-regular text-content-secondary">
                    {t("masjid.contribute.photo.uploading")}
                  </Text>
                </>
              ) : null}
            </View>
          </>
        ) : (
          <View className="items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-10">
            <Feather name="camera" size={28} color={c.primary} />
            <Text className="text-center text-caption font-regular text-content-secondary">
              {t("masjid.contribute.photo.intro")}
            </Text>
          </View>
        )}

        {!picked ? (
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
        ) : null}

        <Banner
          variant="warning"
          icon={<Feather name="info" size={15} color={GOLD} />}
          message={t("masjid.contribute.photo.guidelines")}
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
