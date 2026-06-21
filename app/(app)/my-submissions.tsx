import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, EmptyState, StatusBadge, Text } from "@/components";
import { type StatusTone } from "@/components/StatusBadge";
import { useMySubmissions } from "@/hooks/useMySubmissions";
import { useFormat } from "@/lib/i18n/format";
import type { MasjidSubmissionResponse, SubmissionStatus } from "@/lib/masjids/submissions";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

const STATUS_ICON: Record<SubmissionStatus, keyof typeof Feather.glyphMap> = {
  pending: "clock",
  approved: "check-circle",
  rejected: "x-circle",
};

/** 19 My Submissions — the user's contributed masjids with review status. */
export default function MySubmissionsScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { isAuthenticated } = useAuth();
  const submissions = useMySubmissions(isAuthenticated);

  const data = submissions.data ?? [];

  const statusColor: Record<SubmissionStatus, string> = {
    pending: "#8A6A1F",
    approved: c.primary,
    rejected: c.error,
  };

  const renderRow = (s: MasjidSubmissionResponse) => (
    <View key={s.submission_id} className="gap-1.5 rounded-md border border-border bg-surface p-4">
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="body" numberOfLines={2} className="flex-1 font-semibold">
          {s.name}
        </Text>
        <StatusBadge
          tone={s.status as StatusTone}
          label={t(`discovery.mySubmissions.status.${s.status}`)}
          icon={<Feather name={STATUS_ICON[s.status]} size={12} color={statusColor[s.status]} />}
        />
      </View>
      <Text variant="caption" className="text-content-secondary">
        {f.date(new Date(s.created_at))}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("discovery.mySubmissions.title")}
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />

      {submissions.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="inbox" size={26} color={c.primary} />}
            title={t("discovery.mySubmissions.empty.title")}
            caption={t("discovery.mySubmissions.empty.caption")}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={submissions.isRefetching}
              onRefresh={() => void submissions.refetch()}
              tintColor={c.primary}
            />
          }
        >
          {data.map(renderRow)}
          <View className="pt-1">
            <Banner
              variant="info"
              icon={<Feather name="info" size={15} color={c.primary} />}
              message={t("discovery.mySubmissions.note")}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
