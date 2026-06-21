import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Banner, Button, EmptyState, Text } from "@/components";
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
 * masjid's events list. RSVP is optimistic, reconciled by the toggle response. */
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
          setEnabled(false);
          setError(t("community.events.disabled"));
        } else {
          setError(t("community.events.rsvpError"));
        }
      },
    });
  };

  const capacityLabel =
    event.capacity != null
      ? t("community.events.countWithCap", {
          going: f.number(rsvpCount),
          cap: f.number(event.capacity),
        })
      : t("community.events.attendees", { formatted: f.number(rsvpCount) });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("community.events.title")} left={back} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 py-4 pb-10">
        {/* Date badge + title */}
        <View className="flex-row gap-3.5">
          <View className="w-[60px] items-center rounded-md bg-primary-soft py-2.5">
            <Text className="text-[22px] font-bold text-primary">{f.number(date.getDate())}</Text>
            <Text className="text-caption font-semibold text-primary">
              {monthShortLabel(date, i18n.language)}
            </Text>
          </View>
          <View className="flex-1 justify-center gap-1">
            <Text className="text-[20px] font-bold leading-6 text-content-primary">{event.title}</Text>
            {event.masjid_name ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  // navigate (not push): jump back to this masjid if it's already
                  // on the stack rather than stacking a duplicate profile.
                  router.navigate({ pathname: "/masjid/[id]", params: { id: event.masjid_id } })
                }
              >
                <Text variant="caption" className="text-primary">
                  {event.masjid_name}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Meta rows */}
        <View className="gap-2.5 rounded-md border border-border bg-surface p-4">
          <MetaRow icon="clock" text={`${f.date(date)} · ${f.time(at)}`} />
          <MetaRow icon="map-pin" text={event.location} />
          <MetaRow icon="users" text={capacityLabel} />
        </View>

        {/* Description */}
        <Text className="text-body font-regular leading-6 text-content-secondary">
          {event.description}
        </Text>

        {error ? (
          <Banner
            variant="warning"
            icon={<Feather name="alert-triangle" size={15} color="#8A6A1F" />}
            message={error}
          />
        ) : null}

        {/* RSVP control */}
        {!rsvpEnabled ? (
          <Banner
            variant="info"
            icon={<Feather name="info" size={15} color={c.primary} />}
            message={t("community.events.rsvpClosed")}
          />
        ) : isRsvped ? (
          <Button
            variant="secondary"
            label={t("community.events.going")}
            leftIcon={<Feather name="check" size={18} color={c.primary} />}
            onPress={() => requireAuth(toggleRsvp, "community")}
          />
        ) : (
          <Button
            label={full ? t("community.events.full") : t("community.events.rsvp")}
            disabled={full || rsvp.isPending}
            onPress={() => requireAuth(toggleRsvp, "community")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  const c = useColors();
  return (
    <View className="flex-row items-center gap-2.5">
      <Feather name={icon} size={15} color={c["text-muted"]} />
      <Text variant="caption" className="flex-1 text-content-secondary">
        {text}
      </Text>
    </View>
  );
}
