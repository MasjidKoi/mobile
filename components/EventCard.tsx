import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Event card from the Content & Community kit: a date badge beside the title,
 * meta, attendee count, and an RSVP control. Generic over its data; `rsvp`
 * and `attendeesIcon` are passed as nodes.
 */
export type EventCardProps = {
  day: string;
  month: string;
  title: string;
  meta: string;
  attendees?: string;
  attendeesIcon?: ReactNode;
  rsvp?: ReactNode;
  className?: string;
};

export function EventCard({
  day,
  month,
  title,
  meta,
  attendees,
  attendeesIcon,
  rsvp,
  className,
}: EventCardProps) {
  return (
    <View
      className={`flex-row gap-3.5 rounded-md border border-border bg-surface p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="w-[52px] items-center rounded-sm bg-primary-soft py-2">
        <Text className="text-[20px] font-bold text-primary">{day}</Text>
        <Text className="text-[12px] font-semibold text-primary">{month}</Text>
      </View>
      <View className="flex-1 gap-[5px]">
        <Text className="text-body font-semibold text-content-primary">{title}</Text>
        <Text className="text-caption font-regular text-content-secondary">{meta}</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            {attendeesIcon}
            {attendees ? (
              <Text className="text-caption font-regular text-content-secondary">{attendees}</Text>
            ) : null}
          </View>
          {rsvp}
        </View>
      </View>
    </View>
  );
}

export default EventCard;
