import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, Button, Text } from "@/components";
import { useQibla } from "@/hooks/useQibla";
import { useFormat } from "@/lib/i18n/format";
import { normalizeDegrees } from "@/lib/qibla";
import { useColors } from "@/lib/theme/useColors";
import { useLocation } from "@/providers/LocationProvider";

const DIAL = 280;
const CARDINALS: { key: string; angle: number }[] = [
  { key: "qibla.compass.n", angle: 0 },
  { key: "qibla.compass.e", angle: 90 },
  { key: "qibla.compass.s", angle: 180 },
  { key: "qibla.compass.w", angle: 270 },
];

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

  const headingDeg = qibla.heading ?? 0;
  const relative = qibla.relativeAngle ?? 0;

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

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("qibla.title")} left={back} />

      <View className="flex-1 items-center justify-center gap-7 px-6">
        {/* Accuracy badge */}
        <View
          className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
            qibla.needsCalibration ? "bg-accent-gold-soft" : "bg-primary-soft"
          }`}
        >
          <Feather
            name={qibla.needsCalibration ? "alert-triangle" : "check-circle"}
            size={13}
            color={qibla.needsCalibration ? "#8A6A1F" : c.primary}
          />
          <Text
            className={`text-caption font-semibold ${
              qibla.needsCalibration ? "text-[#8A6A1F]" : "text-primary"
            }`}
          >
            {qibla.needsCalibration ? t("qibla.unreliable") : t("qibla.calibrated")}
          </Text>
        </View>

        {/* Compass */}
        <View
          style={{ width: DIAL, height: DIAL, borderRadius: DIAL / 2 }}
          className="items-center justify-center border border-border bg-surface"
        >
          {/* Rotating cardinal ring (turns with the device so N points to true north) */}
          <View
            style={{ width: DIAL, height: DIAL, transform: [{ rotate: `${-headingDeg}deg` }] }}
            className="absolute items-center justify-center"
          >
            {CARDINALS.map((card) => (
              <View
                key={card.key}
                style={{ position: "absolute", width: DIAL, height: DIAL, transform: [{ rotate: `${card.angle}deg` }] }}
                className="items-center"
              >
                <Text className={`mt-2 text-caption font-semibold ${card.angle === 0 ? "text-error" : "text-content-muted"}`}>
                  {t(card.key)}
                </Text>
              </View>
            ))}
          </View>

          {/* Kaaba target — fixed at the top: rotate the phone until the needle points here */}
          <View className="absolute top-3 items-center gap-0.5">
            <View className="h-5 w-5 rounded-[3px] bg-[#182420]" />
            <Text variant="micro" className="text-content-muted">
              {t("qibla.kaaba")}
            </Text>
          </View>

          {/* Needle — a centered vertical bar rotated to point toward the Qibla */}
          <View
            style={{ width: DIAL, height: DIAL, transform: [{ rotate: `${relative}deg` }] }}
            className="absolute items-center"
          >
            <View className="mt-6 h-[120px] w-1.5 rounded-full bg-primary" />
          </View>
          <View className="absolute h-4 w-4 rounded-full bg-primary" />
        </View>

        {/* Degrees */}
        <View className="items-center gap-1">
          <Text variant="display" className="text-[40px]">
            {qibla.bearing != null ? `${f.number(Math.round(qibla.bearing))}°` : "—"}
          </Text>
          <Text variant="caption" className="text-content-secondary">
            {t(`qibla.compass.${["n", "ne", "e", "se", "s", "sw", "w", "nw"][Math.round(normalizeDegrees(qibla.bearing ?? 0) / 45) % 8]}`)}
          </Text>
        </View>

        {/* Calibration hint */}
        {qibla.needsCalibration ? (
          <Banner
            variant="warning"
            icon={<Feather name="rotate-cw" size={15} color="#8A6A1F" />}
            message={t("qibla.calibrateHint")}
          />
        ) : (
          <View className="flex-row items-center gap-1.5">
            <Feather name="rotate-cw" size={13} color={c["text-muted"]} />
            <Text variant="caption" className="text-content-muted">
              {t("qibla.rotateHint")}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
