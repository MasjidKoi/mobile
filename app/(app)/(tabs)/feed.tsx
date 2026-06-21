import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AnnouncementCard,
  Banner,
  Button,
  CommunityEventCard,
  EmptyState,
  SegmentedControl,
  Text,
  type SegmentedControlOption,
} from "@/components";
import { useFeed } from "@/hooks/useFeed";
import { isOfflineQuery } from "@/lib/api/errors";
import { initials } from "@/lib/community/format";
import { feedEventToDetailParam } from "@/lib/events/types";
import type { FeedAnnouncementItem, FeedEventItem, FeedItem, FeedType } from "@/lib/feed/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

function feedKey(item: FeedItem): string {
  return item.kind === "announcement" ? `a-${item.announcement_id}` : `e-${item.event_id}`;
}

/** Feed tab — the followed-masjid feed (75 Announcements / 76 Events, with 77
 * Empty / 78 Guest / 79 Offline variants). */
export default function FeedTab() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useLoginGate();
  const [type, setType] = useState<FeedType>("announcements");

  const q = useFeed(type);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const offline = isOfflineQuery(q);

  const title = (
    <View className="py-1">
      <Text variant="display" className="text-[24px]">
        {t("feed.title")}
      </Text>
    </View>
  );

  // 78 Feed Guest — read-only surface still asks for login to populate a feed.
  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="px-4 pt-2">{title}</View>
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="user" size={28} color={c.primary} />}
            title={t("feed.guest.title")}
            caption={t("feed.guest.caption")}
            action={
              <Button
                label={t("feed.guest.cta")}
                className="mt-1"
                onPress={() => requireAuth(() => {}, "community")}
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const segments: SegmentedControlOption[] = [
    { key: "announcements", label: t("feed.tabs.announcements") },
    { key: "events", label: t("feed.tabs.events") },
  ];

  const renderAnnouncement = (item: FeedAnnouncementItem) => (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/announcement/[id]",
          params: { id: item.announcement_id, masjidId: item.masjid_id },
        })
      }
    >
      <AnnouncementCard
        masjid={item.masjid_name}
        time={f.date(new Date(item.published_at))}
        title={item.title}
        body={item.body.length > 160 ? `${item.body.slice(0, 160).trimEnd()}…` : item.body}
        avatar={<Text className="text-caption font-bold text-primary">{initials(item.masjid_name, 1)}</Text>}
      />
    </Pressable>
  );

  const renderEvent = (item: FeedEventItem) => (
    <CommunityEventCard
      eventDate={item.event_date}
      eventTime={item.event_time}
      title={item.title}
      location={item.location}
      attendees={item.attendee_count}
      masjidName={item.masjid_name}
      onPress={() =>
        router.push({
          pathname: "/event/[id]",
          // Pass the whole event (the backend has no single-event GET); the feed
          // omits `rsvp_enabled`, so `feedEventToDetailParam` assumes enabled.
          params: {
            id: item.event_id,
            masjidId: item.masjid_id,
            e: JSON.stringify(feedEventToDetailParam(item)),
          },
        })
      }
    />
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="gap-3 px-4 pb-1 pt-2">
        {title}
        <SegmentedControl options={segments} value={type} onChange={(k) => setType(k as FeedType)} />
        {offline ? (
          <Banner
            variant="warning"
            icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
            message={t("feed.offline")}
          />
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={feedKey}
        contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
        renderItem={({ item }) =>
          item.kind === "announcement" ? renderAnnouncement(item) : renderEvent(item)
        }
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching && !q.isFetchingNextPage}
            onRefresh={() => void q.refetch()}
            tintColor={c.primary}
          />
        }
        ListEmptyComponent={
          q.isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : offline ? null : (
            <View className="items-center px-6 py-12">
              <EmptyState
                icon={<Feather name="rss" size={26} color={c.primary} />}
                title={t(type === "events" ? "feed.empty.eventsTitle" : "feed.empty.announcementsTitle")}
                caption={t("feed.empty.caption")}
                action={
                  <Button
                    variant="text"
                    label={t("feed.empty.cta")}
                    onPress={() => router.push("/explore")}
                  />
                }
              />
            </View>
          )
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (q.hasNextPage && !q.isFetchingNextPage) void q.fetchNextPage();
        }}
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
