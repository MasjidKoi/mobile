import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button, Card, SectionHeader, Text } from "@/components";
import type { QuestionPublic } from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";

/** Map the answerer's role to a localized attribution; unknown → generic "masjid". */
function attributionKey(role: string | null): string {
  if (role === "platform_admin") return "masjid.qna.answeredByNgo";
  return "masjid.qna.answeredByMasjid";
}

export type QnASectionProps = {
  questions: QuestionPublic[];
  onAsk: () => void;
};

/**
 * Q&A section (design 20): the masjid's *answered* questions as a public FAQ,
 * each attributed to the masjid or NGO, plus an "Ask a question" CTA. With no
 * answers yet it shows only the CTA + a "be the first" prompt — never a dead
 * "0 answers".
 */
export function QnASection({ questions, onAsk }: QnASectionProps) {
  const { t } = useTranslation();
  const c = useColors();

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("masjid.profile.qna")} />

      {questions.length === 0 ? (
        <Text className="text-caption font-regular text-content-secondary">
          {t("masjid.qna.empty")}
        </Text>
      ) : (
        <View className="gap-2">
          {questions.map((q) => (
            <Card key={q.question_id}>
              <View className="gap-1.5 p-4">
                <Text className="text-sm font-semibold text-content-primary">{q.question}</Text>
                {q.answer ? (
                  <Text className="text-caption font-regular text-content-secondary">{q.answer}</Text>
                ) : null}
                <View className="flex-row items-center gap-1 pt-0.5">
                  <Feather name="check-circle" size={12} color={c.primary} />
                  <Text className="text-[11px] font-medium text-content-muted">
                    {t(attributionKey(q.answer_author_role))}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Button
        variant="secondary"
        label={t("masjid.qna.ask")}
        leftIcon={<Feather name="help-circle" size={16} color={c["text-primary"]} />}
        onPress={onAsk}
      />
    </View>
  );
}

export default QnASection;
