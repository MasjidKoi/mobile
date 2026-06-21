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
  EmptyState,
  EventCard,
  SegmentedControl,
  Text,
  type SegmentedControlOption,
} from "@/components";
import { useFeed } from "@/hooks/useFeed";
import { ApiError } from "@/lib/api/errors";
import { monthShortLabel, parseLocalDate, parseLocalDateTime } from "@/lib/community/format";
import type { EventDetailParam } from "@/lib/events/types";
import type { FeedAnnouncementItem, FeedEventItem, FeedItem, FeedType } from "@/lib/feed/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** First character of a masjid name, for the card avatar circle. */
function initial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "م";
}

function feedKey(item: FeedItem): string {
  return item.kind === "announcement" ? `a-${item.announcement_id}` : `e-${item.event_id}`;
}

/** Feed tab — the followed-masjid feed (75 Announcements / 76 Events, with 77
 * Empty / 78 Guest / 79 Offline variants). RSVP on event cards lands in 8b. */
export default function FeedTab() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useLoginGate();
  const [type, setType] = useState<FeedType>("announcements");

  const q = useFeed(type);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const offline =
    q.isError && q.failureReason instanceof ApiError && q.failureReason.isNetworkError;

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
            icon={<Feather name="rss" size={28} color={c.primary} />}
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
        avatar={<Text className="text-caption font-bold text-primary">{initial(item.masjid_name)}</Text>}
      />
    </Pressable>
  );

  const renderEvent = (item: FeedEventItem) => {
    const date = parseLocalDate(item.event_date);
    const at = parseLocalDateTime(item.event_date, item.event_time);
    // The feed item carries `is_rsvped`/`attendee_count` but not `rsvp_enabled`
    // (assume enabled; a 422 on toggle corrects it). Pass the whole event so the
    // detail screen needs no single-GET.
    const param: EventDetailParam = {
      event_id: item.event_id,
      masjid_id: item.masjid_id,
      masjid_name: item.masjid_name,
      title: item.title,
      description: item.description,
      event_date: item.event_date,
      event_time: item.event_time,
      location: item.location,
      capacity: item.capacity,
      rsvp_count: item.attendee_count,
      rsvp_enabled: true,
      is_rsvped: item.is_rsvped,
    };
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: "/event/[id]",
            params: { id: item.event_id, masjidId: item.masjid_id, e: JSON.stringify(param) },
          })
        }
      >
        <EventCard
          day={f.number(date.getDate())}
          month={monthShortLabel(date, i18n.language)}
          title={item.title}
          meta={`${item.masjid_name} · ${f.time(at)} · ${item.location}`}
          attendees={t("community.events.attendees", { formatted: f.number(item.attendee_count) })}
          attendeesIcon={<Feather name="users" size={13} color={c["text-muted"]} />}
        />
      </Pressable>
    );
  };

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
