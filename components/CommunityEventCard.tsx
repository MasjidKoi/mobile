import { Feather } from "@expo/vector-icons";
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
  onPress: () => void;
};

export function CommunityEventCard({
  eventDate,
  eventTime,
  title,
  location,
  attendees,
  masjidName,
  onPress,
}: CommunityEventCardProps) {
  const { t, i18n } = useTranslation();
  const f = useFormat();
  const c = useColors();
  const date = parseLocalDate(eventDate);
  const at = parseLocalDateTime(eventDate, eventTime);
  const time = f.time(at);
  const meta = masjidName ? `${masjidName} · ${time} · ${location}` : `${time} · ${location}`;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <EventCard
        day={f.number(date.getDate())}
        month={monthShortLabel(date, i18n.language)}
        title={title}
        meta={meta}
        attendees={t("community.events.attendees", { formatted: f.number(attendees) })}
        attendeesIcon={<Feather name="users" size={13} color={c["text-muted"]} />}
      />
    </Pressable>
  );
}

export default CommunityEventCard;
