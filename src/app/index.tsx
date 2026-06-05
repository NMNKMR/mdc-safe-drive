import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DriveRow from "@/components/DriveRow";
import ScoreRing from "@/components/ScoreRing";
import Logo from "@/components/shared/Logo";
import SlideToStart from "@/components/SlideToStart";
import {
  AI_INSIGHT,
  driveToCard,
  scoreTier,
  tierColor,
} from "@/constants/data";
import { radius, spacing } from "@/constants/spacing";
import { getSafetyRating } from "@/constants/thresholds";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { useDrives, useDriveStats } from "@/hooks/useDrives";
import { useDriveStore } from "@/store/driveStore";

export default function Dashboard() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const startDrive = useDriveStore((s) => s.startDrive);
  const { stats } = useDriveStats();
  const { drives } = useDrives();

  const onStart = () => {
    startDrive();
    router.push("/drive/active");
  };

  const hasDrives = stats.totalDrives > 0;
  const avgScore = stats.averageScore;
  const avgRating = hasDrives ? getSafetyRating(avgScore) : "—";
  const ratingColor = hasDrives
    ? tierColor(scoreTier(avgScore), colors)
    : colors.primary;
  const cards = drives.map(driveToCard);
  const sheetPad = insets.bottom + spacing.lg;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm, paddingBottom: 220 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Logo />
          <Pressable
            hitSlop={12}
            accessibilityLabel="Settings"
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        {/* Average score gauge */}
        <View
          style={[styles.card, { backgroundColor: colors.surfaceContainer }]}
        >
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>
            AVERAGE SAFETY SCORE
          </Text>
          <View style={styles.gaugeWrap}>
            <ScoreRing
              size={180}
              strokeWidth={10}
              progress={hasDrives ? avgScore / 100 : 0}
              color={ratingColor}
              trackColor={colors.surfaceContainerHighest}
            >
              <Text style={[styles.score, { color: colors.onSurface }]}>
                {hasDrives ? avgScore : "—"}
              </Text>
              <Text style={[styles.scoreRating, { color: ratingColor }]}>
                {hasDrives ? avgRating.toUpperCase() : "NO DRIVES YET"}
              </Text>
            </ScoreRing>
          </View>

          <Pressable
            onPress={() => router.push("/insights" as Href)}
            style={({ pressed }) => [
              styles.insightsBtn,
              { backgroundColor: colors.surfaceContainerHigh },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="stats-chart" size={16} color={colors.primary} />
            <Text style={[styles.insightsBtnText, { color: colors.primary }]}>
              VIEW INSIGHTS
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* AI insight */}
        <View
          style={[
            styles.card,
            styles.insightCard,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.secondary,
            },
          ]}
        >
          <View style={styles.insightHead}>
            <Ionicons name="sparkles" size={16} color={colors.secondary} />
            <Text style={[styles.insightTag, { color: colors.secondary }]}>
              AI INSIGHT
            </Text>
          </View>
          <Text style={[styles.insightHeadline, { color: colors.onSurface }]}>
            {AI_INSIGHT.headline}
          </Text>
          <Text
            style={[styles.insightDetail, { color: colors.onSurfaceVariant }]}
          >
            {AI_INSIGHT.detail}
          </Text>
          <View style={styles.chipRow}>
            {AI_INSIGHT.tags.map((t) => (
              <View
                key={t}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceContainerHighest },
                ]}
              >
                <Text
                  style={[styles.chipText, { color: colors.onSurfaceVariant }]}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent drives */}
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Recent Drives
          </Text>
          {cards.length > 0 && (
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/history")}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                VIEW ALL
              </Text>
            </Pressable>
          )}
        </View>

        {cards.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name="car-outline" size={22} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
              No drives yet — slide below to start your first.
            </Text>
          </View>
        ) : (
          cards.map((d) => (
            <DriveRow
              key={d.id}
              drive={d}
              colors={colors}
              onPress={() =>
                router.push({ pathname: "/history/[id]", params: { id: d.id } })
              }
            />
          ))
        )}
      </ScrollView>

      {/* Fixed bottom sheet */}
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surfaceContainerLow,
            paddingBottom: sheetPad,
          },
        ]}
      >
        <Text style={[styles.sheetLabel, { color: colors.onSurfaceVariant }]}>
          READY TO DEPART?
        </Text>
        <SlideToStart onComplete={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  iconBtn: { padding: spacing.xs },

  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  cardLabel: {
    ...typography.labelCaps,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  gaugeWrap: { alignItems: "center", justifyContent: "center" },
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  insightsBtnText: { ...typography.labelCaps, fontWeight: "700" },
  score: { ...typography.displayScore, fontWeight: "700" },
  scoreRating: {
    ...typography.labelCaps,
    fontWeight: "700",
    marginTop: -spacing.xs,
  },

  insightCard: { borderWidth: StyleSheet.hairlineWidth, gap: spacing.sm },
  insightHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  insightTag: { ...typography.labelCaps, fontWeight: "700" },
  insightHeadline: { ...typography.headlineMd, fontWeight: "600" },
  insightDetail: { ...typography.bodyMd },
  chipRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  chipText: { ...typography.badge, fontWeight: "600", letterSpacing: 0.5 },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  sectionTitle: { ...typography.headlineMd, fontWeight: "700" },
  viewAll: { ...typography.labelCaps, fontWeight: "700" },

  empty: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  emptyText: { ...typography.bodyMd, flex: 1 },

  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    gap: spacing.md,
  },
  sheetLabel: {
    ...typography.labelCaps,
    fontWeight: "600",
    textAlign: "center",
  },
});
