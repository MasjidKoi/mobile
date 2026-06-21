import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppBar,
  BackButton,
  BottomSheet,
  Card,
  NotifModeRow,
  Row,
  Switch,
  Text,
} from "@/components";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useReminderPrefs } from "@/hooks/useReminderPrefs";
import { useFormat } from "@/lib/i18n/format";
import {
  getNotificationStatus,
  type NotificationPermission,
} from "@/lib/notifications/permissions";
import type { NotificationMode } from "@/lib/notifications/preferences";
import { azanSoundOption } from "@/lib/notifications/sounds";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

function SectionLabel({ title }: { title: string }) {
  return (
    <View className="px-0.5">
      <Text className="text-caption font-semibold text-content-muted">
        {title}
      </Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { status } = useAuth();
  const authed = status === "authenticated";

  const { prefs: rp, setPrefs } = useReminderPrefs();
  const {
    prefs: np,
    setPref,
    setMode,
  } = useNotificationPreferences({ enabled: authed });

  const [perm, setPerm] = useState<NotificationPermission>("undetermined");
  const [hourSheet, setHourSheet] = useState(false);

  // Re-check on focus so returning from device settings reflects a grant.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getNotificationStatus().then((p) => active && setPerm(p));
      return () => {
        active = false;
      };
    }, []),
  );

  const denied = perm === "denied";

  // Stable across renders so memoized NotifModeRow children don't re-render on
  // unrelated state changes (e.g. opening the digest-hour sheet).
  const modeOptions = useMemo(() => {
    const modeColor = (active: boolean) =>
      active ? c.primary : c["text-muted"];
    return [
      {
        key: "digest",
        icon: (a: boolean) => (
          <Feather name="layers" size={15} color={modeColor(a)} />
        ),
      },
      {
        key: "instant",
        icon: (a: boolean) => (
          <Feather name="bell" size={15} color={modeColor(a)} />
        ),
      },
      {
        key: "mute",
        icon: (a: boolean) => (
          <Feather name="bell-off" size={15} color={modeColor(a)} />
        ),
      },
    ];
  }, [c]);

  const chevron = (
    <Feather name="chevron-right" size={16} color={c["text-muted"]} />
  );

  const digestHourLabel =
    np != null ? f.time(new Date(2000, 0, 1, np.digest_hour, 0)) : "";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("settings.notifications.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-[22px] px-4 pb-6 pt-3">
        {/* Permission status */}
        <View
          className={`flex-row items-center gap-2.5 rounded-md px-3.5 py-3 ${
            denied ? "bg-error-soft" : "bg-primary-soft"
          }`}
        >
          <Feather
            name={denied ? "bell-off" : "check-circle"}
            size={20}
            color={denied ? c.error : c.primary}
          />
          <View className="flex-1 gap-0.5">
            <Text className="text-body font-semibold text-content-primary">
              {t(
                denied
                  ? "settings.notifications.permOff"
                  : "settings.notifications.permOn",
              )}
            </Text>
            <Text className="text-caption font-regular text-content-secondary">
              {t(
                denied
                  ? "settings.notifications.permOffSub"
                  : "settings.notifications.permOnSub",
              )}
            </Text>
          </View>
        </View>

        {denied ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void Linking.openSettings()}
            className="flex-row items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 active:bg-primary-pressed"
          >
            <Feather name="settings" size={17} color={c["on-inverse"]} />
            <Text className="text-body font-semibold text-on-inverse">
              {t("settings.notifications.openDeviceSettings")}
            </Text>
          </Pressable>
        ) : null}

        {/* Prayer reminders (local — works for guests). */}
        <View className={`gap-2 ${denied ? "opacity-45" : ""}`}>
          <SectionLabel title={t("settings.notifications.prayerSection")} />
          <Card>
            <Row
              icon={
                <Feather name="bell" size={18} color={c["text-secondary"]} />
              }
              title={t("settings.notifications.fivePrayer")}
              trailing={
                <Switch
                  value={rp.enabled}
                  disabled={denied}
                  onValueChange={(v) => setPrefs({ enabled: v })}
                />
              }
            />
            <Row
              icon={
                <Feather
                  name="volume-2"
                  size={18}
                  color={c["text-secondary"]}
                />
              }
              title={t("settings.notifications.azanSound")}
              trailing={
                <Switch
                  value={rp.azanMoment}
                  disabled={denied}
                  onValueChange={(v) => setPrefs({ azanMoment: v })}
                />
              }
            />
            <Row
              accessibilityRole="button"
              icon={
                <Feather name="clock" size={18} color={c["text-secondary"]} />
              }
              title={t("settings.notifications.offset")}
              value={`${f.number(rp.offsetMinutes)} ${t("units.min")}`}
              trailing={chevron}
              onPress={() => router.push("/prayer-reminders")}
            />
            <Row
              accessibilityRole="button"
              icon={
                <Feather name="music" size={18} color={c["text-secondary"]} />
              }
              title={t("settings.notifications.sound")}
              value={t(azanSoundOption(rp.azanSound).nameKey)}
              trailing={chevron}
              onPress={() => router.push("/azan-sound")}
            />
          </Card>
        </View>

        {/* Followed masjids (server — authenticated only). */}
        {authed ? (
          <View className={`gap-2 ${denied ? "opacity-45" : ""}`}>
            <SectionLabel title={t("settings.notifications.followedSection")} />
            {np && np.masjids.length > 0 ? (
              <View className="gap-2">
                {np.masjids.map((m) => (
                  <NotifModeRow
                    key={m.masjid_id}
                    masjid={m.name}
                    mode={m.notification_mode}
                    options={modeOptions}
                    onChange={(mode) =>
                      setMode(m.masjid_id, mode as NotificationMode)
                    }
                  />
                ))}
                <Card>
                  <Row
                    accessibilityRole="button"
                    icon={
                      <Feather
                        name="clock"
                        size={18}
                        color={c["text-secondary"]}
                      />
                    }
                    title={t("settings.notifications.digestHour")}
                    value={digestHourLabel}
                    trailing={chevron}
                    onPress={() => setHourSheet(true)}
                  />
                </Card>
              </View>
            ) : (
              <View className="items-center gap-1 rounded-md border border-border bg-surface px-4 py-6">
                <Text className="text-body font-semibold text-content-primary">
                  {t("settings.notifications.followedEmpty")}
                </Text>
                <Text className="text-center text-caption font-regular text-content-muted">
                  {t("settings.notifications.followedEmptySub")}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Other notification types (server — authenticated only). */}
        {authed && np ? (
          <View className={`gap-2 ${denied ? "opacity-45" : ""}`}>
            <SectionLabel title={t("settings.notifications.otherSection")} />
            <Card>
              <Row
                icon={
                  <Feather name="star" size={18} color={c["text-secondary"]} />
                }
                title={t("settings.notifications.eid")}
                trailing={
                  <Switch
                    value={!np.mute_promotions}
                    disabled={denied}
                    onValueChange={(v) => setPref({ mute_promotions: !v })}
                  />
                }
              />
              <Row
                icon={
                  <Feather
                    name="message-square"
                    size={18}
                    color={c["text-secondary"]}
                  />
                }
                title={t("settings.notifications.submissionResults")}
                trailing={
                  <Switch
                    value={!np.mute_moderation_outcome}
                    disabled={denied}
                    onValueChange={(v) =>
                      setPref({ mute_moderation_outcome: !v })
                    }
                  />
                }
              />
              <Row
                icon={
                  <Feather
                    name="camera"
                    size={18}
                    color={c["text-secondary"]}
                  />
                }
                title={t("settings.notifications.photoUpdates")}
                trailing={
                  <Switch
                    value={!np.mute_photo_outcome}
                    disabled={denied}
                    onValueChange={(v) => setPref({ mute_photo_outcome: !v })}
                  />
                }
              />
            </Card>
          </View>
        ) : null}
      </ScrollView>

      {/* Digest-hour picker */}
      <BottomSheet visible={hourSheet} onClose={() => setHourSheet(false)}>
        <Text className="text-[18px] font-bold text-content-primary">
          {t("settings.notifications.digestHour")}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: 24 }, (_, h) => {
            const selected = np?.digest_hour === h;
            return (
              <Pressable
                key={h}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  setPref({ digest_hour: h });
                  setHourSheet(false);
                }}
                className={`w-[52px] items-center rounded-md py-2 ${
                  selected ? "bg-primary" : "border border-border bg-surface"
                }`}
              >
                <Text
                  className={`text-caption ${selected ? "font-semibold text-on-inverse" : "text-content-primary"}`}
                >
                  {f.time(new Date(2000, 0, 1, h, 0))}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
