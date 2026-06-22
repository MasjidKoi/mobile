import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { monthShortLabel, parseLocalDate, parseLocalDateTime } from "@/lib/community/format";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

import { EventCard } from "./EventCard";

/**
 * A tappable event row built on the presentational `EventCard` — the date-badge
 * formatting, attendee label, and users icon that both the Feed and the profile
 * EventsSection need. Pass `masjidName` to prefix the meta line (the feed shows
 * it; the single-masjid profile section omits it).
 */
export type CommunityEventCardProps = {
  eventDate: string;
  eventTime: string;
  title: string;
  location: string;
  attendees: number;
  masjidName?: string;
  /** Inline RSVP control (feed cards). Omitted on the profile section. */
  rsvp?: ReactNode;
  onPress: () => void;
};

export function CommunityEventCard({
  eventDate,
  eventTime,
  title,
  location,
  attendees,
  masjidName,
  rsvp,
  onPress,
}: CommunityEventCardProps) {
  const { t, i18n } = useTranslation();
  const f = useFormat();
  const c = useColors();
  const date = parseLocalDate(eventDate);
  const at = parseLocalDateTime(eventDate, eventTime);
  const time = f.time(at);
  // Feed cards lead with the masjid name (matching the design's "masjid · time");
  // the single-masjid profile section drops it and shows the venue instead.
  const meta = masjidName ? `${masjidName} · ${time}` : `${time} · ${location}`;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <EventCard
        day={f.number(date.getDate())}
        month={monthShortLabel(date, i18n.language)}
        title={title}
        meta={meta}
        attendees={t("community.events.attendees", { formatted: f.number(attendees) })}
        attendeesIcon={<Feather name="users" size={13} color={c["text-muted"]} />}
        rsvp={rsvp}
      />
    </Pressable>
  );
}

export default CommunityEventCard;
