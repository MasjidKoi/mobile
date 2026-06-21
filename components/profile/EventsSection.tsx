import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { EventCard, SectionHeader } from "@/components";
import { monthShortLabel, parseLocalDate, parseLocalDateTime } from "@/lib/community/format";
import type { EventResponse } from "@/lib/events/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

export type EventsSectionProps = {
  events: EventResponse[];
  /** Open the event detail screen for the tapped event. */
  onOpen: (event: EventResponse) => void;
};

/**
 * Upcoming events on the masjid profile (Phase 8b). Each card opens the event
 * detail (where RSVP lives). Renders nothing when there are no events.
 */
export function EventsSection({ events, onOpen }: EventsSectionProps) {
  const { t, i18n } = useTranslation();
  const f = useFormat();
  const c = useColors();

  if (events.length === 0) return null;

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("community.events.sectionTitle")} />
      <View className="gap-2.5">
        {events.map((ev) => {
          const date = parseLocalDate(ev.event_date);
          const at = parseLocalDateTime(ev.event_date, ev.event_time);
          return (
            <Pressable key={ev.event_id} accessibilityRole="button" onPress={() => onOpen(ev)}>
              <EventCard
                day={f.number(date.getDate())}
                month={monthShortLabel(date, i18n.language)}
                title={ev.title}
                meta={`${f.time(at)} · ${ev.location}`}
                attendees={t("community.events.attendees", { formatted: f.number(ev.rsvp_count) })}
                attendeesIcon={<Feather name="users" size={13} color={c["text-muted"]} />}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default EventsSection;
