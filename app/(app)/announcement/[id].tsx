import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, EmptyState, Text } from "@/components";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { useMasjid } from "@/hooks/useMasjid";
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
  const masjid = useMasjid(masjidId);
  const masjidName = masjid.data?.name ?? null;
  const region = masjid.data?.admin_region ?? null;
  const verified = masjid.data?.verified ?? false;
  const offline = isOfflineQuery(q);

  const back = <BackButton onPress={() => router.back()} />;
  // navigate (not push): if this masjid is already on the stack, jump back to it
  // instead of stacking a duplicate profile.
  const goMasjid = () =>
    a ? router.navigate({ pathname: "/masjid/[id]", params: { id: a.masjid_id } }) : undefined;

  const onShare = () => {
    if (!a) return;
    void Share.share({ message: `${a.title}\n\n${a.body}` });
  };
  const share = a ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("common.share")}
      onPress={onShare}
      hitSlop={10}
    >
      <Feather name="share-2" size={20} color={c["text-secondary"]} />
    </Pressable>
  ) : undefined;

  // Relative time + region meta, e.g. "3 hr ago · Dhaka".
  const meta = a?.published_at
    ? [f.fromNow(new Date(a.published_at)), region].filter(Boolean).join(" · ")
    : (region ?? "");

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("community.announcement.title")} left={back} right={share} />
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
        <>
          <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 py-4 pb-6">
            {/* Masjid header card — tappable through to the profile. */}
            <Pressable
              accessibilityRole="button"
              onPress={goMasjid}
              className="flex-row items-center gap-2.5 rounded-md border border-border bg-surface p-3"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
                <Feather name="home" size={18} color={c.primary} />
              </View>
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-1.5">
                  {masjidName ? (
                    <Text variant="body" numberOfLines={1} className="font-semibold">
                      {masjidName}
                    </Text>
                  ) : null}
                  {verified ? (
                    <Feather name="check-circle" size={14} color={c.primary} />
                  ) : null}
                </View>
                {meta ? (
                  <Text variant="caption" className="text-content-muted">
                    {meta}
                  </Text>
                ) : null}
              </View>
              <Feather name="chevron-right" size={18} color={c["text-muted"]} />
            </Pressable>

            <Text variant="display" style={{ fontSize: 22, lineHeight: 30 }}>
              {a.title}
            </Text>
            <Text className="text-body font-regular leading-6 text-content-secondary">{a.body}</Text>
          </ScrollView>

          {/* Pinned bottom action (design 80). */}
          <View className="px-4 pb-6 pt-2">
            <Button
              variant="secondary"
              label={t("community.announcement.viewMasjid")}
              leftIcon={<Feather name="home" size={16} color={c["text-primary"]} />}
              onPress={goMasjid}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
