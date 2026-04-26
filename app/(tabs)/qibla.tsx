import { Magnetometer, type MagnetometerMeasurement } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function getHeadingFromMagnetometer(data: MagnetometerMeasurement) {
  const angle = Math.atan2(data.y, data.x);
  const heading = angle >= 0 ? angle : angle + 2 * Math.PI;
  return (heading * 180) / Math.PI;
}

function getCardinalDirection(heading: number) {
  if (heading >= 315 || heading < 45) return "North";
  if (heading >= 45 && heading < 135) return "East";
  if (heading >= 135 && heading < 225) return "South";
  return "West";
}

export default function QiblaScreen() {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    Magnetometer.setUpdateInterval(150);

    const subscription = Magnetometer.addListener((data) => {
      setHeading(getHeadingFromMagnetometer(data));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const roundedHeading = useMemo(() => {
    if (heading === null) return null;
    return Math.round(heading);
  }, [heading]);

  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar style="light" />

      <View className="bg-cyan-600 px-5 pb-4 pt-14">
        <Text className="text-2xl font-bold text-white">MasjidKoi</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-6 text-3xl font-bold text-slate-800">Qibla</Text>

        <View style={styles.compassCard}>
          <View style={styles.compassBody}>
            <Text style={styles.northLabel}>N</Text>
            <Text style={styles.eastLabel}>E</Text>
            <Text style={styles.southLabel}>S</Text>
            <Text style={styles.westLabel}>W</Text>

            <View
              style={[
                styles.needleWrapper,
                {
                  transform: [{ rotate: `${heading === null ? 0 : -heading}deg` }],
                },
              ]}
            >
              <View style={styles.needle} />
              <Text style={styles.needleTip}>▲</Text>
            </View>

            <View style={styles.centerDot} />
          </View>

          <Text className="mt-5 text-lg font-semibold text-slate-800">
            {roundedHeading === null
              ? "Reading sensor..."
              : `${roundedHeading}° ${getCardinalDirection(roundedHeading)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compassCard: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  compassBody: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: "#0e7490",
    backgroundColor: "#ecfeff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  northLabel: {
    position: "absolute",
    top: 10,
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
  },
  eastLabel: {
    position: "absolute",
    right: 12,
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
  },
  southLabel: {
    position: "absolute",
    bottom: 10,
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
  },
  westLabel: {
    position: "absolute",
    left: 12,
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
  },
  needleWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    height: 170,
    width: 24,
    position: "absolute",
  },
  needle: {
    width: 4,
    height: 120,
    backgroundColor: "#dc2626",
    borderRadius: 99,
    marginTop: 20,
  },
  needleTip: {
    position: "absolute",
    top: 2,
    color: "#dc2626",
    fontSize: 26,
    lineHeight: 28,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    position: "absolute",
  },
});
