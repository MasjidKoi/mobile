import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Banner, Button, Card, Input, PrayerLogRow, Row, Text } from "@/components";
import { useJournalEntry, useLogPrayers, useSaveJournalNote } from "@/hooks/useJournal";
import { dhakaToday, isFinalized, parseIso } from "@/lib/journal/dates";
import { PRAYER_KEYS, type PrayerKey } from "@/lib/journal/types";
import { useFormat } from "@/lib/i18n/format";
import { stripReflectionBlock } from "@/lib/reflection/compute";
import { useColors } from "@/lib/theme/useColors";

/** 102 Day Detail — one past day's prayers/Qur'an/note. Prayers are editable
 * only until the day finalizes (noon Dhaka, D+1); notes stay editable. */
export default function DayDetailScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { date } = useLocalSearchParams<{ date: string }>();
  const day = date ?? dhakaToday();

  const entryQuery = useJournalEntry(day);
  const logPrayers = useLogPrayers(day);
  const saveNote = useSaveJournalNote(day);
  const entry = entryQuery.data;
  const finalized = isFinalized(day);

  const dailyNote = stripReflectionBlock(entry?.notes);
  const [noteDraft, setNoteDraft] = useState(dailyNote);
  useEffect(() => setNoteDraft(stripReflectionBlock(entry?.notes)), [entry?.notes]);

  const prayerRows = PRAYER_KEYS.map((k) => ({
    key: k,
    label: t(`prayers.${k}`),
    logged: !!entry?.prayers[k],
  }));

  const onToggle = finalized
    ? undefined
    : (key: string) => {
        const k = key as PrayerKey;
        logPrayers.mutate({ [k]: !entry?.prayers[k] });
      };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={f.dateUtc(parseIso(day))} left={<BackButton />} />
      {entryQuery.isLoading && !entry ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-10">
          {finalized ? (
            <Banner
              variant="info"
              icon={<Feather name="lock" size={15} color={c["text-secondary"]} />}
              message={t("journal.day.locked")}
            />
          ) : null}

          <PrayerLogRow title={t("journal.day.prayers")} prayers={prayerRows} onToggle={onToggle} />

          <Card>
            <Row
              icon={<Feather name="book" size={18} color={c["accent-gold"]} />}
              title={t("journal.day.quran")}
              value={
                entry?.quran
                  ? t("journal.quranAmount", {
                      amount: f.number(entry.quran.amount),
                      unit: t(`journal.units.${entry.quran.unit}`),
                    })
                  : t("journal.quranNone")
              }
            />
          </Card>

          <View className="gap-2">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("journal.day.notes")}
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
