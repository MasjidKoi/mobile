import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Banner, Button, EmptyState, Last10NightsCard, NearestMasjidCard, PrayerTable, Text } from "@/components";
import { useHijriDate } from "@/hooks/useHijriDate";
import { districtLabel, useHomeTimes } from "@/hooks/useHomeTimes";
import { useNow } from "@/hooks/useNow";
import { usePrayerClock, usePrayerTableRows } from "@/hooks/usePrayerClock";
import { useRamadan } from "@/hooks/useRamadan";
import { useFormat } from "@/lib/i18n/format";
import { getCityById, nearestDistrict } from "@/lib/location/cities";
import { azanTime, iqamahTime, parseHHMM } from "@/lib/prayer/clock";
import { splitCountdown } from "@/lib/prayer/format";
import type { PrayerName, PrayerTimeResponse } from "@/lib/prayer/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";

const JAMAAH_IN_PROGRESS_MS = 15 * 60_000;

/** Congregation status pill copy for the masjid variant (PRD 03 state machine). */
function congregationStatus(
  times: PrayerTimeResponse,
  currentPrayer: PrayerName | null,
  now: Date,
  t: (k: string, o?: Record<string, unknown>) => string,
): string | null {
  if (!currentPrayer) return null;
  const iqamah = iqamahTime(times, currentPrayer);
  if (!iqamah) return null;
  const azanAt = parseHHMM(azanTime(times, currentPrayer), now).getTime();
  const iqamahAt = parseHHMM(iqamah, now).getTime();
  const t0 = now.getTime();
  if (t0 >= azanAt && t0 < iqamahAt) {
    return t("prayerClock.jamaahIn", { minutes: Math.max(1, Math.ceil((iqamahAt - t0) / 60_000)) });
  }
  if (t0 >= iqamahAt && t0 < iqamahAt + JAMAAH_IN_PROGRESS_MS) {
    return t("prayerClock.jamaahLikely");
  }
  return null;
}

