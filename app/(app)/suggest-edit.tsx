import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, Input, Text } from "@/components";
import { useMasjid } from "@/hooks/useMasjid";
import { useSuggestEdit } from "@/hooks/useSuggestEdit";
import { ApiError } from "@/lib/api/errors";
import type { MasjidResponse } from "@/lib/masjids/types";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

/** The masjid's current value for a field, for the "currently in the app" card
 *  (design 31). Returns null when there's nothing concrete to echo back. */
function currentFieldValue(key: string, m: MasjidResponse | undefined): string | null {
  if (!m) return null;
  switch (key) {
    case "name":
      return m.name || null;
    case "address":
      return m.address || m.admin_region || null;
    case "imam":
      return m.facilities?.imam_name || null;
    case "contact":
      return m.contact?.phone || m.contact?.whatsapp || m.contact?.email || null;
    case "capacity": {
      const f = m.facilities;
      const parts = [f?.capacity_male, f?.capacity_female, f?.parking_capacity];
      return parts.some((n) => n != null) ? parts.filter((n) => n != null).join(" · ") : null;
    }
    default:
      return null;
  }
}

const MIN_DESC = 10;

/** Fixed field vocabulary → the report model's `field_name` (PRD contract). */
const FIELDS: { key: string; labelKey: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "name", labelKey: "masjid.suggestEdit.fields.name", icon: "type" },
  { key: "address", labelKey: "masjid.suggestEdit.fields.address", icon: "map-pin" },
  { key: "prayer_times", labelKey: "masjid.suggestEdit.fields.prayerTimes", icon: "clock" },
  { key: "facilities", labelKey: "masjid.suggestEdit.fields.facilities", icon: "grid" },
  { key: "capacity", labelKey: "masjid.suggestEdit.fields.capacity", icon: "users" },
  { key: "imam", labelKey: "masjid.suggestEdit.fields.imam", icon: "user" },
  { key: "contact", labelKey: "masjid.suggestEdit.fields.contact", icon: "phone" },
  { key: "photos", labelKey: "masjid.suggestEdit.fields.photos", icon: "image" },
  { key: "other", labelKey: "masjid.suggestEdit.fields.other", icon: "more-horizontal" },
];

type Step = "field" | "describe" | "sent";

