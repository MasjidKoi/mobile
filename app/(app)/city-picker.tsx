import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, ListItem, SearchBar, Text } from "@/components";
import { CITIES } from "@/lib/location/cities";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";

/** 11 City Picker — location-denied fallback: pick a city centre or grant GPS. */
export default function CityPickerScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { setCity, requestLocation } = useLocation();
  const [query, setQuery] = useState("");

  const cityName = (city: (typeof CITIES)[number]) =>
    i18n.language === "bn" ? city.nameBn : city.nameEn;

  const q = query.trim().toLowerCase();
  const cities = q
    ? CITIES.filter(
        (city) =>
          city.nameEn.toLowerCase().includes(q) || city.nameBn.includes(query.trim()),
      )
    : CITIES;

  const pick = async (id: string) => {
    await setCity(id);
    router.back();
  };

  const selectCurrentLocation = async () => {
    await requestLocation();
    router.back();
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <AppBar
        title={t("discovery.cityPicker.title")}
        className="bg-surface"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8" keyboardShouldPersistTaps="handled">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t("discovery.cityPicker.placeholder")}
          leftIcon={<Feather name="search" size={18} color={c["text-muted"]} />}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => void selectCurrentLocation()}
          className="flex-row items-center gap-3 rounded-md border border-primary bg-primary-soft px-4 py-3.5 active:opacity-80"
        >
          <Feather name="navigation" size={18} color={c.primary} />
          <Text variant="body" className="font-semibold text-primary">
            {t("discovery.cityPicker.useCurrent")}
          </Text>
        </Pressable>

        <Card>
          {cities.map((city) => (
            <ListItem
              key={city.id}
              title={cityName(city)}
              leading={<Feather name="map-pin" size={18} color={c["text-secondary"]} />}
              trailing={<Feather name="chevron-right" size={18} color={c["text-muted"]} />}
              onPress={() => void pick(city.id)}
            />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
