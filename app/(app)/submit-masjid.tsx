import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, Button, EmptyState, Input, MasjidRow, Text } from "@/components";
import { useSubmitMasjid } from "@/hooks/useSubmitMasjid";
import { useUploadSubmissionPhoto } from "@/hooks/useUploadSubmissionPhoto";
import { Colors } from "@/constants/theme";
import { ApiError } from "@/lib/api/errors";
import {
  masjidSubmissionSchema,
  zodResolver,
  type MasjidSubmissionFormValues,
} from "@/lib/forms/schemas";
import { useFormat } from "@/lib/i18n/format";
import { getCityById } from "@/lib/location/cities";
import type { Coords } from "@/lib/location/types";
import { fetchNearby } from "@/lib/masjids/api";
import type { MasjidNearbyResult } from "@/lib/masjids/types";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";

/** Radius for the client-side dedupe check (no backend endpoint). */
const DEDUPE_RADIUS_M = 150;
/** Fallback pin centre when no location is resolved — sourced from the cities table. */
const DHAKA: Coords = getCityById("dhaka")?.coords ?? { lat: 23.8103, lng: 90.4125 };

type Step = "form" | "dedupe" | "success";

/** 17 Submit Masjid → 18 Dedupe Check → success. One screen, three steps. 🔒 auth-gated. */
export default function SubmitMasjidScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { coords } = useLocation();

  const [step, setStep] = useState<Step>("form");
  const [pin, setPin] = useState<Coords>(coords ?? DHAKA);
  const [photo, setPhoto] = useState<{ uri: string; key: string } | null>(null);
  const [candidates, setCandidates] = useState<MasjidNearbyResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<MasjidSubmissionFormValues>({
    resolver: zodResolver(masjidSubmissionSchema),
    defaultValues: { name: "", address: "" },
  });
  const upload = useUploadSubmissionPhoto();
  const submit = useSubmitMasjid();
  // Guards against a double-tap firing during react-hook-form's async validation
  // gap, before `checking`/`isPending` have re-rendered the button as disabled.
  const inFlight = useRef(false);

  const handleError = (e: unknown) => {
    if (e instanceof ApiError && e.status === 429) {
      const minutes = Math.max(1, Math.ceil((e.retryAfterSeconds ?? 3600) / 60));
      setErrorMsg(t("discovery.submit.rateLimited", { minutes }));
    } else {
      setErrorMsg(t("discovery.submit.error"));
    }
  };

  const pickPhoto = async () => {
    setErrorMsg(null);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      const uploaded = await upload.mutateAsync({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      setPhoto({ uri: uploaded.url, key: uploaded.photo_key });
    } catch {
      setErrorMsg(t("discovery.submit.photoError"));
    }
  };

  const doSubmit = async (values: MasjidSubmissionFormValues) => {
    try {
      await submit.mutateAsync({
        name: values.name.trim(),
        latitude: pin.lat,
        longitude: pin.lng,
        address: values.address?.trim() || null,
        photo_key: photo?.key ?? null,
      });
      setStep("success");
    } catch (e) {
      // Stay on the current step (form OR dedupe) and surface the error there.
      handleError(e);
    }
  };

  // On submit: dedupe-check first; show candidates if any, else submit straight away.
  const onSubmit = handleSubmit(async (values) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setErrorMsg(null);
    setChecking(true);
    try {
      const found = await fetchNearby(pin, undefined, DEDUPE_RADIUS_M);
      if (found.length > 0) {
        setCandidates(found);
        setStep("dedupe");
        return;
      }
      await doSubmit(values);
    } catch (e) {
      handleError(e);
    } finally {
      setChecking(false);
      inFlight.current = false;
    }
  });

  // "Add new" from the dedupe step — same double-tap guard, submits directly.
  const onAddNew = handleSubmit(async (values) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await doSubmit(values);
    } finally {
      inFlight.current = false;
    }
  });

  const busy = checking || submit.isPending;

  const back = () => (step === "dedupe" ? setStep("form") : router.back());

  // ---- Success ----------------------------------------------------------
  if (step === "success") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="check-circle" size={28} color={c.primary} />}
            title={t("discovery.success.title")}
            caption={t("discovery.success.caption")}
            action={
              <View className="w-full gap-2 pt-1">
                <Button
                  label={t("discovery.success.viewSubmissions")}
                  onPress={() => router.replace("/my-submissions")}
                />
                <Button
                  variant="text"
                  label={t("discovery.success.done")}
                  onPress={() => router.back()}
                />
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---- Dedupe -----------------------------------------------------------
  if (step === "dedupe") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <AppBar
          title={t("discovery.dedupe.title")}
          left={
            <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
              <Feather name="arrow-left" size={24} color={c["text-primary"]} />
            </Pressable>
          }
        />
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8">
          <View className="gap-1.5">
            <Text variant="title">{t("discovery.dedupe.heading")}</Text>
            <Text variant="body" className="text-content-secondary">
              {t("discovery.dedupe.caption")}
            </Text>
          </View>
          <View className="gap-2">
            {candidates.map((m) => (
              <MasjidRow
                key={m.masjid_id}
                name={m.name}
                meta={`${m.admin_region} · ${f.distance(m.distance_m)}`}
                thumb={<Feather name="home" size={24} color={c.primary} />}
                verified={
                  m.verified ? <Feather name="check-circle" size={14} color={c.primary} /> : null
                }
                trailing={<Feather name="chevron-right" size={18} color={c["text-muted"]} />}
                onPress={() => router.replace({ pathname: "/masjid/[id]", params: { id: m.masjid_id } })}
              />
            ))}
          </View>
        </ScrollView>
        <View className="gap-2 border-t border-border bg-surface px-4 pb-2 pt-3">
          {errorMsg ? <Text variant="caption" className="text-error">{errorMsg}</Text> : null}
          <Button
            label={t("discovery.dedupe.addNew")}
            disabled={submit.isPending}
            onPress={() => void onAddNew()}
          />
          <Button variant="text" label={t("discovery.dedupe.back")} onPress={back} />
        </View>
      </SafeAreaView>
    );
  }

  // ---- Form -------------------------------------------------------------
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("discovery.submit.title")}
        left={
          <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-md px-4 py-3 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="overflow-hidden rounded-md border border-border" style={{ height: 200 }}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: pin.lat,
                longitude: pin.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e) =>
                setPin({
                  lat: e.nativeEvent.coordinate.latitude,
                  lng: e.nativeEvent.coordinate.longitude,
                })
              }
            >
              <Marker
                coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                draggable
                pinColor={Colors.primary}
                onDragEnd={(e) =>
                  setPin({
                    lat: e.nativeEvent.coordinate.latitude,
                    lng: e.nativeEvent.coordinate.longitude,
                  })
                }
              />
            </MapView>
          </View>
          <Banner
            variant="info"
            icon={<Feather name="map-pin" size={15} color={c.primary} />}
            message={t("discovery.submit.pinHint")}
          />

          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <View className="gap-1">
                <Input
                  label={t("discovery.submit.nameLabel")}
                  placeholder={t("discovery.submit.namePlaceholder")}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
                {fieldState.error ? (
                  <Text variant="caption" className="text-error">
                    {t(fieldState.error.message ?? "")}
                  </Text>
                ) : null}
              </View>
            )}
          />
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                label={t("discovery.submit.addressLabel")}
                placeholder={t("discovery.submit.addressPlaceholder")}
                value={field.value ?? ""}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />

          {/* Photo (optional) */}
          {photo ? (
            <View className="flex-row items-center gap-3 rounded-md border border-border bg-surface p-3">
              <Image source={{ uri: photo.uri }} style={{ width: 56, height: 56, borderRadius: 8 }} contentFit="cover" />
              <Pressable className="flex-row items-center gap-2" onPress={() => void pickPhoto()}>
                <Feather name="refresh-cw" size={16} color={c["text-secondary"]} />
                <Text variant="caption" className="font-medium text-content-secondary">
                  {t("discovery.submit.changePhoto")}
                </Text>
              </Pressable>
              <View className="flex-1" />
              <Pressable hitSlop={10} onPress={() => setPhoto(null)} accessibilityLabel={t("discovery.submit.removePhoto")}>
                <Feather name="x" size={18} color={c["text-muted"]} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={upload.isPending}
              onPress={() => void pickPhoto()}
              className="flex-row items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface py-5"
            >
              {upload.isPending ? (
                <ActivityIndicator color={c.primary} />
              ) : (
                <Feather name="image" size={18} color={c["text-secondary"]} />
              )}
              <Text variant="caption" className="font-medium text-content-secondary">
                {upload.isPending ? t("discovery.submit.uploading") : t("discovery.submit.addPhoto")}
              </Text>
            </Pressable>
          )}

          <Banner
            variant="warning"
            icon={<Feather name="shield" size={15} color="#8A6A1F" />}
            message={t("discovery.submit.reviewNote")}
          />
          {errorMsg ? <Text variant="caption" className="text-error">{errorMsg}</Text> : null}
        </ScrollView>
        <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button
            label={busy ? t("discovery.submit.submitting") : t("discovery.submit.submit")}
            disabled={busy || upload.isPending}
            onPress={() => void onSubmit()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
