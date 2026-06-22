import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppBar,
  BackButton,
  Banner,
  BottomSheet,
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  Input,
  PrayerLogRow,
  Row,
  SegmentedControl,
  Stepper,
  StreakCard,
  Text,
} from "@/components";
import { useJournalEntry, useLogPrayers, useLogQuran, useSaveJournalNote } from "@/hooks/useJournal";
import { useBadgeCelebration } from "@/hooks/useBadges";
import { useMilestoneWatch, useStreak } from "@/hooks/useStreak";
import { isOfflineQuery } from "@/lib/api/errors";
import { fetchCheckInHistory } from "@/lib/checkins/api";
import { dhakaToday } from "@/lib/journal/dates";
import { PRAYER_KEYS, QURAN_UNITS, type PrayerKey, type QuranLog, type QuranUnit } from "@/lib/journal/types";
import { useFormat } from "@/lib/i18n/format";
import { qk } from "@/lib/query/keys";
import { stripReflectionBlock } from "@/lib/reflection/compute";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

const QURAN_MAX: Record<QuranUnit, number> = { pages: 604, juz: 30, minutes: 1440 };

/** 96 Log Qur'an — a bottom sheet with a unit segmented control + stepper. */
function LogQuranSheet({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: QuranLog | null;
  onClose: () => void;
  onSave: (q: QuranLog | null) => void;
}) {
  const { t } = useTranslation();
  const f = useFormat();
  const [unit, setUnit] = useState<QuranUnit>(initial?.unit ?? "pages");
  const [amount, setAmount] = useState(initial?.amount ?? 0);

  useEffect(() => {
    if (visible) {
      setUnit(initial?.unit ?? "pages");
      setAmount(initial?.amount ?? 0);
    }
  }, [visible, initial?.unit, initial?.amount]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="gap-4">
        <Text variant="heading">{t("journal.quranLog")}</Text>
        <SegmentedControl
          fill
          value={unit}
          onChange={(k) => setUnit(k as QuranUnit)}
          options={QURAN_UNITS.map((u) => ({ key: u, label: t(`journal.units.${u}`) }))}
        />
        <View className="flex-row items-center justify-between">
          <Text variant="body" className="text-content-secondary">
            {t(`journal.units.${unit}`)}
          </Text>
          <Stepper
            value={amount}
            min={0}
            max={QURAN_MAX[unit]}
            onChange={setAmount}
            format={(v) => f.number(v)}
          />
        </View>
        <Button label={t("journal.save")} onPress={() => onSave(amount > 0 ? { amount, unit } : null)} />
      </View>
    </BottomSheet>
  );
}

