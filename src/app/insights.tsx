import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScoreTrendChart from "@/components/ScoreTrendChart";
import { AI_COACH_OBSERVATION, scoreTier, tierColor } from "@/constants/data";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { useInsights } from "@/hooks/useInsights";

export default function Insights() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const {
    totalDrives,
    averageScore,
    bestScore,
    deltaVsLast,
    hasDelta,
    streakDays,
    trend,
    canShowTrend,
  } = useInsights();

  const ratingColor = tierColor(scoreTier(averageScore), colors);
  const chartWidth = width - spacing.xl * 2 - spacing.lg * 2;
  const deltaUp = deltaVsLast >= 0;
  const deltaColor = deltaUp ? colors.safetyGreen : colors.safetyRed;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.xxl,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Ionicons name="arrow-back" size={26} color={colors.onSurface} />
        </Pressable>
        {/* <Logo /> */}
      </View>

      {totalDrives === 0 ? (
        <View
          style={[
            styles.emptyAll,
            { backgroundColor: colors.surfaceContainer },
          ]}
        >
          <Ionicons
            name="analytics-outline"
            size={28}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
            No insights yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
            Take a few drives and your safety trends will show up here.
          </Text>
        </View>
      ) : (
        <>
          {/* Performance headline */}
          <Text style={[styles.eyebrow, { color: colors.onSurfaceVariant }]}>
            SAFETY PERFORMANCE
          </Text>
          <View style={styles.headlineRow}>
            <Text style={[styles.bigScore, { color: ratingColor }]}>
              {averageScore}
            </Text>
            <Text style={[styles.bigLabel, { color: colors.onSurface }]}>
              Average Score
            </Text>
          </View>
          {hasDelta && (
            <View style={styles.deltaRow}>
              <Ionicons
                name={deltaUp ? "trending-up" : "trending-down"}
                size={16}
                color={deltaColor}
              />
              <Text style={[styles.delta, { color: deltaColor }]}>
                {deltaUp ? "+" : ""}
                {deltaVsLast} vs last drive
              </Text>
            </View>
          )}

          {/* Chart */}
          <View
            style={[styles.card, { backgroundColor: colors.surfaceContainer }]}
          >
            {canShowTrend ? (
              <ScoreTrendChart
                points={trend}
                colors={colors}
                width={chartWidth}
              />
            ) : (
              <Text
                style={[styles.trendHint, { color: colors.onSurfaceVariant }]}
              >
                Take at least 2 drives to see your score trend.
              </Text>
            )}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Legend
              color={colors.safetyGreen}
              label="Optimal (80+)"
              c={colors}
            />
            <Legend
              color={colors.safetyAmber}
              label="Caution (60–80)"
              c={colors}
            />
          </View>

          {/* Stat cards */}
          <View style={styles.statsRow}>
            <StatCard
              c={colors}
              icon="star-outline"
              corner="Personal Best"
              value={`${bestScore}`}
              sub="BEST DRIVE"
            />
            <StatCard
              c={colors}
              icon="car-outline"
              corner="Activity"
              value={`${totalDrives}`}
              sub="TOTAL DRIVES"
            />
          </View>

          {/* Consistency streak */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <Text style={[styles.eyebrow, { color: colors.onSurfaceVariant }]}>
              CONSISTENCY STREAK
            </Text>
            <View style={styles.streakRow}>
              <Text style={[styles.streak, { color: colors.primary }]}>
                {streakDays} {streakDays === 1 ? "Day" : "Days"} 🔥
              </Text>
              <View
                style={[
                  styles.sparkle,
                  { backgroundColor: colors.secondaryContainer },
                ]}
              >
                <Ionicons name="sparkles" size={18} color={colors.secondary} />
              </View>
            </View>
            <Text
              style={[styles.streakSub, { color: colors.onSurfaceVariant }]}
            >
              {streakDays >= 2
                ? "Nice momentum — keep your daily drives consistent."
                : "Drive on consecutive days to build a streak."}
            </Text>
          </View>

          {/* AI coach observation (dummy) */}
          <View
            style={[
              styles.card,
              styles.aiCard,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.secondary,
              },
            ]}
          >
            <View style={styles.aiHead}>
              <Ionicons
                name="hardware-chip-outline"
                size={16}
                color={colors.secondary}
              />
              <Text style={[styles.aiTag, { color: colors.secondary }]}>
                AI COACH OBSERVATION
              </Text>
            </View>
            <Text style={[styles.aiQuote, { color: colors.onSurface }]}>
              “{AI_COACH_OBSERVATION}”
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Legend({
  color,
  label,
  c,
}: {
  color: string;
  label: string;
  c: { onSurfaceVariant: string };
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: c.onSurfaceVariant }]}>
        {label}
      </Text>
    </View>
  );
}

function StatCard({
  c,
  icon,
  corner,
  value,
  sub,
}: {
  c: {
    surfaceContainer: string;
    onSurface: string;
    onSurfaceVariant: string;
    primary: string;
  };
  icon: keyof typeof Ionicons.glyphMap;
  corner: string;
  value: string;
  sub: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: c.surfaceContainer }]}>
      <View style={styles.statTop}>
        <Ionicons name={icon} size={18} color={c.primary} />
        <Text style={[styles.statCorner, { color: c.onSurfaceVariant }]}>
          {corner}
        </Text>
      </View>
      <Text style={[styles.statValue, { color: c.onSurface }]}>{value}</Text>
      <Text style={[styles.statSub, { color: c.onSurfaceVariant }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },

  eyebrow: { ...typography.labelCaps, fontWeight: "600" },
  headlineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
  },
  bigScore: { ...typography.displayScore, fontWeight: "800" },
  bigLabel: {
    ...typography.headlineLg,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: -spacing.sm,
  },
  delta: { ...typography.bodyMd, fontWeight: "700" },

  card: { borderRadius: radius.xl, padding: spacing.lg },
  trendHint: {
    ...typography.bodyMd,
    textAlign: "center",
    paddingVertical: spacing.xxl,
  },

  legend: { flexDirection: "row", justifyContent: "center", gap: spacing.xl },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...typography.bodyMd },

  statsRow: { flexDirection: "row", gap: spacing.md },
  statCard: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCorner: { ...typography.badge, fontWeight: "600" },
  statValue: {
    ...typography.displayScore,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
  },
  statSub: { ...typography.labelCaps, fontWeight: "700" },

  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  streak: { ...typography.headlineLg, fontWeight: "800" },
  sparkle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  streakSub: { ...typography.bodyMd, marginTop: spacing.xs },

  aiCard: { borderWidth: StyleSheet.hairlineWidth, gap: spacing.sm },
  aiHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  aiTag: { ...typography.labelCaps, fontWeight: "700" },
  aiQuote: { ...typography.bodyLg, fontStyle: "italic", lineHeight: 24 },

  emptyAll: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  emptyTitle: { ...typography.headlineMd, fontWeight: "700" },
  emptyText: { ...typography.bodyMd, textAlign: "center" },
});
