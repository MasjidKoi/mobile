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
  EventRsvpPill,
  SegmentedControl,
  type SegmentedControlOption,
} from "@/components";
import { useFeed } from "@/hooks/useFeed";
import { isOfflineQuery } from "@/lib/api/errors";
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

  const segments: SegmentedControlOption[] = [
    { key: "announcements", label: t("feed.tabs.announcements") },
    { key: "events", label: t("feed.tabs.events") },
  ];

  // The design (75–79) leads straight with the segmented control under the
  // status bar — no page title.
  const segmentedHeader = (
    <SegmentedControl options={segments} value={type} onChange={(k) => setType(k as FeedType)} />
  );

  // 78 Feed Guest — the segmented control still shows (design 78), with a
  // centered sign-in prompt beneath it.
  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="px-4 pb-1 pt-2">{segmentedHeader}</View>
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            variant="plain"
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
        time={f.fromNow(new Date(item.published_at))}
        title={item.title}
        body={item.body.length > 160 ? `${item.body.slice(0, 160).trimEnd()}…` : item.body}
        avatar={<Feather name="home" size={14} color={c.primary} />}
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
      rsvp={
        <EventRsvpPill masjidId={item.masjid_id} eventId={item.event_id} isRsvped={item.is_rsvped} />
      }
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
        {segmentedHeader}
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
        className="flex-1"
        contentContainerClassName="grow gap-2.5 px-4 py-3 pb-8"
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
            <View className="flex-1 items-center justify-center py-16">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : offline ? null : (
            <View className="flex-1 items-center justify-center px-6">
              <EmptyState
                variant="plain"
                icon={<Feather name="rss" size={26} color={c.primary} />}
                title={t(type === "events" ? "feed.empty.eventsTitle" : "feed.empty.announcementsTitle")}
                caption={t("feed.empty.caption")}
                action={
                  <Button
                    label={t("feed.empty.cta")}
                    className="mt-1"
                    onPress={() => router.navigate("/explore")}
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
