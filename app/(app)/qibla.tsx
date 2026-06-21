import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, Text } from "@/components";
import { QiblaCompass } from "@/components/qibla/QiblaCompass";
import { useQibla } from "@/hooks/useQibla";
import { useFormat } from "@/lib/i18n/format";
import { normalizeDegrees } from "@/lib/qibla";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";

const OCTANTS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;

export default function QiblaScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const focused = useIsFocused();
  const { coords, permission, requestLocation } = useLocation();
  const qibla = useQibla(focused);

  // Ensure we have a location to compute the bearing from.
  useEffect(() => {
    if (!coords && permission !== "denied") void requestLocation();
  }, [coords, permission, requestLocation]);

  const back = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
      <Feather name="arrow-left" size={22} color={c["text-primary"]} />
    </Pressable>
  );

  if (!qibla.hasCoords) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("qibla.title")} left={back} />
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Feather name="compass" size={40} color={c["text-muted"]} />
          <Text variant="heading" className="text-center">
            {t("qibla.needLocationTitle")}
          </Text>
          <Text variant="caption" className="text-center text-content-secondary">
            {t("qibla.needLocationCaption")}
          </Text>
          <Button label={t("home.enableLocation")} onPress={() => void requestLocation()} />
        </View>
      </SafeAreaView>
    );
  }

  const warn = qibla.needsCalibration;
  const octant = OCTANTS[Math.round(normalizeDegrees(qibla.bearing ?? 0) / 45) % 8];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("qibla.title")} left={back} />

      <View className="flex-1 items-center justify-center gap-5 px-6">
        {/* Accuracy chip */}
        <View
          style={{ backgroundColor: warn ? "#F7E7E6" : "#E8F1EC" }}
          className="flex-row items-center gap-1.5 rounded-full px-3.5 py-[7px]"
        >
          <Feather
            name={warn ? "alert-triangle" : "check-circle"}
            size={13}
            color={warn ? "#C2453E" : "#0E6B4F"}
          />
          <Text style={{ color: warn ? "#C2453E" : "#0E6B4F" }} className="text-caption font-semibold">
            {warn ? t("qibla.unreliable") : t("qibla.calibrated")}
          </Text>
        </View>

        {/* Compass */}
        <QiblaCompass heading={qibla.heading ?? 0} relativeAngle={qibla.relativeAngle ?? 0} dimmed={warn} />

        {/* Calibration card — only while the heading is unreliable */}
        {warn ? (
          <View
            style={{ backgroundColor: "#F4EDDB" }}
            className="w-full items-center gap-2 rounded-2xl px-5 py-[18px]"
          >
            <MaterialCommunityIcons name="infinity" size={32} color="#B98E2F" />
            <Text className="text-base font-bold text-content-primary">{t("qibla.calibrateTitle")}</Text>
            <Text variant="caption" className="text-center text-content-secondary">
              {t("qibla.calibrateHint")}
            </Text>
          </View>
        ) : null}

        {/* Readout */}
        <View className="items-center gap-1">
          <Text variant="display" className="text-[40px]">
            {qibla.bearing != null ? `${f.number(Math.round(qibla.bearing))}°` : "—"}
          </Text>
          <Text variant="caption" className="text-content-secondary">
            {warn ? t("qibla.directionUncertain") : `${t(`qibla.directions.${octant}`)} · ${t("qibla.kaabaSharif")}`}
          </Text>
        </View>

        {/* Offline note */}
        <View className="flex-row items-center gap-1.5">
          <Feather name="wifi-off" size={13} color={c["text-muted"]} />
          <Text variant="caption" className="text-content-muted">
            {t("qibla.worksOffline")}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
