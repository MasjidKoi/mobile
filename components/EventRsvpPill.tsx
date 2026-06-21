import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { useEventRsvp } from "@/hooks/useEventRsvp";
import { useColors } from "@/lib/theme/useColors";
import { useLoginGate } from "@/providers/LoginGateProvider";

import { Text } from "./Text";

/**
 * Inline RSVP pill for event cards (feed 76 / profile events). Two states:
 *   - not going → filled brand pill with a plus + "Join"
 *   - going     → soft-green outline pill with a check + "Going"
 * Self-contained: owns the optimistic toggle and gates the action behind login.
 * Its own press is captured so it doesn't trigger the surrounding card's onPress.
 */
export type EventRsvpPillProps = {
  masjidId: string;
  eventId: string;
  isRsvped: boolean;
};

export function EventRsvpPill({ masjidId, eventId, isRsvped }: EventRsvpPillProps) {
  const { t } = useTranslation();
  const c = useColors();
  const { requireAuth } = useLoginGate();
  const rsvp = useEventRsvp(masjidId, eventId);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const going = optimistic ?? isRsvped;

  const toggle = () =>
    requireAuth(() => {
      if (rsvp.isPending) return;
      const next = !going;
      setOptimistic(next);
      rsvp.mutate(undefined, {
        onSuccess: (res) => setOptimistic(res.rsvp),
        onError: () => setOptimistic(!next),
      });
    }, "community");

  return (
    <Pressable
      accessibilityRole="button"
      onPress={toggle}
      hitSlop={6}
      className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 ${
        going ? "border border-primary bg-primary-soft" : "bg-primary active:bg-primary-pressed"
      }`}
    >
      <Feather
        name={going ? "check" : "plus"}
        size={13}
        color={going ? c.primary : c["on-inverse"]}
      />
      <Text className={`text-caption font-semibold ${going ? "text-primary" : "text-on-inverse"}`}>
        {t(going ? "community.events.going" : "community.events.join")}
      </Text>
    </Pressable>
  );
}

export default EventRsvpPill;
