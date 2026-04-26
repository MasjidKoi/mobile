import { Magnetometer, type MagnetometerMeasurement } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const HEADING_OFFSET_DEGREES = -90;

function getHeadingFromMagnetometer(data: MagnetometerMeasurement) {
  const angle = Math.atan2(data.y, data.x);
  const heading = angle >= 0 ? angle : angle + 2 * Math.PI;
  const headingDegrees = (heading * 180) / Math.PI;
  return normalizeHeading(headingDegrees + HEADING_OFFSET_DEGREES);
}

function getCardinalDirection(heading: number) {
  if (heading >= 315 || heading < 45) return "North";
  if (heading >= 45 && heading < 135) return "East";
  if (heading >= 135 && heading < 225) return "South";
  return "West";
}

function normalizeHeading(heading: number) {
  return (heading + 360) % 360;
}

function getShortestAngleDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

export default function QiblaScreen() {
  const [heading, setHeading] = useState<number | null>(null);
  const targetHeadingRef = useRef<number | null>(null);
  const currentHeadingRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    Magnetometer.setUpdateInterval(16);

    const subscription = Magnetometer.addListener((data) => {
      const nextHeading = getHeadingFromMagnetometer(data);
      targetHeadingRef.current = nextHeading;

      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        currentHeadingRef.current = nextHeading;
        setHeading(nextHeading);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      const targetHeading = targetHeadingRef.current;

      if (targetHeading !== null) {
        const delta = getShortestAngleDelta(currentHeadingRef.current, targetHeading);
        currentHeadingRef.current = normalizeHeading(currentHeadingRef.current + delta * 0.2);
        setHeading(currentHeadingRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const roundedHeading = useMemo(() => {
    if (heading === null) return null;
    return Math.round(heading);
  }, [heading]);

  const scaleTicks = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => {
        const angle = index * 10;
        const isMajorTick = index % 3 === 0;

        return (
          <View
            key={`tick-${angle}`}
            style={[
              styles.scaleTick,
              {
                height: isMajorTick ? 12 : 7,
                backgroundColor: isMajorTick ? "#0e7490" : "#94a3b8",
                transform: [{ rotate: `${angle}deg` }, { translateY: -104 }],
              },
            ]}
          />
        );
      }),
    [],
  );

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
            <View
              style={[
                styles.rotatingWheel,
                { transform: [{ rotate: `${heading === null ? 0 : -heading}deg` }] },
              ]}
            >
              {scaleTicks}
              <Text style={[styles.dialLabel, styles.northLabel]}>N</Text>
              <Text style={[styles.dialLabel, styles.eastLabel]}>E</Text>
              <Text style={[styles.dialLabel, styles.southLabel]}>S</Text>
              <Text style={[styles.dialLabel, styles.westLabel]}>W</Text>

              <View style={styles.needleWrapper}>
                <View style={styles.needle} />
                <Text style={styles.needleTip}>▲</Text>
              </View>
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
  rotatingWheel: {
    width: "100%",
    height: "100%",
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  scaleTick: {
    position: "absolute",
    width: 2,
    borderRadius: 99,
  },
  dialLabel: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
    position: "absolute",
  },
  northLabel: {
    top: 10,
  },
  eastLabel: {
    right: 12,
  },
  southLabel: {
    bottom: 10,
  },
  westLabel: {
    left: 12,
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
