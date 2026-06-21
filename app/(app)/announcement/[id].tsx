import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, EmptyState, Text } from "@/components";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { useMasjid } from "@/hooks/useMasjid";
import { isOfflineQuery } from "@/lib/api/errors";
import { initials } from "@/lib/community/format";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 80 Announcement Detail — full announcement, reached from the feed. */
export default function AnnouncementDetailScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const params = useLocalSearchParams<{ id: string; masjidId: string }>();
  const announcementId = params.id;
  const masjidId = params.masjidId;

  const q = useAnnouncement(masjidId, announcementId);
  const a = q.data;
  const masjid = useMasjid(masjidId);
  const masjidName = masjid.data?.name ?? null;
  const offline = isOfflineQuery(q);

  const back = <BackButton onPress={() => router.back()} />;
  // navigate (not push): if this masjid is already on the stack, jump back to it
  // instead of stacking a duplicate profile.
  const goMasjid = () =>
    a ? router.navigate({ pathname: "/masjid/[id]", params: { id: a.masjid_id } }) : undefined;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("community.announcement.title")} left={back} />
      {q.isLoading && !a ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : !a ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name={offline ? "wifi-off" : "alert-circle"} size={26} color={c.primary} />}
            title={t(offline ? "community.announcement.offlineTitle" : "community.announcement.errorTitle")}
            caption={t("community.announcement.errorCaption")}
            action={<Button label={t("common.retry")} onPress={() => void q.refetch()} />}
          />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 py-4 pb-10">
          <Pressable
            accessibilityRole="button"
            onPress={goMasjid}
            className="flex-row items-center gap-2.5"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
              {masjidName ? (
                <Text className="text-caption font-bold text-primary">{initials(masjidName, 1)}</Text>
              ) : (
                <Feather name="home" size={16} color={c.primary} />
              )}
            </View>
            <View className="flex-1">
              {masjidName ? (
                <Text variant="body" numberOfLines={1} className="font-semibold">
                  {masjidName}
                </Text>
              ) : null}
              {a.published_at ? (
                <Text variant="caption" className="text-content-muted">
                  {f.date(new Date(a.published_at))}
                </Text>
              ) : null}
            </View>
            <Feather name="chevron-right" size={18} color={c["text-muted"]} />
          </Pressable>

          <Text className="text-[22px] font-bold leading-7 text-content-primary">{a.title}</Text>
          <Text className="text-body font-regular leading-6 text-content-secondary">{a.body}</Text>

          <Button
            variant="secondary"
            label={t("community.announcement.viewMasjid")}
            leftIcon={<Feather name="home" size={16} color={c["text-primary"]} />}
            onPress={goMasjid}
            className="mt-2"
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
