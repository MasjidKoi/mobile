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

import { AppBar, Button, Card, Text } from "@/components";
import { useAnsweredQuestions } from "@/hooks/useAnsweredQuestions";
import { useAskQuestion } from "@/hooks/useAskQuestion";
import { useMasjid } from "@/hooks/useMasjid";
import { ApiError } from "@/lib/api/errors";
import { useColors } from "@/lib/theme/useColors";

const MIN = 10;
const MAX = 200;

/** 28–29 Ask a Question — answered-questions-first deflection → input → sent. 🔒 gated. */
export default function AskQuestionScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { masjidId } = useLocalSearchParams<{ masjidId: string }>();

  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const answered = useAnsweredQuestions(masjidId).data?.items ?? [];
  const masjid = useMasjid(masjidId);
  const ask = useAskQuestion(masjidId ?? "");

  const trimmed = text.trim();
  const canSend = trimmed.length >= MIN && trimmed.length <= MAX && !ask.isPending;

  const submit = async () => {
    if (!canSend) return;
    setErrorMsg(null);
    try {
      await ask.mutateAsync(trimmed);
      setSent(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setErrorMsg(t("masjid.contribute.question.rateLimited"));
      } else {
        setErrorMsg(t("masjid.contribute.question.error"));
      }
    }
  };

  if (sent) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <AppBar
          title={t("masjid.contribute.question.title")}
          left={
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
              <Feather name="arrow-left" size={24} color={c["text-primary"]} />
            </Pressable>
          }
        />
        <View className="flex-1 items-center justify-center gap-4 px-7">
          <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-primary-soft">
            <Feather name="send" size={36} color={c.primary} />
          </View>
          <Text className="text-center text-[22px] font-bold text-content-primary">
            {t("masjid.contribute.question.sentTitle")}
          </Text>
          <Text className="max-w-[300px] text-center text-body font-regular text-content-secondary">
            {t("masjid.contribute.question.sentCaption")}
          </Text>
          {text.trim() ? (
            <View className="w-full gap-2 rounded-md border border-border bg-surface p-3.5">
              <View className="flex-row items-start gap-2">
                <Feather name="message-circle" size={16} color={c["text-muted"]} style={{ marginTop: 2 }} />
                <Text variant="caption" numberOfLines={3} className="flex-1 text-content-primary">
                  {text.trim()}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 self-start rounded-full bg-[#F5EEDC] px-2.5 py-1">
                <Feather name="clock" size={12} color="#8A6A1F" />
                <Text className="text-micro font-semibold text-[#8A6A1F]">
                  {t("masjid.contribute.question.status.pending")}
                </Text>
              </View>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1.5">
            <Feather name="bell" size={15} color={c["text-muted"]} />
            <Text className="text-caption text-content-muted">
              {t("masjid.contribute.question.pushNote")}
            </Text>
          </View>
        </View>
        <View className="gap-2 border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button label={t("masjid.contribute.backToProfile")} onPress={() => router.back()} />
          <Button
            variant="text"
            label={t("masjid.contribute.myQuestions.cta")}
            onPress={() => router.replace("/my-questions")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.contribute.question.title")}
        left={
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8" keyboardShouldPersistTaps="handled">
          {masjid.data?.name ? (
            <View className="flex-row items-center gap-2.5 rounded-md border border-border bg-surface px-3.5 py-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                <Feather name="home" size={16} color={c.primary} />
              </View>
              <View className="flex-1">
                <Text variant="body" numberOfLines={1} className="font-semibold">
                  {masjid.data.name}
                </Text>
                {masjid.data.admin_region ? (
                  <Text variant="caption" className="text-content-secondary">
                    {masjid.data.admin_region}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {answered.length > 0 ? (
            <View className="gap-2">
              <Text className="text-caption font-medium text-content-secondary">
                {t("masjid.contribute.question.deflect")}
              </Text>
              {answered.slice(0, 3).map((q) => (
                <Card key={q.question_id}>
                  <View className="gap-1 p-3.5">
                    <Text className="text-caption font-semibold text-content-primary">{q.question}</Text>
                    {q.answer ? (
                      <Text numberOfLines={2} className="text-[12px] font-regular text-content-secondary">
                        {q.answer}
                      </Text>
                    ) : null}
                  </View>
                </Card>
              ))}
            </View>
          ) : null}

          <View className="gap-1.5">
            <Text className="text-caption font-medium text-content-secondary">
              {t("masjid.contribute.question.label")}
            </Text>
            <View className="rounded-md border border-border bg-surface px-4 py-3">
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t("masjid.contribute.question.placeholder")}
                placeholderTextColor={c["text-muted"]}
                multiline
                maxLength={MAX}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
                className="font-regular text-body text-content-primary"
              />
            </View>
            <Text className="text-right text-[12px] font-regular text-content-muted">
              {`${trimmed.length}/${MAX}`}
            </Text>
          </View>

          <Text className="text-[12px] font-regular text-content-muted">
            {t("masjid.contribute.question.note")}
          </Text>
          {errorMsg ? <Text className="text-caption text-error">{errorMsg}</Text> : null}
        </ScrollView>

        <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button
            label={ask.isPending ? t("masjid.contribute.question.sending") : t("masjid.contribute.question.send")}
            disabled={!canSend}
            leftIcon={
              ask.isPending ? (
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
