import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, SectionHeader, Text } from "@/components";
import { useHijriDate } from "@/hooks/useHijriDate";
import { useNow } from "@/hooks/useNow";
import { useFormat } from "@/lib/i18n/format";
import { buildHijriMonth, hijriMonthName, stepHijriMonth } from "@/lib/hijri";
import { eventDaysForMonth, eventName, upcomingEvents } from "@/lib/hijri/events";
import { useColors } from "@/lib/theme/useColors";

function intlLocale(language: string): string {
  return language === "bn" ? "bn-BD" : language === "ar" ? "ar" : "en-US";
}

/**
 * Locale-aware short weekday names, **Saturday-first** (Bangladesh standard):
 * শনি, রবি, সোম, মঙ্গল, বুধ, বৃহ, শুক্র. 2023-01-07 was a Saturday.
 */
function weekdayLabels(language: string): string[] {
  const locale = intlLocale(language);
  try {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 7 + i)));
  } catch {
    return ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  }
}

/** Map a JS weekday (0=Sun…6=Sat) to a Saturday-first column index (Sat=0). */
function saturdayColumn(jsWeekday: number): number {
  return (jsWeekday + 1) % 7;
}

/** Gregorian "{month} {year}" label for a representative day of the Hijri month. */
function gregorianMonthLabel(rep: Date, language: string): string {
  const locale = intlLocale(language);
  try {
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(rep);
  } catch {
    return `${rep.getMonth() + 1}/${rep.getFullYear()}`;
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
  const eventDays = useMemo(() => eventDaysForMonth(view.month), [view.month]);

  // Lay the days out into Saturday-first week rows (Bangladesh standard).
  const weeks = useMemo(() => {
    const cells: (typeof month.days[number] | null)[] = [];
    const lead = saturdayColumn(month.days[0]?.weekday ?? 0);
    for (let i = 0; i < lead; i++) cells.push(null);
    cells.push(...month.days);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [month]);

  const monthName = hijriMonthName(view.month, language);
  // Gregorian month+year subtitle, derived from a representative day of the
  // displayed Hijri month (mid-month avoids drifting into the neighbour month).
  const gregorianLabel = useMemo(() => {
    const rep = month.days[Math.floor(month.days.length / 2)]?.gregorian ?? now;
    return gregorianMonthLabel(rep, language);
  }, [month, language, now]);

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
          <View className="items-center">
            <Text variant="heading" className="font-bold">
              {monthName} {f.localizeDigits(String(view.year))}
            </Text>
            <Text variant="micro" className="text-content-muted">
              {gregorianLabel}
            </Text>
          </View>
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
                    <>
                      <View
                        className={`h-9 w-9 items-center justify-center rounded-full ${
                          day.isToday ? "bg-primary" : ""
                        }`}
                      >
                        <Text className={`text-body ${day.isToday ? "font-bold text-on-inverse" : "font-regular text-content-primary"}`}>
                          {f.number(day.hijriDay)}
                        </Text>
                      </View>
                      <View className="mt-0.5 h-1.5 w-1.5 items-center justify-center">
                        {eventDays.has(day.hijriDay) && !day.isToday ? (
                          <View className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
                        ) : null}
                      </View>
                    </>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Upcoming Islamic dates */}
        <SectionHeader title={t("hijri.upcoming")} className="mt-1" />
        <Card>
          {events.map((e) => {
            // Near-term, moon-sighting-sensitive dates are shown as approximate.
            const daysAway = (e.gregorian.getTime() - now.getTime()) / 86_400_000;
            const approx = daysAway <= 60;
            const subtitle = `${f.date(e.gregorian)}${approx ? ` ${t("hijri.approx")}` : ""}`;
            return (
              <View key={e.id} className="flex-row items-center gap-3 px-4 py-3">
                <View className="h-11 w-11 items-center justify-center rounded-md bg-accent-gold-soft">
                  <Text className="text-body font-bold" style={{ color: c["accent-gold"] }}>
                    {f.number(e.day)}
                  </Text>
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-body font-bold text-content-primary">
                    {eventName(e, language)} · {hijriMonthName(e.month, language)}
                  </Text>
                  <Text className="text-caption font-regular text-content-secondary">
                    {subtitle}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
