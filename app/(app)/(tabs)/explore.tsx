import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Banner,
  Button,
  EmptyState,
  Fab,
  FilterChip,
  NearControl,
  SearchBar,
  SectionHeader,
  ViewToggle,
} from "@/components";
import { FilterSheet } from "@/components/discovery/FilterSheet";
import { MasjidMap } from "@/components/discovery/MasjidMap";
import { MasjidPeekSheet } from "@/components/discovery/MasjidPeekSheet";
import { NearbyMasjidRow } from "@/components/discovery/NearbyMasjidRow";
import { NearestMasjidCardLive } from "@/components/discovery/NearestMasjidCardLive";
import { useFavourites } from "@/hooks/useFavourites";
import { useNearbyMasjids } from "@/hooks/useNearbyMasjids";
import { useRecentMasjids } from "@/hooks/useRecentMasjids";
import { getCityById } from "@/lib/location/cities";
import type { MasjidFacilityFilters, MasjidNearbyResult } from "@/lib/masjids/types";
import { openDirections } from "@/lib/masjids/directions";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** Distance filter chips → search radius in metres. */
const DISTANCE_OPTIONS = [1000, 2000, 5000] as const;
const DEFAULT_RADIUS_M = 5000;

export default function ExploreTab() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { coords, permission, source, cityId, isResolving, requestLocation, refresh } =
    useLocation();
  const { requireAuth } = useLoginGate();

  const [view, setView] = useState<"map" | "list">("map");
  const [radiusM, setRadiusM] = useState<number>(DEFAULT_RADIUS_M);
  const [filters, setFilters] = useState<MasjidFacilityFilters>({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [selected, setSelected] = useState<MasjidNearbyResult | null>(null);

  const nearby = useNearbyMasjids(coords, { radiusM, filters });
  const { isFavourite, toggle } = useFavourites();
  const { recordView } = useRecentMasjids();

  const results = nearby.data ?? [];
  const hasFilters = Object.values(filters).some(Boolean);
  const activeCity = getCityById(cityId);
  // Nearest = closest of the already-loaded results (no second nearby query).
  const nearest =
    results.length > 0
      ? results.reduce((min, m) => (m.distance_m < min.distance_m ? m : min))
      : null;

  const openMasjid = (id: string) => {
    recordView(id);
    router.push({ pathname: "/masjid/[id]", params: { id } });
  };

  const locate = async () => {
    if (permission === "granted") await refresh();
    else await requestLocation();
  };

  // No resolved location yet (undetermined/denied with no city) — prompt.
  if (!coords) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="map-pin" size={28} color={c.primary} />}
            title={t("discovery.enableLocation.title")}
            caption={t("discovery.enableLocation.caption")}
            action={
              <View className="w-full gap-2 pt-1">
                <Button
                  label={t("discovery.enableLocation.cta")}
                  onPress={() => void requestLocation()}
                  disabled={isResolving}
                />
                <Button
                  variant="text"
                  label={t("discovery.enableLocation.pickCity")}
                  onPress={() => router.push("/city-picker")}
                />
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const header = (
    <View className="gap-2.5 px-4 pb-2 pt-1">
      <View className="flex-row items-center gap-2.5">
        <Pressable className="flex-1" onPress={() => router.push("/search")} accessibilityRole="search">
          <View pointerEvents="none">
            <SearchBar
              editable={false}
              placeholder={t("discovery.searchPlaceholder")}
              leftIcon={<Feather name="search" size={18} color={c["text-muted"]} />}
            />
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("discovery.mySubmissions.title")}
          onPress={() => requireAuth(() => router.push("/my-submissions"), "submit")}
          className="h-[52px] w-[52px] items-center justify-center rounded-[26px] border border-border bg-surface"
        >
          <Feather name="list" size={20} color={c["text-secondary"]} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-2"
      >
        <NearControl
          label={
            activeCity
              ? i18n.language === "bn"
                ? activeCity.nameBn
                : activeCity.nameEn
              : t("discovery.nearby")
          }
          icon={<Feather name="map-pin" size={14} color={c.primary} />}
          trailing={<Feather name="chevron-down" size={14} color={c["text-muted"]} />}
          onPress={() => router.push("/city-picker")}
        />
        <FilterChip
          label={t("discovery.filters")}
          selected={hasFilters}
          icon={
            <Feather name="sliders" size={14} color={hasFilters ? c.primary : c["text-secondary"]} />
          }
          onPress={() => setFilterVisible(true)}
        />
        {DISTANCE_OPTIONS.map((m) => (
          <FilterChip
            key={m}
            label={t("discovery.distanceKm", { km: m / 1000 })}
            selected={radiusM === m}
            onPress={() => setRadiusM(m)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const bottomOverlay = (
    <>
      <View pointerEvents="box-none" className="absolute inset-x-0 bottom-5 items-center">
        <ViewToggle
          value={view}
          onChange={(key) => setView(key as "map" | "list")}
          options={[
            {
              key: "map",
              label: t("discovery.view.map"),
              icon: (active) => (
                <Feather name="map" size={14} color={active ? c["on-inverse"] : c["text-secondary"]} />
              ),
            },
            {
              key: "list",
              label: t("discovery.view.list"),
              icon: (active) => (
                <Feather name="list" size={14} color={active ? c["on-inverse"] : c["text-secondary"]} />
              ),
            },
          ]}
        />
      </View>
      <View pointerEvents="box-none" className="absolute bottom-5 right-4 gap-3">
        <Fab
          icon={<Feather name="plus" size={24} color={c["on-inverse"]} />}
          accessibilityLabel={t("discovery.submitMasjid")}
          onPress={() => requireAuth(() => router.push("/submit-masjid"), "submit")}
        />
        <Fab
          icon={<Feather name="navigation" size={22} color={c["on-inverse"]} />}
          accessibilityLabel={t("discovery.enableLocation.cta")}
          onPress={() => void locate()}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {header}
      {source === "city" && activeCity ? (
        <View className="px-4 pb-2">
          <Banner
            variant="warning"
            icon={<Feather name="map-pin" size={15} color="#8A6A1F" />}
            message={t("discovery.locationDenied", { city: activeCity.nameBn })}
          />
        </View>
      ) : null}

      {view === "map" ? (
        <View className="flex-1">
          <MasjidMap
            results={results}
            center={coords}
            selectedId={selected?.masjid_id ?? null}
            onSelect={setSelected}
            onDeselect={() => setSelected(null)}
            showsUserLocation={permission === "granted"}
          />
          {nearby.isLoading ? (
            <View pointerEvents="none" className="absolute inset-x-0 top-3 items-center">
              <View className="rounded-full bg-surface px-4 py-2">
                <ActivityIndicator color={c.primary} />
              </View>
            </View>
          ) : null}
          {bottomOverlay}
        </View>
      ) : (
        <View className="flex-1">
          {nearby.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : (
            <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-28">
              <NearestMasjidCardLive masjid={nearest} />
              {nearby.isError && results.length > 0 ? (
                <Banner
                  variant="warning"
                  icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
                  message={t("discovery.offline")}
                />
              ) : null}

              {(() => {
                const favs = results.filter((m) => isFavourite(m.masjid_id));
                return favs.length > 0 ? (
                  <View className="gap-2">
                    <SectionHeader title={t("discovery.favourites")} />
                    {favs.map((m) => (
                      <NearbyMasjidRow
                        key={`fav-${m.masjid_id}`}
                        masjid={m}
                        isFavourite
                        onToggleFavourite={() => toggle(m.masjid_id)}
                        onPress={() => openMasjid(m.masjid_id)}
                      />
                    ))}
                  </View>
                ) : null;
              })()}

              <View className="gap-2">
                <SectionHeader title={t("discovery.nearby")} />
                {results.length === 0 ? (
                  <EmptyState
                    icon={<Feather name="search" size={26} color={c.primary} />}
                    title={t("discovery.empty.title")}
                    caption={t("discovery.empty.caption")}
                  />
                ) : (
                  results.map((m) => (
                    <NearbyMasjidRow
                      key={m.masjid_id}
                      masjid={m}
                      isFavourite={isFavourite(m.masjid_id)}
                      onToggleFavourite={() => toggle(m.masjid_id)}
                      onPress={() => openMasjid(m.masjid_id)}
                    />
                  ))
                )}
              </View>
            </ScrollView>
          )}
          {bottomOverlay}
        </View>
      )}

      <MasjidPeekSheet
        masjid={selected}
        isFavourite={selected ? isFavourite(selected.masjid_id) : false}
        onToggleFavourite={() => selected && toggle(selected.masjid_id)}
        onClose={() => setSelected(null)}
        onDirections={() => selected && void openDirections(selected.latitude, selected.longitude)}
        onViewDetails={() => {
          if (selected) {
            const id = selected.masjid_id;
            setSelected(null);
            openMasjid(id);
          }
        }}
      />
      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}
