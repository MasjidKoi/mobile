import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { CommunityEventCard, SectionHeader } from "@/components";
import type { EventResponse } from "@/lib/events/types";

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
  const { t } = useTranslation();

  if (events.length === 0) return null;

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("community.events.sectionTitle")} />
      <View className="gap-2.5">
        {events.map((ev) => (
          <CommunityEventCard
            key={ev.event_id}
            eventDate={ev.event_date}
            eventTime={ev.event_time}
            title={ev.title}
            location={ev.location}
            attendees={ev.rsvp_count}
            onPress={() => onOpen(ev)}
          />
        ))}
      </View>
    </View>
  );
}

export default EventsSection;