/** 95 Check-in Prefill — offer to log a congregational prayer after a check-in. */
function CheckinPrefillSheet({
  visible,
  masjidName,
  unlogged,
  onClose,
  onPick,
}: {
  visible: boolean;
  masjidName: string | null;
  unlogged: PrayerKey[];
  onClose: () => void;
  onPick: (k: PrayerKey) => void;
}) {
  const { t } = useTranslation();
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="gap-3">
        <Text variant="heading">{t("journal.checkinPrefill.title")}</Text>
        <Text variant="body" className="text-content-secondary">
          {masjidName ?? t("common.brand")}
        </Text>
        <View className="flex-row flex-wrap gap-2 pt-1">
          {unlogged.map((k) => (
            <Chip key={k} label={t(`prayers.${k}`)} onPress={() => onPick(k)} />
          ))}
        </View>
        <Button variant="text" label={t("journal.checkinPrefill.dismiss")} onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

/** 93 Journal – Today. The gamification hub: prayer log, Qur'an, note, streak. */
export default function JournalTodayScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const today = dhakaToday();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useLoginGate();

  const entryQuery = useJournalEntry(today);
  const streak = useStreak();
  const logPrayers = useLogPrayers(today);
  const logQuran = useLogQuran(today);
  const saveNote = useSaveJournalNote(today);

  const entry = entryQuery.data;
  const offline = isOfflineQuery(entryQuery);

  // Celebration watchers (display-only; the server has no milestone/badge push).
  const milestone = useMilestoneWatch();
  const badge = useBadgeCelebration();
  useEffect(() => {
    if (milestone.pending != null) {
      router.push({ pathname: "/milestone", params: { days: String(milestone.pending) } });
      milestone.acknowledge();
    }
  }, [milestone.pending]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Defer the badge celebration while a milestone is still pending so the two
    // watchers don't push both modals in the same commit (which races the
    // navigator); once the milestone is acknowledged this re-runs.
    if (badge.pending && milestone.pending == null) {
      router.push({
        pathname: "/badge-earned",
        params: { type: badge.pending.badge_type, tier: String(badge.pending.tier) },
      });
      badge.acknowledge();
    }
  }, [badge.pending, milestone.pending]); // eslint-disable-line react-hooks/exhaustive-deps

  // Note editor (server note minus any embedded weekly-reflection block).
  const dailyNote = stripReflectionBlock(entry?.notes);
  const [noteDraft, setNoteDraft] = useState(dailyNote);
  useEffect(() => setNoteDraft(stripReflectionBlock(entry?.notes)), [entry?.notes]);

  // Qur'an sheet + un-log dialog state.
  const [quranOpen, setQuranOpen] = useState(false);
  const [unlogTarget, setUnlogTarget] = useState<PrayerKey | null>(null);

  // Check-in prefill: auto-offer when the latest check-in is today.
  const checkins = useQuery({
    queryKey: qk.checkins.mine(),
    queryFn: () => fetchCheckInHistory({ page_size: 1 }),
    enabled: isAuthenticated,
  });
  const latestCheckin = checkins.data?.items[0];
  const checkedToday = latestCheckin ? dhakaToday(new Date(latestCheckin.checked_in_at)) === today : false;
  const unlogged = entry ? PRAYER_KEYS.filter((k) => !entry.prayers[k]) : [];
  const [prefillDismissed, setPrefillDismissed] = useState(false);
  const showPrefill = checkedToday && !prefillDismissed && unlogged.length > 0;

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("journal.title")} left={<BackButton />} />
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="book-open" size={28} color={c.primary} />}
            title={t("journal.guest.title")}
            caption={t("journal.guest.subtitle")}
            action={<Button label={t("journal.guest.cta")} onPress={() => requireAuth(() => {}, "generic")} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const prayerRows = PRAYER_KEYS.map((k) => ({
    key: k,
    label: t(`prayers.${k}`),
    logged: !!entry?.prayers[k],
  }));

  const onToggle = (key: string) => {
    const k = key as PrayerKey;
    if (entry?.prayers[k]) setUnlogTarget(k);
    else logPrayers.mutate({ [k]: true });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar
        title={t("journal.today")}
        left={<BackButton />}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("journal.setup.title")}
            onPress={() => router.push("/journal-setup")}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center"
          >
            <Feather name="settings" size={20} color={c["text-primary"]} />
          </Pressable>
        }
      />

      {entryQuery.isLoading && !entry ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-10">
          {offline ? (
            <Banner
              variant="warning"
              icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
              message={t("journal.offline.subtitle")}
            />
          ) : null}

          {/* Streak — tap through to the detail. */}
          <Pressable accessibilityRole="button" onPress={() => router.push("/streak")}>
            <StreakCard
              streak={f.number(streak.data?.current ?? 0)}
              unit={t("journal.streakLabel")}
              longest={
                streak.data && streak.data.longest > 0
                  ? `${t("streak.longest")} · ${f.number(streak.data.longest)}`
                  : undefined
              }
              flameIcon={<Feather name="zap" size={24} color={c.primary} />}
              freezeLabel={
                streak.data && streak.data.freezes_held > 0 ? f.number(streak.data.freezes_held) : undefined
              }
              freezeIcon={<Feather name="shield" size={14} color="#4A7FA5" />}
            />
          </Pressable>

          {/* Prayer log */}
          <PrayerLogRow title={t("journal.prayersTitle")} prayers={prayerRows} onToggle={onToggle} />

          {/* Qur'an */}
          <Card>
            <Row
              icon={<Feather name="book" size={18} color={c["accent-gold"]} />}
              title={t("journal.quranTitle")}
              value={
                entry?.quran
                  ? t("journal.quranAmount", {
                      amount: f.number(entry.quran.amount),
                      unit: t(`journal.units.${entry.quran.unit}`),
                    })
                  : t("journal.quranNone")
              }
              trailing={<Feather name="chevron-right" size={20} color={c["text-muted"]} />}
              onPress={() => setQuranOpen(true)}
            />
          </Card>

          {/* Daily note */}
          <View className="gap-2">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("journal.notesTitle")}
            </Text>
            <Input
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder={t("journal.notePlaceholder")}
              multiline
              numberOfLines={3}
            />
            {noteDraft !== dailyNote ? (
              <Button
                variant="secondary"
                label={t("journal.save")}
                onPress={() => saveNote.mutate(noteDraft)}
              />
            ) : null}
          </View>

          <Card>
            <Row
              icon={<Feather name="clock" size={18} color={c["text-secondary"]} />}
              title={t("journal.viewHistory")}
              trailing={<Feather name="chevron-right" size={20} color={c["text-muted"]} />}
              onPress={() => router.push("/journal/history")}
            />
            <Row
              icon={<Feather name="edit-3" size={18} color={c["accent-gold"]} />}
              title={t("reflection.title")}
              trailing={<Feather name="chevron-right" size={20} color={c["text-muted"]} />}
              onPress={() => router.push("/weekly-reflection")}
            />
          </Card>
        </ScrollView>
      )}

      <LogQuranSheet
        visible={quranOpen}
        initial={entry?.quran ?? null}
        onClose={() => setQuranOpen(false)}
        onSave={(q) => {
          logQuran.mutate(q);
          setQuranOpen(false);
        }}
      />

      <CheckinPrefillSheet
        visible={showPrefill}
        masjidName={latestCheckin?.masjid_name ?? null}
        unlogged={unlogged}
        onClose={() => setPrefillDismissed(true)}
        onPick={(k) => {
          logPrayers.mutate({ [k]: true });
          setPrefillDismissed(true);
        }}
      />

      <Dialog
        visible={unlogTarget !== null}
        onClose={() => setUnlogTarget(null)}
        title={unlogTarget ? t("journal.unlog.title", { prayer: t(`prayers.${unlogTarget}`) }) : undefined}
        description={unlogTarget ? t("journal.unlog.body", { prayer: t(`prayers.${unlogTarget}`) }) : undefined}
      >
        <View className="flex-row justify-end gap-2 pt-1">
          <Button variant="text" label={t("common.cancel")} onPress={() => setUnlogTarget(null)} />
          <Button
            variant="text"
            label={t("journal.unlog.confirm")}
            onPress={() => {
              if (unlogTarget) logPrayers.mutate({ [unlogTarget]: false });
              setUnlogTarget(null);
            }}
          />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}
