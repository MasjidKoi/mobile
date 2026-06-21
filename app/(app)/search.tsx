import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState, MasjidRow, SearchBar, SectionHeader } from "@/components";
import { useRecentMasjids } from "@/hooks/useRecentMasjids";
import { useSearchMasjids } from "@/hooks/useSearchMasjids";
import { useFormat } from "@/lib/i18n/format";
import type { MasjidSearchResult } from "@/lib/masjids/types";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

/** 16 Search — debounced masjid/area search (distance-biased when location is known). */
export default function SearchScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { coords } = useLocation();
  const { recordView } = useRecentMasjids();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const search = useSearchMasjids(debounced, coords);
  const trimmed = debounced.trim();
  const results = search.data ?? [];

  const open = (id: string) => {
    recordView(id);
    router.push({ pathname: "/masjid/[id]", params: { id } });
  };

  const renderRow = (m: MasjidSearchResult) => (
    <MasjidRow
      key={m.masjid_id}
      name={m.name}
      meta={
        m.distance_m != null
          ? `${m.admin_region} · ${f.distance(m.distance_m)}`
          : m.admin_region
      }
      thumb={<Feather name="home" size={24} color={c.primary} />}
      verified={m.verified ? <Feather name="check-circle" size={14} color={c.primary} /> : null}
      trailing={<Feather name="chevron-right" size={18} color={c["text-muted"]} />}
      onPress={() => open(m.masjid_id)}
    />
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <View className="flex-row items-center gap-2 px-4 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color={c["text-primary"]} />
        </Pressable>
        <View className="flex-1">
          <SearchBar
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={t("discovery.searchPlaceholder")}
            returnKeyType="search"
            leftIcon={<Feather name="search" size={18} color={c["text-muted"]} />}
            rightIcon={
              query.length > 0 ? (
                <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel={t("common.close")}>
                  <Feather name="x" size={18} color={c["text-muted"]} />
                </Pressable>
              ) : undefined
            }
          />
        </View>
      </View>

      {trimmed.length < MIN_CHARS ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            variant="plain"
            icon={<Feather name="search" size={26} color={c.primary} />}
            title={t("discovery.search.title")}
            caption={t("discovery.search.hint")}
          />
        </View>
      ) : search.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            variant="plain"
            icon={<Feather name="search" size={26} color={c.primary} />}
            title={t("discovery.search.noResults", { query: trimmed })}
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-2 px-4 py-2 pb-8" keyboardShouldPersistTaps="handled">
          <SectionHeader title={t("discovery.search.results")} />
          {results.map(renderRow)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
