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

import { AppBar, Button, Card, EmptyState, Text } from "@/components";
import { useAnsweredQuestions } from "@/hooks/useAnsweredQuestions";
import { useAskQuestion } from "@/hooks/useAskQuestion";
import { ApiError } from "@/lib/api/errors";
import { useColors } from "@/lib/theme/useColors";

const MIN = 10;
const MAX = 1000;

/** 28–29 Ask a Question — answered-questions-first deflection → input → sent. 🔒 gated. */
export default function AskQuestionScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { masjidId } = useLocalSearchParams<{ masjidId: string }>();

  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const answered = useAnsweredQuestions(masjidId).data?.items ?? [];
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
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="send" size={26} color={c.primary} />}
            title={t("masjid.contribute.question.sentTitle")}
            caption={t("masjid.contribute.question.sentCaption")}
            action={
              <View className="w-full gap-2 pt-1">
                <Button
                  variant="secondary"
                  label={t("masjid.contribute.myQuestions.cta")}
                  onPress={() => router.replace("/my-questions")}
                />
                <Button variant="text" label={t("common.done")} onPress={() => router.back()} />
              </View>
            }
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
            leftIcon={ask.isPending ? <ActivityIndicator color={c["on-inverse"]} size="small" /> : undefined}
            onPress={() => void submit()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
