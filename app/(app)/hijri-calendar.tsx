import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, Row, SectionHeader, Text } from "@/components";
import { useHijriDate } from "@/hooks/useHijriDate";
import { useNow } from "@/hooks/useNow";
import { useFormat } from "@/lib/i18n/format";
import { buildHijriMonth, hijriMonthName, stepHijriMonth } from "@/lib/hijri";
import { eventName, upcomingEvents } from "@/lib/hijri/events";
import { useColors } from "@/lib/theme/useColors";

/** Locale-aware short weekday names (Sun-first; 2023-01-01 was a Sunday). */
function weekdayLabels(language: string): string[] {
  const locale = language === "bn" ? "bn-BD" : language === "ar" ? "ar" : "en-US";
  try {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
  } catch {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }
}

export default function HijriCalendarScreen() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const c = useColors();
  const f = useFormat();
  const now = useNow();
  const hijri = useHijriDate();

  const [view, setView] = useState({ year: hijri.year, month: hijri.month });
  const month = useMemo(
    () => buildHijriMonth(view.year, view.month, now, hijri.offset),
    [view, now, hijri.offset],
  );
  const events = useMemo(() => upcomingEvents(now, hijri.offset, 5), [now, hijri.offset]);
  const weekdays = useMemo(() => weekdayLabels(language), [language]);

  // Lay the days out into Sun-first week rows.
  const weeks = useMemo(() => {
    const cells: (typeof month.days[number] | null)[] = [];
    const lead = month.days[0]?.weekday ?? 0;
    for (let i = 0; i < lead; i++) cells.push(null);
    cells.push(...month.days);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [month]);

  const monthName = hijriMonthName(view.month, language);

  const back = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
      <Feather name="arrow-left" size={22} color={c["text-primary"]} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("hijri.title")} left={back} />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        {/* Month switcher */}
        <View className="flex-row items-center justify-between rounded-md border border-border bg-surface px-2 py-2.5">
          <Pressable
            accessibilityRole="button"
            onPress={() => setView((v) => stepHijriMonth(v.year, v.month, -1))}
            className="h-9 w-9 items-center justify-center"
          >
            <Feather name="chevron-left" size={22} color={c["text-secondary"]} />
          </Pressable>
          <Text variant="heading">
            {monthName} {f.number(view.year)}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setView((v) => stepHijriMonth(v.year, v.month, 1))}
            className="h-9 w-9 items-center justify-center"
          >
            <Feather name="chevron-right" size={22} color={c["text-secondary"]} />
          </Pressable>
        </View>

        {/* Calendar grid */}
        <View className="gap-1.5 rounded-md border border-border bg-surface p-3">
          <View className="flex-row">
            {weekdays.map((w, i) => (
              <Text key={i} className="flex-1 text-center text-micro font-semibold text-content-muted">
                {w}
              </Text>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} className="flex-row">
              {week.map((day, di) => (
                <View key={di} className="flex-1 items-center py-1.5">
                  {day ? (
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        day.isToday ? "bg-primary" : ""
                      }`}
                    >
                      <Text className={`text-body ${day.isToday ? "font-bold text-on-inverse" : "font-regular text-content-primary"}`}>
                        {f.number(day.hijriDay)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Upcoming Islamic dates */}
        <SectionHeader title={t("hijri.myDates")} className="mt-1" />
        <Card>
          {events.map((e) => (
            <Row
              key={e.id}
              icon={<Feather name="star" size={16} color={c["accent-gold"]} />}
              title={eventName(e, language)}
              subtitle={`${f.number(e.day)} ${hijriMonthName(e.month, language)} ${f.number(e.hijriYear)}`}
              value={f.date(e.gregorian)}
            />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
