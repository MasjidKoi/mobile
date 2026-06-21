import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppBar,
  Button,
  EmptyState,
  SegmentedControl,
  type SegmentedControlOption,
  StatusBadge,
  Text,
} from "@/components";
import type { StatusTone } from "@/components/StatusBadge";
import { useMyQuestions } from "@/hooks/useMyQuestions";
import { useFormat } from "@/lib/i18n/format";
import type { MyQuestion, QuestionStatus } from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

/** Question status → badge tone (answered reuses the "approved" green). */
const STATUS_TONE: Record<QuestionStatus, StatusTone> = {
  pending: "pending",
  answered: "approved",
  rejected: "rejected",
};

const STATUS_ICON: Record<QuestionStatus, keyof typeof Feather.glyphMap> = {
  pending: "clock",
  answered: "check-circle",
  rejected: "x-circle",
};

/** 33 My Questions — the user's asked questions; answered ones show the answer (push deep-link target). */
export default function MyQuestionsScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { isAuthenticated } = useAuth();
  const questions = useMyQuestions(isAuthenticated);
  const data = questions.data ?? [];

  const statusColor: Record<QuestionStatus, string> = {
    pending: "#8A6A1F",
    answered: c.primary,
    rejected: c.error,
  };

  const tabs: SegmentedControlOption[] = [
    { key: "photos", label: t("masjid.contribute.tabs.photos") },
    { key: "questions", label: t("masjid.contribute.tabs.questions") },
  ];

  const renderRow = (q: MyQuestion) => (
    <View key={q.question_id} className="gap-2 rounded-md border border-border bg-surface p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-2">
          <Feather name="message-circle" size={16} color={c["text-muted"]} style={{ marginTop: 2 }} />
          <Text variant="body" numberOfLines={3} className="flex-1 font-semibold">
            {q.question}
          </Text>
        </View>
        <StatusBadge
          tone={STATUS_TONE[q.status]}
          label={t(`masjid.contribute.question.status.${q.status}`)}
          icon={<Feather name={STATUS_ICON[q.status]} size={12} color={statusColor[q.status]} />}
        />
      </View>
      {q.status === "answered" && q.answer ? (
        <View className="gap-1 rounded-sm bg-primary-soft px-3 py-2">
          <Text variant="caption" className="font-medium text-primary">
            {t("masjid.contribute.question.answerLabel")}
          </Text>
          <Text variant="caption" className="text-content-secondary">
            {q.answer}
          </Text>
        </View>
      ) : null}
      <Text variant="caption" className="text-content-muted">
        {f.date(new Date(q.created_at))}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.contribute.myQuestions.title")}
        left={
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      {isAuthenticated ? (
        <View className="px-4 pt-2">
          <SegmentedControl
            options={tabs}
            value="questions"
            onChange={(k) => {
              if (k === "photos") router.replace("/my-photo-submissions");
            }}
          />
        </View>
      ) : null}
      {!isAuthenticated ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="user" size={26} color={c.primary} />}
            title={t("profileTab.guest.title")}
            caption={t("profileTab.guest.subtitle")}
            action={<Button label={t("profileTab.guest.cta")} onPress={() => router.push("/email")} />}
          />
        </View>
      ) : questions.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="help-circle" size={26} color={c.primary} />}
            title={t("masjid.contribute.myQuestions.emptyTitle")}
            caption={t("masjid.contribute.myQuestions.emptyCaption")}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={questions.isRefetching}
              onRefresh={() => void questions.refetch()}
              tintColor={c.primary}
            />
          }
        >
          {data.map(renderRow)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
