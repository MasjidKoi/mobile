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

import { AppBar, Button, EmptyState, Input, Text } from "@/components";
import { useSuggestEdit } from "@/hooks/useSuggestEdit";
import { ApiError } from "@/lib/api/errors";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

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
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="check-circle" size={26} color={c.primary} />}
            title={t("masjid.suggestEdit.sentTitle")}
            caption={t("masjid.suggestEdit.sentCaption")}
            action={<Button label={t("common.done")} onPress={() => router.back()} />}
          />
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
          <Text className="pb-1 text-caption font-regular text-content-secondary">
            {t("masjid.suggestEdit.intro")}
          </Text>
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
        title={field ? t(field.labelKey) : t("masjid.suggestEdit.title")}
        left={
          <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8" keyboardShouldPersistTaps="handled">
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
                maxLength={1000}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
                className="font-regular text-body text-content-primary"
              />
            </View>
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
            leftIcon={report.isPending ? <ActivityIndicator color={c["on-inverse"]} size="small" /> : undefined}
            onPress={() => void submit()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
