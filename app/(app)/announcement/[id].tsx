import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, EmptyState, Text } from "@/components";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { isOfflineQuery } from "@/lib/api/errors";
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
  const offline = isOfflineQuery(q);

  const back = <BackButton onPress={() => router.back()} />;

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
            onPress={() => router.push({ pathname: "/masjid/[id]", params: { id: a.masjid_id } })}
            className="flex-row items-center gap-2.5"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
              <Feather name="home" size={16} color={c.primary} />
            </View>
            <View className="flex-1">
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
