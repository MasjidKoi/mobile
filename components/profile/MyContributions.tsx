import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
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
import { useMyPhotoSubmissions } from "@/hooks/useMyPhotoSubmissions";
import { useMyQuestions } from "@/hooks/useMyQuestions";
import { useFormat } from "@/lib/i18n/format";
import type {
  CommunityPhotoSubmission,
  MyQuestion,
  PhotoStatus,
  QuestionStatus,
} from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

const PHOTO_STATUS_ICON: Record<PhotoStatus, keyof typeof Feather.glyphMap> = {
  pending: "clock",
  approved: "check-circle",
  rejected: "x-circle",
};

const QUESTION_STATUS_TONE: Record<QuestionStatus, StatusTone> = {
  pending: "pending",
  answered: "approved",
  rejected: "rejected",
};

const QUESTION_STATUS_ICON: Record<QuestionStatus, keyof typeof Feather.glyphMap> = {
  pending: "clock",
  answered: "check-circle",
  rejected: "x-circle",
};

type Tab = "photos" | "questions";

/**
 * 32–33 "My contributions" — one screen, two in-place tabs (photos / questions).
 * Both routes render this with a different `initialTab`; switching tabs swaps the
 * list in place (no navigation), matching the design's segmented control.
 */
export function MyContributions({ initialTab }: { initialTab: Tab }) {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);

  const photos = useMyPhotoSubmissions(isAuthenticated);
  const questions = useMyQuestions(isAuthenticated);

  const photoStatusColor: Record<PhotoStatus, string> = {
    pending: "#8A6A1F",
    approved: c.primary,
    rejected: c.error,
  };
  const questionStatusColor: Record<QuestionStatus, string> = {
    pending: "#8A6A1F",
    answered: c.primary,
    rejected: c.error,
  };

  const withCount = (label: string, n: number | undefined) =>
    n != null ? `${label} · ${f.number(n)}` : label;
  const tabs: SegmentedControlOption[] = [
    { key: "photos", label: withCount(t("masjid.contribute.tabs.photos"), photos.data?.length) },
    {
      key: "questions",
      label: withCount(t("masjid.contribute.tabs.questions"), questions.data?.length),
    },
  ];

  const renderPhoto = (p: CommunityPhotoSubmission) => (
    <Pressable
      key={p.photo_id}
      accessibilityRole="imagebutton"
      onPress={() =>
        router.push({ pathname: "/gallery", params: { masjidId: p.masjid_id, url: p.url } })
      }
      className="flex-row items-center gap-3 rounded-md border border-border bg-surface p-3"
    >
      <Image source={{ uri: p.url }} style={{ width: 56, height: 56, borderRadius: 8 }} contentFit="cover" />
      <View className="flex-1 gap-1.5">
        {p.masjid_name ? (
          <Text variant="body" numberOfLines={1} className="font-semibold">
            {p.masjid_name}
          </Text>
        ) : null}
        <Text variant="caption" className="text-content-secondary">
          {t("masjid.contribute.submittedAt", { time: f.fromNow(new Date(p.created_at)) })}
        </Text>
        <StatusBadge
          tone={p.status as StatusTone}
          label={t(`masjid.contribute.photo.status.${p.status}`)}
          icon={<Feather name={PHOTO_STATUS_ICON[p.status]} size={12} color={photoStatusColor[p.status]} />}
        />
        {p.status === "approved" ? (
          <Text variant="caption" className="font-medium text-primary">
            {t("masjid.contribute.photo.visibleInProfile")}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );

  const renderQuestion = (q: MyQuestion) => (
    <View key={q.question_id} className="gap-2 rounded-md border border-border bg-surface p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-2">
          <Feather name="message-circle" size={16} color={c["text-muted"]} style={{ marginTop: 2 }} />
          <Text variant="body" numberOfLines={3} className="flex-1 font-semibold">
            {q.question}
          </Text>
        </View>
        <StatusBadge
          tone={QUESTION_STATUS_TONE[q.status]}
          label={t(`masjid.contribute.question.status.${q.status}`)}
          icon={
            <Feather name={QUESTION_STATUS_ICON[q.status]} size={12} color={questionStatusColor[q.status]} />
          }
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
        {(q.masjid_name ? `${q.masjid_name} · ` : "") + f.fromNow(new Date(q.created_at))}
      </Text>
    </View>
  );

  const active = tab === "photos" ? photos : questions;
  const isEmpty = tab === "photos" ? (photos.data?.length ?? 0) === 0 : (questions.data?.length ?? 0) === 0;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.contribute.myContributions")}
        left={
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      {!isAuthenticated ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="user" size={26} color={c.primary} />}
            title={t("profileTab.guest.title")}
            caption={t("profileTab.guest.subtitle")}
            action={<Button label={t("profileTab.guest.cta")} onPress={() => router.push("/email")} />}
          />
        </View>
      ) : (
        <>
          <View className="px-4 pt-2">
            <SegmentedControl options={tabs} value={tab} onChange={(k) => setTab(k as Tab)} />
          </View>
          {active.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : isEmpty ? (
            <View className="flex-1 items-center justify-center px-lg">
              <EmptyState
                icon={
                  <Feather name={tab === "photos" ? "camera" : "help-circle"} size={26} color={c.primary} />
                }
                title={t(
                  tab === "photos"
                    ? "masjid.contribute.myPhotos.emptyTitle"
                    : "masjid.contribute.myQuestions.emptyTitle",
                )}
                caption={t(
                  tab === "photos"
                    ? "masjid.contribute.myPhotos.emptyCaption"
                    : "masjid.contribute.myQuestions.emptyCaption",
                )}
              />
            </View>
          ) : (
            <ScrollView
              contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
              refreshControl={
                <RefreshControl
                  refreshing={active.isRefetching}
                  onRefresh={() => void active.refetch()}
                  tintColor={c.primary}
                />
              }
            >
              {tab === "photos"
                ? (photos.data ?? []).map(renderPhoto)
                : (questions.data ?? []).map(renderQuestion)}
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

export default MyContributions;
