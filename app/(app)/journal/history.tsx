import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Banner, Button, EmptyState, Text } from "@/components";
import { useJournalHistory } from "@/hooks/useJournal";
import { isOfflineQuery } from "@/lib/api/errors";
import { parseIso } from "@/lib/journal/dates";
import { isCompleteDay, loggedPrayerCount, type JournalEntry } from "@/lib/journal/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** 101 Journal History — paginated list of past days; tap a day for detail. */
export default function JournalHistoryScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useLoginGate();
  const q = useJournalHistory();
  const offline = isOfflineQuery(q);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("journal.history.title")} left={<BackButton />} />
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

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("journal.history.title")} left={<BackButton />} />
      <FlatList
        data={items}
        keyExtractor={(e) => e.entry_date}
        contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (q.hasNextPage && !q.isFetchingNextPage) void q.fetchNextPage();
        }}
        ListHeaderComponent={
          offline ? (
            <View className="pb-2">
              <Banner
                variant="warning"
                icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
                message={t("journal.offline.subtitle")}
              />
            </View>
          ) : null
        }
        renderItem={({ item }) => <DayRow entry={item} />}
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          q.isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : offline ? null : (
            <View className="items-center px-6 py-12">
              <EmptyState
                icon={<Feather name="clock" size={26} color={c.primary} />}
                title={t("journal.history.empty")}
              />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

function DayRow({ entry }: { entry: JournalEntry }) {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const count = loggedPrayerCount(entry.prayers);
  const complete = isCompleteDay(entry.prayers);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/journal/[date]", params: { date: entry.entry_date } })}
      className="flex-row items-center gap-3 rounded-md border border-border bg-surface p-4 active:bg-primary-soft"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: complete ? c["primary-soft"] : "#EDEFEC" }}
      >
        <Feather
          name={complete ? "check" : "circle"}
          size={18}
          color={complete ? c.primary : c["text-muted"]}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="body" className="font-semibold">
          {f.dateUtc(parseIso(entry.entry_date))}
        </Text>
        <Text variant="caption" className="text-content-muted">
          {t("badges.progress", { current: f.number(count), target: f.number(5) })}
          {entry.quran ? ` · ${f.number(entry.quran.amount)} ${t(`journal.units.${entry.quran.unit}`)}` : ""}
        </Text>
      </View>
      {entry.is_protected ? <Feather name="shield" size={16} color="#4A7FA5" /> : null}
      <Feather name="chevron-right" size={20} color={c["text-muted"]} />
    </Pressable>
  );
}