export default function HomeTab() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const c = useColors();
  const { isDark } = useTheme();
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const now = useNow();

  const home = useHomeTimes();
  const hijri = useHijriDate();
  const clock = usePrayerClock(home.times);
  const ramadan = useRamadan(home.times);
  const rows = usePrayerTableRows(home.times);
  const { coords, cityId, permission, requestLocation } = useLocation();

  const isFriday = now.getDay() === 5;
  const isCalculated = home.variant === "calculated" || home.variant === "travel";

  const headerArea = useMemo(() => {
    if (home.district) return districtLabel(home.district, language);
    const city = getCityById(cityId);
    if (city) return language === "bn" ? city.nameBn : city.nameEn;
    if (coords) return districtLabel(nearestDistrict(coords), language);
    return t("home.yourArea");
  }, [home.district, cityId, coords, language, t]);

  // ----- Loading / no-location states -----
  if (home.state === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (home.state === "needsLocation" || !home.times) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-6">
          <EmptyState
            icon={<Feather name="map-pin" size={28} color={c.primary} />}
            title={t("home.needsLocationTitle")}
            caption={t("home.needsLocationCaption")}
            action={
              <View className="mt-1 w-full gap-2">
                <Button label={t("home.enableLocation")} onPress={() => void requestLocation()} />
                <Button
                  label={t("home.pickCity")}
                  variant="secondary"
                  onPress={() => router.push("/city-picker")}
                />
              </View>
            }
          />
        </View>
      </View>
    );
  }

  // ----- Hero content by variant -----
  const heroTitle = home.variant === "masjid" ? home.masjidName ?? t("home.calculatedTitle") : t("home.calculatedTitle");
  const kicker = ramadan.isRamadan
    ? t("ramadan.untilIftar")
    : home.variant === "masjid"
      ? t("home.homeMasjid")
      : t("home.calculatedSource");

  let primaryCountdown = clock.countdownLabel;
  let nextLine = clock.nextPrayerLabel;
  let statusLabel: string | null = null;

  if (ramadan.isRamadan && ramadan.iftarAt) {
    const { hours, minutes } = splitCountdown(ramadan.iftarCountdownMs ?? 0);
    const raw = hours > 0 ? t("prayerClock.countdownHM", { hours, minutes }) : t("prayerClock.countdownM", { minutes });
    primaryCountdown = language === "bn" ? f.toBengaliDigits(raw) : raw;
    nextLine = t("ramadan.iftarAt", { time: f.time(ramadan.iftarAt) });
    statusLabel = t("ramadan.sehriEndsAt", { time: ramadan.sehriEndsAt ? f.time(ramadan.sehriEndsAt) : "" });
  } else {
    statusLabel =
      home.variant === "masjid"
        ? congregationStatus(home.times, clock.currentPrayer, now, t)
        : null;
    if (!statusLabel && clock.nextPrayerAt) {
      statusLabel = `${clock.nextPrayerLabel} · ${f.time(clock.nextPrayerAt)}`;
    }
  }

  const tableTitle = isFriday
    ? t("home.jumuahToday")
    : isCalculated
      ? t("home.todaysPrayersCalculated")
      : t("home.todaysPrayers");

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerClassName="pb-8" style={{ paddingTop: insets.top }}>
        {/* Light header: greeting + Qibla pill, then date row */}
        <View className="gap-2.5 px-4 pb-1 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-[14px] font-semibold" style={{ color: c["text-secondary"] }}>
                {t("home.greeting")}
              </Text>
              <Text className="text-[13px]" style={{ color: c["text-muted"] }} numberOfLines={1}>
                {headerArea}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("home.qibla")}
              onPress={() => router.push("/qibla")}
              className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2"
            >
              <Feather name="compass" size={16} color={c.primary} />
              <Text className="text-[13px] font-semibold text-primary">{t("home.qibla")}</Text>
            </Pressable>
          </View>

          <Pressable
            className="flex-row items-center gap-2"
            onPress={() => router.push("/hijri-calendar")}
          >
            <Text className="text-[13px] font-semibold" style={{ color: c["accent-gold"] }}>
              {hijri.label} {t("hijri.suffix")}
            </Text>
            <View className="h-[3px] w-[3px] rounded-full" style={{ backgroundColor: c["text-muted"] }} />
            <Text className="text-[13px]" style={{ color: c["text-muted"] }}>
              {f.date(now)}, {f.weekday(now)}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="gap-3.5 px-4 pt-3">
          {/* Banners */}
          {home.variant === "travel" ? (
            <Banner
              variant="info"
              icon={<Feather name="navigation" size={15} color={c.primary} />}
              message={t("home.travelBanner", {
                km: f.number(Math.round(home.distanceKm ?? 0)),
                area: headerArea,
              })}
            />
          ) : null}
          {home.isOffline ? (
            <Banner
              variant="warning"
              icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
              message={t("home.offlineBanner")}
            />
          ) : null}

          {/* Set-home-masjid CTA (no home masjid) */}
          {!home.masjidId ? (
            <Pressable
              onPress={() => router.push("/set-home-masjid")}
              className="flex-row items-center gap-3 rounded-md bg-primary-soft px-3.5 py-3"
            >
              <Feather name="home" size={20} color={c.primary} />
              <View className="flex-1 gap-0.5">
                <Text className="text-body font-semibold text-content-primary">{t("home.addMasjid")}</Text>
                <Text className="text-caption text-content-secondary">{t("home.addMasjidCaption")}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={c.primary} />
            </Pressable>
          ) : null}

          {/* Hero: brand masjid / prayer card */}
          <NearestMasjidCard
            kicker={kicker}
            name={heroTitle}
            prayerLabel={nextLine}
            countdown={primaryCountdown}
            statusLabel={statusLabel ?? clock.nextPrayerLabel}
            statusIcon={
              <Feather
                name={isFriday ? "users" : "clock"}
                size={13}
                color={c["accent-gold-soft"]}
              />
            }
            arrow={
              <Feather
                name={home.masjidId ? "arrow-up-right" : "map-pin"}
                size={18}
                color={c["on-inverse-muted"]}
              />
            }
            onPress={() =>
              home.masjidId
                ? router.push({ pathname: "/masjid/[id]", params: { id: home.masjidId } })
                : router.push("/set-home-masjid")
            }
          />

          {/* Last 10 nights nudge */}
          {ramadan.isLast10Nights ? (
            <Last10NightsCard
              icon={<Feather name="moon" size={20} color={c["on-inverse"]} />}
              title={t("ramadan.last10Title")}
              subtitle={t("ramadan.last10Subtitle")}
              action={
                <Pressable
                  onPress={() =>
                    home.masjidId
                      ? router.push({ pathname: "/masjid/[id]", params: { id: home.masjidId } })
                      : router.push("/set-home-masjid")
                  }
                  className="rounded-full bg-overlay px-3.5 py-1.5"
                >
                  <Text className="text-caption font-semibold text-on-inverse">{t("ramadan.donate")}</Text>
                </Pressable>
              }
            />
          ) : null}

          <View className="flex-row items-center justify-between">
            <Text variant="heading">{tableTitle}</Text>
            <Pressable
              className="flex-row items-center gap-1"
              onPress={() => router.push("/hijri-calendar")}
            >
              <Text className="text-caption font-semibold text-primary">{t("home.fullSchedule")}</Text>
              <Feather name="chevron-right" size={16} color={c.primary} />
            </Pressable>
          </View>

          <PrayerTable
            date={`${hijri.label} ${t("hijri.suffix")}`}
            rows={rows}
            azanLabel={t("prayerClock.azan")}
            iqamahLabel={t("prayerClock.iqamah")}
          />

          {/* Jumu'ah schedule on Fridays */}
          {isFriday && home.jumah && home.jumah.khutbah_1_start ? (
            <View className="flex-row items-center gap-2.5 rounded-md border border-border bg-surface px-4 py-3">
              <Feather name="users" size={16} color={c.primary} />
              <Text className="flex-1 text-body font-medium text-content-primary">{t("prayers.jumuah")}</Text>
              <Text className="text-body font-semibold text-primary">
                {f.toBengaliDigits(home.jumah.khutbah_1_start)}
              </Text>
            </View>
          ) : null}

          {permission !== "granted" && home.variant !== "masjid" ? (
            <Text variant="micro" className="px-1 text-center">
              {t("home.calculatedDisclaimer")}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
