import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, Input, Text } from "@/components";
import { useRequestOtp } from "@/hooks/useOtp";
import { emailSchema } from "@/lib/forms/schemas";
import { useColors } from "@/lib/theme/useColors";

/** 06 Email Entry — request an OTP. New emails create the account implicitly. */
export default function EmailEntry() {
  const { t } = useTranslation();
  const c = useColors();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const requestOtp = useRequestOtp();

  const onSubmit = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "validation.email_invalid");
      return;
    }
    setError(null);
    try {
      const res = await requestOtp.mutateAsync(parsed.data);
      router.replace({
        pathname: "/otp",
        params: { email: parsed.data, cooldown: String(res.retry_after_seconds ?? 60) },
      });
    } catch {
      setError("auth.email.sendError");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <AppBar title={t("auth.appBarLogin")} className="bg-surface" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-lg pt-md">
          <View className="gap-2.5">
            <Text variant="title" className="text-[24px] font-bold">
              {t("auth.email.title")}
            </Text>
            <Text variant="body" className="text-content-secondary">
              {t("auth.email.subtitle")}
            </Text>
            <View className="pt-2">
              <Input
                label={t("auth.email.label")}
                leftIcon={<Feather name="mail" size={18} color={c["text-muted"]} />}
                placeholder={t("auth.email.placeholder")}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                autoFocus
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                accessibilityLabel={t("auth.email.label")}
              />
            </View>
            {error ? (
              <Text variant="caption" className="text-error">
                {t(error)}
              </Text>
            ) : null}
            <Text variant="caption" className="text-content-muted">
              {t("auth.email.implicitSignup")}
            </Text>
          </View>

          <View className="flex-1" />

          <Button
            label={t("auth.email.sendCode")}
            onPress={onSubmit}
            disabled={requestOtp.isPending}
            className="mb-3"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
