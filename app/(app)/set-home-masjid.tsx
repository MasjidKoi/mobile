import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, EmptyState, Text } from "@/components";
import { useHomeMasjid } from "@/hooks/useHomeMasjid";
import { useNearbyMasjids } from "@/hooks/useNearbyMasjids";
import { useFormat } from "@/lib/i18n/format";
import type { MasjidNearbyResult } from "@/lib/masjids/types";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";

export default function SetHomeMasjidScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { coords, permission, requestLocation } = useLocation();
  const nearby = useNearbyMasjids(coords);
  const { homeMasjid, setHomeMasjid, clearHomeMasjid } = useHomeMasjid();

  const choose = (m: MasjidNearbyResult) => {
    setHomeMasjid({
      masjidId: m.masjid_id,
      name: m.name,
      coords: { lat: m.latitude, lng: m.longitude },
    });
    router.back();
  };

  const close = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
      <Feather name="x" size={22} color={c["text-primary"]} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("setHome.title")} left={close} />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        <Text variant="caption" className="text-content-secondary">
          {t("setHome.subtitle")}
        </Text>

        {homeMasjid ? (
          <View className="flex-row items-center gap-3 rounded-md border border-primary bg-primary-soft px-4 py-3">
            <Feather name="home" size={18} color={c.primary} />
            <Text className="flex-1 text-body font-semibold text-content-primary" numberOfLines={1}>
              {homeMasjid.name}
            </Text>
            <Pressable onPress={() => clearHomeMasjid()}>
              <Text className="text-caption font-semibold text-error">{t("setHome.clear")}</Text>
            </Pressable>
          </View>
        ) : null}

        {!coords ? (
          <EmptyState
            icon={<Feather name="map-pin" size={26} color={c.primary} />}
            title={t("home.needsLocationTitle")}
            caption={t("home.needsLocationCaption")}
            action={
              permission === "denied" ? (
                <Button label={t("home.pickCity")} variant="secondary" onPress={() => router.push("/city-picker")} />
              ) : (
                <Button label={t("home.enableLocation")} onPress={() => void requestLocation()} />
              )
            }
          />
        ) : nearby.isLoading ? (
          <ActivityIndicator color={c.primary} className="mt-6" />
        ) : (nearby.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Feather name="search" size={26} color={c.primary} />}
            title={t("setHome.emptyTitle")}
            caption={t("setHome.emptyCaption")}
          />
        ) : (
          <View className="overflow-hidden rounded-md border border-border bg-surface">
            {nearby.data?.map((m, i) => (
              <Pressable
                key={m.masjid_id}
                onPress={() => choose(m)}
                className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-primary-soft${i > 0 ? " border-t border-border" : ""}`}
              >
                <Feather name="map-pin" size={16} color={c["text-muted"]} />
                <View className="flex-1 gap-0.5">
                  <Text className="text-body font-medium text-content-primary" numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Text className="text-caption text-content-secondary" numberOfLines={1}>
                    {m.address}
                  </Text>
                </View>
                <Text className="text-caption font-semibold text-primary">{f.distance(m.distance_m)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