/** 30–31 Suggest an Edit — field picker → describe → sent. Open to guests (no gate). */
export default function SuggestEditScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { masjidId } = useLocalSearchParams<{ masjidId: string }>();
  const { isAuthenticated } = useAuth();
  const masjid = useMasjid(masjidId ?? "").data;

  const [step, setStep] = useState<Step>("field");
  const [field, setField] = useState<{ key: string; labelKey: string } | null>(null);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const report = useSuggestEdit(masjidId ?? "");
  const canSend = description.trim().length >= MIN_DESC && !report.isPending;

  const submit = async () => {
    if (!field || !canSend) return;
    setErrorMsg(null);
    try {
      await report.mutateAsync({
        field_name: field.key,
        description: description.trim(),
        reporter_email: !isAuthenticated && email.trim() ? email.trim() : null,
      });
      setStep("sent");
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setErrorMsg(t("masjid.suggestEdit.rateLimited"));
      } else {
        setErrorMsg(t("masjid.suggestEdit.error"));
      }
    }
  };

  const back = () => {
    if (step === "describe") setStep("field");
    else router.back();
  };

  // ---- Sent -------------------------------------------------------------
  if (step === "sent") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <AppBar
          title={t("masjid.suggestEdit.title")}
          left={
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
              <Feather name="arrow-left" size={24} color={c["text-primary"]} />
            </Pressable>
          }
        />
        <View className="flex-1 items-center justify-center gap-4 px-7">
          <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-primary-soft">
            <Feather name="check" size={40} color={c.primary} />
          </View>
          <Text className="text-center text-[22px] font-bold text-content-primary">
            {t("masjid.suggestEdit.sentTitle")}
          </Text>
          <Text className="max-w-[300px] text-center text-body font-regular text-content-secondary">
            {t("masjid.suggestEdit.sentCaption")}
          </Text>
        </View>
        <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button label={t("common.done")} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // ---- Field picker -----------------------------------------------------
  if (step === "field") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <AppBar
          title={t("masjid.suggestEdit.title")}
          left={
            <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
              <Feather name="arrow-left" size={24} color={c["text-primary"]} />
            </Pressable>
          }
        />
        <ScrollView contentContainerClassName="gap-2 px-4 py-3 pb-8">
          <View className="gap-1 pb-1">
            <Text variant="heading">{t("masjid.suggestEdit.intro")}</Text>
            <Text className="text-caption font-regular text-content-secondary">
              {t("masjid.suggestEdit.introSub")}
            </Text>
          </View>
          {!isAuthenticated ? (
            <View className="flex-row items-center gap-2 rounded-md bg-primary-soft px-3.5 py-3">
              <Feather name="lock" size={15} color={c.primary} />
              <Text className="flex-1 text-caption font-medium text-primary">
                {t("masjid.suggestEdit.guestNote")}
              </Text>
            </View>
          ) : null}
          {FIELDS.map((fld) => (
            <Pressable
              key={fld.key}
              accessibilityRole="button"
              onPress={() => {
                setField(fld);
                setStep("describe");
              }}
              className="flex-row items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5"
            >
              <Feather name={fld.icon} size={18} color={c.primary} />
              <Text className="flex-1 text-sm font-medium text-content-primary">{t(fld.labelKey)}</Text>
              <Feather name="chevron-right" size={18} color={c["text-muted"]} />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Describe ---------------------------------------------------------
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.suggestEdit.title")}
        left={
          <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8" keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between rounded-md bg-primary-soft px-3.5 py-2.5">
            <View className="flex-1 gap-0.5">
              <Text variant="micro" className="text-content-muted">
                {t("masjid.suggestEdit.fieldSelected")}
              </Text>
              <Text variant="body" numberOfLines={1} className="font-semibold text-primary">
                {field ? t(field.labelKey) : ""}
              </Text>
            </View>
            <Button variant="text" label={t("masjid.suggestEdit.changeField")} onPress={() => setStep("field")} />
          </View>

          {field && currentFieldValue(field.key, masjid) ? (
            <View className="gap-1 rounded-md border border-border bg-surface px-3.5 py-3">
              <Text variant="micro" className="text-content-muted">
                {t("masjid.suggestEdit.currentValueLabel")}
              </Text>
              <Text variant="body" className="font-medium text-content-primary">
                {currentFieldValue(field.key, masjid)}
              </Text>
            </View>
          ) : null}

          <View className="gap-1.5">
            <Text className="text-caption font-medium text-content-secondary">
              {t("masjid.suggestEdit.describeLabel")}
            </Text>
            <View className="rounded-md border border-border bg-surface px-4 py-3">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={t("masjid.suggestEdit.describePlaceholder")}
                placeholderTextColor={c["text-muted"]}
                multiline
                maxLength={300}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
                className="font-regular text-body text-content-primary"
              />
            </View>
            <Text className="text-right text-[12px] font-regular text-content-muted">
              {`${description.length}/300`}
            </Text>
          </View>

          {!isAuthenticated ? (
            <Input
              label={t("masjid.suggestEdit.emailLabel")}
              placeholder={t("masjid.suggestEdit.emailPlaceholder")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          ) : null}

          <Text className="text-[12px] font-regular text-content-muted">
            {t("masjid.suggestEdit.note")}
          </Text>
          {errorMsg ? <Text className="text-caption text-error">{errorMsg}</Text> : null}
        </ScrollView>

        <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button
            label={report.isPending ? t("masjid.suggestEdit.submitting") : t("masjid.suggestEdit.submit")}
            disabled={!canSend}
            leftIcon={
              report.isPending ? (
                <ActivityIndicator color={c["on-inverse"]} size="small" />
              ) : (
                <Feather name="send" size={16} color={c["on-inverse"]} />
              )
            }
            onPress={() => void submit()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
