import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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
import { useMyPhotoSubmissions } from "@/hooks/useMyPhotoSubmissions";
import { useFormat } from "@/lib/i18n/format";
import type { CommunityPhotoSubmission, PhotoStatus } from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

const STATUS_ICON: Record<PhotoStatus, keyof typeof Feather.glyphMap> = {
  pending: "clock",
  approved: "check-circle",
  rejected: "x-circle",
};

/** 32 My Photo Submissions — the user's community photos with moderation status. */
export default function MyPhotoSubmissionsScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { isAuthenticated } = useAuth();
  const photos = useMyPhotoSubmissions(isAuthenticated);
  const data = photos.data ?? [];

  const statusColor: Record<PhotoStatus, string> = {
    pending: "#8A6A1F",
    approved: c.primary,
    rejected: c.error,
  };

  const renderRow = (p: CommunityPhotoSubmission) => (
    <View key={p.photo_id} className="flex-row items-center gap-3 rounded-md border border-border bg-surface p-3">
      <Image source={{ uri: p.url }} style={{ width: 56, height: 56, borderRadius: 8 }} contentFit="cover" />
      <View className="flex-1 gap-1.5">
        <StatusBadge
          tone={p.status as StatusTone}
          label={t(`masjid.contribute.photo.status.${p.status}`)}
          icon={<Feather name={STATUS_ICON[p.status]} size={12} color={statusColor[p.status]} />}
        />
        <Text variant="caption" className="text-content-secondary">
          {f.date(new Date(p.created_at))}
        </Text>
        {p.status === "approved" ? (
          <Text variant="caption" className="font-medium text-primary">
            {t("masjid.contribute.photo.visibleInProfile")}
          </Text>
        ) : null}
      </View>
    </View>
  );

  const tabs: SegmentedControlOption[] = [
    { key: "photos", label: t("masjid.contribute.tabs.photos") },
    { key: "questions", label: t("masjid.contribute.tabs.questions") },
  ];

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.contribute.myPhotos.title")}
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
            value="photos"
            onChange={(k) => {
              if (k === "questions") router.replace("/my-questions");
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
      ) : photos.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="camera" size={26} color={c.primary} />}
            title={t("masjid.contribute.myPhotos.emptyTitle")}
            caption={t("masjid.contribute.myPhotos.emptyCaption")}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={photos.isRefetching}
              onRefresh={() => void photos.refetch()}
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
