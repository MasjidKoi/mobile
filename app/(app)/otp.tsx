import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, OtpInput, Text } from "@/components";
import { useRequestOtp, useVerifyOtp } from "@/hooks/useOtp";
import { useResendCountdown } from "@/hooks/useResendCountdown";
import { ApiError } from "@/lib/api/errors";
import { OTP_LENGTH } from "@/lib/forms/schemas";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** 07 OTP Entry + 08 OTP Error — verify the emailed code, with resend + errors. */
export default function OtpEntry() {
  const { t } = useTranslation();
  const { number } = useFormat();
  const c = useColors();
  const { login } = useAuth();
  const { completeAuthFlow } = useLoginGate();
  const params = useLocalSearchParams<{ email: string; cooldown?: string }>();
  const email = params.email ?? "";
  const { seconds, restart } = useResendCountdown(email, Number(params.cooldown ?? 60));

  const [code, setCode] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number | null>(null);
  const verify = useVerifyOtp();
  const requestOtp = useRequestOtp();

  const onVerify = async () => {
    if (code.length !== OTP_LENGTH || verify.isPending) return;
    setErrorKey(null);
    try {
      const tokens = await verify.mutateAsync({ email, code });
      await login(tokens);
      if (tokens.is_new_user) {
        router.replace("/profile-setup");
      } else {
        completeAuthFlow();
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 429 || e.code === "too_many_attempts")) {
        setErrorKey("auth.otp.errorTooMany");
      } else if (e instanceof ApiError && e.code === "code_expired") {
        setErrorKey("auth.otp.errorExpired");
      } else if (e instanceof ApiError && e.code === "invalid_code") {
        setAttempts(e.attemptsRemaining);
        setErrorKey(
          e.attemptsRemaining != null ? "auth.otp.errorInvalid" : "auth.otp.errorInvalidNoCount",
        );
      } else {
        setErrorKey("auth.otp.errorGeneric");
      }
      setCode("");
    }
  };

  const onResend = async () => {
    if (seconds > 0 || requestOtp.isPending) return;
    try {
      const res = await requestOtp.mutateAsync(email);
      await restart(res.retry_after_seconds ?? 60);
      setErrorKey(null);
      setAttempts(null);
      setCode("");
    } catch {
      // Stay put — the user can tap resend again.
    }
  };

  const errorText = errorKey
    ? attempts != null && errorKey === "auth.otp.errorInvalid"
      ? t(errorKey, { count: number(attempts) })
      : t(errorKey)
    : null;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <AppBar title={t("auth.otp.appBar")} className="bg-surface" />
      <View className="flex-1 px-lg pt-md">
        <View className="gap-2.5">
          <Text variant="title" className="text-[24px] font-bold">
            {t("auth.otp.title")}
          </Text>
          <Text variant="body" className="text-content-secondary">
            {t("auth.otp.subtitle", { email })}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace({ pathname: "/email", params: { email } })}
            className="flex-row items-center gap-1.5 self-start py-1"
          >
            <Feather name="edit-2" size={14} color={c.primary} />
            <Text variant="caption" className="font-semibold text-primary">
              {t("auth.otp.editEmail")}
            </Text>
          </Pressable>

          <View className="pt-2">
            <OtpInput value={code} onChangeText={setCode} length={OTP_LENGTH} autoFocus error={!!errorKey} />
          </View>

          {errorText ? (
            <View className="flex-row items-center gap-1.5 pt-1">
              <Feather name="alert-circle" size={16} color={c.error} />
              <Text variant="caption" className="text-error">
                {errorText}
              </Text>
            </View>
          ) : null}

          <View className="pt-2">
            {seconds > 0 ? (
              <Text variant="caption" className="font-semibold text-content-muted">
                {t("auth.otp.resendIn", { seconds: number(seconds) })}
              </Text>
            ) : (
              <Pressable accessibilityRole="button" onPress={onResend} hitSlop={8} className="self-start">
                <Text variant="caption" className="font-semibold text-primary">
                  {t("auth.otp.resend")}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="flex-1" />

        <Button
          label={t("auth.otp.verify")}
          onPress={onVerify}
          disabled={code.length !== OTP_LENGTH || verify.isPending}
          className="mb-3"
        />
      </View>
    </SafeAreaView>
  );
}
