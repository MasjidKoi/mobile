import { Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Banner, Button, EmptyState, Switch, Text } from "@/components";
import { useEvents } from "@/hooks/useEvents";
import { useEventRsvp } from "@/hooks/useEventRsvp";
import { ApiError } from "@/lib/api/errors";
import { monthShortLabel, parseLocalDate, parseLocalDateTime } from "@/lib/community/format";
import type { EventDetailParam } from "@/lib/events/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** 81 Event Detail / 82 Event Detail Going. Event data arrives via the `e` nav
 * param (the backend has no single-event GET); a deep link falls back to the
 * masjid's events list. RSVP is optimistic, reconciled by the toggle response.
 * The "going" state adds a banner, an add-to-calendar/reminder extras card, and
 * a destructive cancel action (design 82). */
export default function EventDetailScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { requireAuth } = useLoginGate();
  const params = useLocalSearchParams<{ id: string; masjidId: string; e?: string }>();

  // Primary path: the full event passed as a JSON param. Fallback (deep link):
  // fetch the masjid's events list and find this id.
  const passed = useMemo<EventDetailParam | null>(() => {
    if (!params.e) return null;
    try {
      return JSON.parse(params.e) as EventDetailParam;
    } catch {
      return null;
    }
  }, [params.e]);

  const listQuery = useEvents(passed ? null : params.masjidId, { enabled: !passed });
  const fromList = listQuery.data?.items.find((e) => e.event_id === params.id);
  const event: EventDetailParam | null =
    passed ??
    (fromList
      ? {
          ...fromList,
          masjid_name: "",
          // The public list can't tell us the caller's own RSVP — assume not yet.
          is_rsvped: false,
        }
      : null);

  const rsvp = useEventRsvp(params.masjidId, params.id);

  // Optimistic RSVP state, seeded from the event once known.
  const [rsvped, setRsvped] = useState<boolean | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reminderOn, setReminderOn] = useState(false);
  const reminderId = useRef<string | null>(null);

  const isRsvped = rsvped ?? event?.is_rsvped ?? false;
  const rsvpCount = count ?? event?.rsvp_count ?? 0;
  const rsvpEnabled = enabled ?? event?.rsvp_enabled ?? false;
  const full = event?.capacity != null && rsvpCount >= event.capacity && !isRsvped;

  const back = <BackButton onPress={() => router.back()} />;

  if (!event) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("community.events.title")} left={back} />
        <View className="flex-1 items-center justify-center px-lg">
          {listQuery.isLoading ? (
            <ActivityIndicator color={c.primary} />
          ) : (
            <EmptyState
              icon={<Feather name="calendar" size={26} color={c.primary} />}
              title={t("community.events.errorTitle")}
              caption={t("community.events.errorCaption")}
              action={<Button label={t("common.close")} onPress={() => router.back()} />}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const date = parseLocalDate(event.event_date);
  const at = parseLocalDateTime(event.event_date, event.event_time);
  const dateLabel = `${monthShortLabel(date, i18n.language)} ${f.number(date.getDate())}, ${f.weekday(date)}`;
  // Show a start–end range when the event carries an end time (design 81/82).
  const endAt = event.event_end_time
    ? parseLocalDateTime(event.event_date, event.event_end_time)
    : null;
  const timeLabel = endAt ? `${f.time(at)} – ${f.time(endAt)}` : f.time(at);

  const onShare = () =>
    void Share.share({ message: `${event.title}\n${dateLabel} · ${f.time(at)}\n${event.location}` });

  const share = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("common.share")}
      onPress={onShare}
      hitSlop={10}
    >
      <Feather name="share-2" size={20} color={c["text-secondary"]} />
    </Pressable>
  );

  const toggleRsvp = () => {
    if (rsvp.isPending) return;
    setError(null);
    const next = !isRsvped;
    // Optimistic flip.
    setRsvped(next);
    setCount(rsvpCount + (next ? 1 : -1));
    rsvp.mutate(undefined, {
      onSuccess: (res) => {
        setRsvped(res.rsvp);
        setCount(res.rsvp_count);
      },
      onError: (e) => {
        // Roll back, then map the two known rejections to copy.
        setRsvped(!next);
        setCount(rsvpCount);
        if (e instanceof ApiError && e.status === 409) {
          setError(t("community.events.full"));
        } else if (e instanceof ApiError && e.status === 422) {
          // RSVP turned out to be disabled — the persistent "closed" info banner
          // below covers this, so don't also raise a transient error banner.
          setEnabled(false);
        } else {
          setError(t("community.events.rsvpError"));
        }
      },
    });
  };

  // Best-effort local reminder 1 hour before the event. Scheduling failures
  // (no permission, past event) are non-fatal — the toggle just falls back off.
  const toggleReminder = async (nextOn: boolean) => {
    setReminderOn(nextOn);
    try {
      if (nextOn) {
        const perm = await Notifications.getPermissionsAsync();
        const granted = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
        const fireAt = new Date(at.getTime() - 60 * 60 * 1000);
        if (!granted || fireAt.getTime() <= Date.now()) {
          setReminderOn(false);
          return;
        }
        reminderId.current = await Notifications.scheduleNotificationAsync({
          content: { title: event.title, body: t("community.events.reminderSet") },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
        });
      } else if (reminderId.current) {
        await Notifications.cancelScheduledNotificationAsync(reminderId.current);
        reminderId.current = null;
      }
    } catch {
      // Non-fatal.
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("community.events.title")} left={back} right={share} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 py-4 pb-6">
        {/* 82 Going banner */}
        {isRsvped ? (
          <View className="flex-row items-center gap-2.5 rounded-md bg-primary-soft p-3.5">
            <Feather name="check-circle" size={18} color={c.primary} />
            <Text variant="caption" className="font-semibold text-primary">
              {t("community.events.goingBanner")}
            </Text>
          </View>
        ) : null}

        {/* Title + masjid. `display` variant carries the bold (700) Hind Siliguri
            family; size/line-height are set inline (22px on a 30px line) so the
            override is deterministic and tall glyphs aren't clipped at the top. */}
        <Text variant="display" style={{ fontSize: 22, lineHeight: 30 }}>
          {event.title}
        </Text>
        {event.masjid_name ? (
          <Pressable
            accessibilityRole="button"
            className="-mt-1 flex-row items-center gap-1.5"
            onPress={() =>
              router.navigate({ pathname: "/masjid/[id]", params: { id: event.masjid_id } })
            }
          >
            <Feather name="home" size={15} color={c.primary} />
            <Text variant="caption" className="font-semibold text-primary">
              {event.masjid_name}
            </Text>
          </Pressable>
        ) : null}

        {/* Info card */}
        <View className="overflow-hidden rounded-md border border-border bg-surface">
          <InfoRow icon="calendar" text={dateLabel} divider />
          <InfoRow icon="clock" text={timeLabel} divider />
          <InfoRow icon="map-pin" text={event.location} divider />
          <InfoRow
            icon="users"
            text={t("community.events.attendees", { formatted: f.number(rsvpCount) })}
          />
        </View>

        {/* 82 Extras — add to calendar + reminder (going + RSVP open). */}
        {isRsvped && rsvpEnabled ? (
          <View className="overflow-hidden rounded-md border border-border bg-surface">
            <Pressable
              accessibilityRole="button"
              onPress={onShare}
              className="flex-row items-center gap-3 border-b border-border px-4 py-3.5 active:bg-primary-soft"
            >
              <Feather name="calendar" size={18} color={c.primary} />
              <Text variant="body" className="flex-1">
                {t("community.events.addToCalendar")}
              </Text>
              <Feather name="chevron-right" size={16} color={c["text-muted"]} />
            </Pressable>
            <View className="flex-row items-center gap-3 px-4 py-3">
              <Feather name="bell" size={18} color={c["text-secondary"]} />
              <Text variant="body" className="flex-1">
                {t("community.events.reminder")}
              </Text>
              <Switch value={reminderOn} onValueChange={(v) => void toggleReminder(v)} />
            </View>
          </View>
        ) : null}

        {/* Description */}
        <View className="gap-1.5">
          <Text variant="caption" className="font-semibold text-content-secondary">
            {t("community.events.description")}
          </Text>
          <Text className="text-body font-regular leading-6 text-content-secondary">
            {event.description}
          </Text>
        </View>

        {error ? (
          <Banner
            variant="warning"
            icon={<Feather name="alert-triangle" size={15} color="#8A6A1F" />}
            message={error}
          />
        ) : null}

        {!rsvpEnabled ? (
          <Banner
            variant="info"
            icon={<Feather name="info" size={15} color={c.primary} />}
            message={t("community.events.rsvpClosed")}
          />
        ) : null}
      </ScrollView>

      {/* Pinned action bar (design 81/82). */}
      {rsvpEnabled ? (
        <View className="border-t border-border bg-surface px-4 pb-6 pt-3">
          {isRsvped ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => requireAuth(toggleRsvp, "community")}
              className="flex-row items-center justify-center gap-2 rounded-md border border-error bg-surface py-[14px] active:opacity-80"
            >
              <Feather name="x" size={18} color={c.error} />
              <Text className="text-base font-semibold text-error">
                {t("community.events.cancelGoing")}
              </Text>
            </Pressable>
          ) : (
            <Button
              label={full ? t("community.events.full") : t("community.events.join")}
              leftIcon={full ? undefined : <Feather name="plus" size={18} color={c["on-inverse"]} />}
              disabled={full || rsvp.isPending}
              onPress={() => requireAuth(toggleRsvp, "community")}
            />
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  text,
  divider,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  divider?: boolean;
}) {
  const c = useColors();
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3${divider ? " border-b border-border" : ""}`}
    >
      <Feather name={icon} size={18} color={c["text-secondary"]} />
      <Text variant="body" className="flex-1 text-content-primary">
        {text}
      </Text>
    </View>
  );
}
