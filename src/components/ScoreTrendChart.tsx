/**
 * ScoreTrendChart
 * ---------------
 * Smooth score-over-time line chart on a fixed 0–100 scale, with faint safety
 * bands behind it and a stroke whose colour tracks height (red low → amber →
 * green high). The most recent point is highlighted.
 *
 * Pure react-native-svg — no chart library. Deliberate: the full-featured libs
 * need native modules that break Expo Go (gifted-charts → react-native-linear-
 * gradient; victory-native → Skia), and the one svg-only lib (chart-kit) can't
 * do the height-mapped colour line + safety bands this design calls for. Fixed
 * 0–100 domain keeps the bands meaningful and every drive directly comparable.
 */
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import type { TrendPoint } from "@/hooks/useInsights";

/** Score band boundaries (match the legend: Optimal 80+, Caution 60–80). */
const OPTIMAL = 80;
const CAUTION = 60;

type Pt = { x: number; y: number };

/** Catmull-Rom → cubic bézier for a smooth line through all points. */
function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const colorForScore = (score: number, c: ThemeColors) =>
  score >= OPTIMAL ? c.safetyGreen : score >= CAUTION ? c.safetyAmber : c.safetyRed;

type Props = {
  points: TrendPoint[];
  colors: ThemeColors;
  width: number;
  height?: number;
};

export default function ScoreTrendChart({
  points,
  colors,
  width,
  height = 200,
}: Props) {
  const padX = 8;
  const padTop = 12;
  const plotH = height - padTop - 8;
  const plotW = width - padX * 2;

  const yFor = (score: number) => padTop + (1 - score / 100) * plotH;
  const xFor = (i: number) =>
    padX + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);

  const coords: Pt[] = points.map((p, i) => ({ x: xFor(i), y: yFor(p.score) }));
  const line = smoothPath(coords);
  const area =
    line &&
    `${line} L ${coords[coords.length - 1].x} ${padTop + plotH} L ${coords[0].x} ${padTop + plotH} Z`;

  const last = coords[coords.length - 1];
  const lastColor = colorForScore(points[points.length - 1].score, colors);

  // gradient offsets (0 = top/score100, 1 = bottom/score0)
  const offOptimal = (100 - OPTIMAL) / 100;
  const offCaution = (100 - CAUTION) / 100;

  // pick ~4 evenly-spaced x labels
  const labelIdx = pickLabelIndices(points.length);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          {/* vertical stroke gradient: green high → amber mid → red low */}
          <LinearGradient
            id="stroke"
            x1="0"
            y1={padTop}
            x2="0"
            y2={padTop + plotH}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.safetyGreen} />
            <Stop offset={offOptimal} stopColor={colors.safetyGreen} />
            <Stop offset={offOptimal} stopColor={colors.safetyAmber} />
            <Stop offset={offCaution} stopColor={colors.safetyAmber} />
            <Stop offset={offCaution} stopColor={colors.safetyRed} />
            <Stop offset="1" stopColor={colors.safetyRed} />
          </LinearGradient>
          <LinearGradient id="area" x1="0" y1={padTop} x2="0" y2={padTop + plotH}>
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.18} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* safety bands */}
        <Rect x={0} y={yFor(100)} width={width} height={yFor(OPTIMAL) - yFor(100)} fill={colors.safetyGreen} opacity={0.08} />
        <Rect x={0} y={yFor(OPTIMAL)} width={width} height={yFor(CAUTION) - yFor(OPTIMAL)} fill={colors.safetyAmber} opacity={0.08} />
        <Rect x={0} y={yFor(CAUTION)} width={width} height={yFor(0) - yFor(CAUTION)} fill={colors.safetyRed} opacity={0.08} />

        {area ? <Path d={area} fill="url(#area)" /> : null}
        {line ? (
          <Path d={line} stroke="url(#stroke)" strokeWidth={4} fill="none" strokeLinecap="round" />
        ) : null}

        {/* highlight latest */}
        <Circle cx={last.x} cy={last.y} r={6} fill={colors.surface} stroke={lastColor} strokeWidth={3} />
      </Svg>

      {/* x-axis labels */}
      <View style={styles.labels}>
        {labelIdx.map((i) => (
          <Text key={i} style={[styles.label, { color: colors.onSurfaceVariant }]}>
            {points[i].label}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** Indices for up to 4 evenly spaced labels. */
function pickLabelIndices(n: number): number[] {
  if (n <= 1) return [0];
  if (n <= 4) return Array.from({ length: n }, (_, i) => i);
  return [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1];
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  label: { ...typography.badge, fontWeight: "600" },
});
