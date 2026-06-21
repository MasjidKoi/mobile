import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@/components/Text";

/**
 * The Qibla dial (design `09 Qibla — Compass`). A white face with two
 * concentric rings, a light-green "beam" + tapered needle pointing at the
 * Qibla, a centre hub, and a gold Kaaba marker that sits at the Qibla bearing.
 *
 * Two independent rotations: the cardinal ring turns by `-heading` so N tracks
 * true north, while the beam/needle turn by `relativeAngle` so they point at the
 * Qibla (0 → the device faces it and the needle points straight up). The Kaaba
 * marker and cardinal letters are placed by trig so they stay upright.
 */
const DIAL = 288;
const C = DIAL / 2;
const OUTER = 240;
const INNER = 180;
const R_CARD = 126; // cardinal-letter radius from centre
const R_KAABA = 112; // Kaaba-marker radius from centre

const RING = "#E4E9E5";
const GREEN = "#0E6B4F";
const TAIL = "#C9D2CC";
const BEAM = "#E8F1EC";
const GOLD = "#B98E2F";
const RED = "#C2453E";
const GREY = "#8C9690";

const NEEDLE_HALF = 13;
const NEEDLE_LEN = 98;
const TAIL_HALF = 10;
const TAIL_LEN = 46;
const BEAM_HALF = 46;
const BEAM_LEN = 112;
const HUB = 28;
const HUB_DOT = 10;
const KAABA = 26;

const CARDINALS = [
  { key: "qibla.compass.n", angle: 0, color: RED, fontSize: 14, fontWeight: "700" as const },
  { key: "qibla.compass.e", angle: 90, color: GREY, fontSize: 13, fontWeight: "600" as const },
  { key: "qibla.compass.s", angle: 180, color: GREY, fontSize: 13, fontWeight: "600" as const },
  { key: "qibla.compass.w", angle: 270, color: GREY, fontSize: 13, fontWeight: "600" as const },
];

export type QiblaCompassProps = {
  /** Live device heading in degrees (true north). */
  heading: number;
  /** Qibla bearing relative to heading; 0 ⇒ the device points at the Qibla. */
  relativeAngle: number;
  /** Dim the dial while the heading is unreliable. */
  dimmed?: boolean;
};

/** Point on the dial at `angle` degrees clockwise from straight up, at `radius`. */
function polar(angle: number, radius: number): { x: number; y: number } {
  const r = (angle * Math.PI) / 180;
  return { x: C + radius * Math.sin(r), y: C - radius * Math.cos(r) };
}

export function QiblaCompass({ heading, relativeAngle, dimmed = false }: QiblaCompassProps) {
  const { t } = useTranslation();
  const kaaba = polar(relativeAngle, R_KAABA);

  return (
    <View
      style={{
        width: DIAL,
        height: DIAL,
        borderRadius: C,
        borderWidth: 1,
        borderColor: RING,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dial chrome — dimmed while the heading is unreliable; the direction
          marker (needle + Kaaba) below stays at full opacity so it reads clearly */}
      <View style={{ position: "absolute", width: DIAL, height: DIAL, opacity: dimmed ? 0.4 : 1 }}>
        {/* Beam — widens from the hub toward the Qibla */}
        <View style={{ position: "absolute", width: DIAL, height: DIAL, transform: [{ rotate: `${relativeAngle}deg` }] }}>
          <View
            style={{
              position: "absolute",
              left: C - BEAM_HALF,
              top: C - BEAM_LEN,
              width: 0,
              height: 0,
              borderLeftWidth: BEAM_HALF,
              borderRightWidth: BEAM_HALF,
              borderTopWidth: BEAM_LEN,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: BEAM,
            }}
          />
        </View>

        {/* Concentric rings */}
        <View style={{ position: "absolute", left: (DIAL - OUTER) / 2, top: (DIAL - OUTER) / 2, width: OUTER, height: OUTER, borderRadius: OUTER / 2, borderWidth: 1, borderColor: RING }} />
        <View style={{ position: "absolute", left: (DIAL - INNER) / 2, top: (DIAL - INNER) / 2, width: INNER, height: INNER, borderRadius: INNER / 2, borderWidth: 1, borderColor: RING }} />

        {/* Cardinal letters — upright, positioned so N tracks true north */}
        {CARDINALS.map((card) => {
          const p = polar(card.angle - heading, R_CARD);
          return (
            <View
              key={card.key}
              style={{ position: "absolute", left: p.x - 16, top: p.y - 12, width: 32, height: 24, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: card.fontSize, fontWeight: card.fontWeight, color: card.color }}>{t(card.key)}</Text>
            </View>
          );
        })}
      </View>

      {/* Kaaba marker — at the Qibla bearing, stays upright */}
      <View
        style={{ position: "absolute", left: kaaba.x - KAABA / 2, top: kaaba.y - KAABA / 2, width: KAABA, height: KAABA, alignItems: "center", justifyContent: "center" }}
      >
        <Feather name="box" size={20} color={GOLD} />
      </View>

      {/* Needle — grey tail + green arrow, points at the Qibla */}
      <View style={{ position: "absolute", width: DIAL, height: DIAL, transform: [{ rotate: `${relativeAngle}deg` }] }}>
        <View
          style={{
            position: "absolute",
            left: C - TAIL_HALF,
            top: C,
            width: 0,
            height: 0,
            borderLeftWidth: TAIL_HALF,
            borderRightWidth: TAIL_HALF,
            borderTopWidth: TAIL_LEN,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: TAIL,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: C - NEEDLE_HALF,
            top: C - NEEDLE_LEN,
            width: 0,
            height: 0,
            borderLeftWidth: NEEDLE_HALF,
            borderRightWidth: NEEDLE_HALF,
            borderBottomWidth: NEEDLE_LEN,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: GREEN,
          }}
        />
      </View>

      {/* Hub */}
      <View style={{ position: "absolute", width: HUB, height: HUB, borderRadius: HUB / 2, backgroundColor: GREEN }} />
      <View style={{ position: "absolute", width: HUB_DOT, height: HUB_DOT, borderRadius: HUB_DOT / 2, backgroundColor: "#FFFFFF" }} />
    </View>
  );
}

export default QiblaCompass;
