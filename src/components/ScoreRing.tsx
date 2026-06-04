/**
 * ScoreRing — circular progress gauge (SVG-free).
 * ------------------------------------------------
 * Renders an 8px-stroke ring whose filled arc maps to `progress` (0..1),
 * tinted with the semantic safety colour. Built with the classic two-half
 * border-arc technique so it works in Expo Go / any RN runtime without
 * react-native-svg:
 *
 *   - A circle with only `borderTopColor` + `borderRightColor` set paints a
 *     180° arc (corners break at the 45° diagonals).
 *   - We clip that arc to one vertical half and rotate it; two halves combined
 *     sweep a full 0–360° clockwise from the top.
 *
 * The centre is left to `children` (the score number + label).
 */
import { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type Props = {
  /** Diameter in px. */
  size: number;
  /** Stroke weight of the ring. */
  strokeWidth: number;
  /** 0..1 fraction filled, clockwise from 12 o'clock. */
  progress: number;
  /** Filled-arc colour (semantic safety scale). */
  color: string;
  /** Unfilled track colour. */
  trackColor: string;
  /** Optional outer glow colour (defaults to `color`). */
  glowColor?: string;
  children?: ReactNode;
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export default function ScoreRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  glowColor,
  children,
}: Props) {
  const half = size / 2;
  const angle = clamp(progress, 0, 1) * 360;

  // first half paints 0–180°, second half paints 180–360°
  const firstRotate = Math.min(angle, 180);
  const secondRotate = Math.max(angle - 180, 0);

  const ringBase: ViewStyle = {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: strokeWidth,
    borderColor: "transparent",
  };

  // top + right borders coloured = a 180° arc; rotate so it starts at the top
  const arcColors: ViewStyle = {
    borderTopColor: color,
    borderRightColor: color,
  };

  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, shadowColor: glowColor ?? color },
      ]}
    >
      {/* Track */}
      <View style={[ringBase, { borderColor: trackColor }]} />

      {/* Second half (180–360°): clipped to the LEFT half */}
      <View style={[styles.clip, { width: half, height: size, left: 0 }]}>
        <View
          style={[
            ringBase,
            arcColors,
            { left: 0, transform: [{ rotate: `${45 + secondRotate}deg` }] },
          ]}
        />
      </View>

      {/* First half (0–180°): clipped to the RIGHT half */}
      <View style={[styles.clip, { width: half, height: size, left: half }]}>
        <View
          style={[
            ringBase,
            arcColors,
            { left: -half, transform: [{ rotate: `${-135 + firstRotate}deg` }] },
          ]}
        />
      </View>

      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    // soft "live dashboard" glow (Theme.md elevation guidance)
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  clip: { position: "absolute", top: 0, overflow: "hidden" },
  center: { position: "absolute", alignItems: "center", justifyContent: "center" },
});
