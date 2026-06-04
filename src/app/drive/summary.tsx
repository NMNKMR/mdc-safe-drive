import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BreakdownRow from "@/components/BreakdownRow";
import ScoreRing from "@/components/ScoreRing";
import Logo from "@/components/shared/Logo";
import StatCard from "@/components/StatCard";
import {
  driveLabel,
  formatClock,
  scoreTier,
  summaryRibbon,
  SUMMARY_AI_FEEDBACK,
  tierColor,
} from "@/constants/data";
import { radius, spacing } from "@/constants/spacing";
import { EVENT_LABELS, type DrivingEventType } from "@/constants/thresholds";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { useDriveStore } from "@/store/driveStore";

const road = require("../../../assets/images/road.png");

const EVENT_ICON: Record<DrivingEventType, keyof typeof Ionicons.glyphMap> = {
  HARSH_BRAKE: "warning",
  HARSH_ACCELERATION: "flash",
  SHARP_TURN: "git-branch",
  AGGRESSIVE_STEERING: "swap-horizontal",
  EXCESSIVE_DEVICE_MOVEMENT: "phone-portrait",
  PHONE_HANDLING: "call",
};

const CLEAN_HIGHLIGHTS = [
  {
    id: "clean-speed",
    icon: "speedometer-outline" as const,
    label: "Consistent Speed",
    desc: "Maintained a steady pace throughout.",
  },
  {
    id: "clean-distract",
    icon: "phone-portrait-outline" as const,
    label: "Zero Distractions",
    desc: "Phone stayed down the whole drive.",
  },
  {
    id: "clean-smooth",
    icon: "shield-checkmark-outline" as const,
    label: "Smooth Handling",
    desc: "No harsh braking or sharp turns.",
  },
];

export default function DriveSummary() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const score = useDriveStore((s) => s.score);
  const rating = useDriveStore((s) => s.rating);
  const durationSec = useDriveStore((s) => s.durationSec);
  const distanceKm = useDriveStore((s) => s.distanceKm);
  const startedAt = useDriveStore((s) => s.startedAt);
  const breakdown = useDriveStore((s) => s.breakdown);
  const reset = useDriveStore((s) => s.reset);

  const tier = scoreTier(score);
  const accent = tierColor(tier, colors);
  const counts = breakdown();
  const types = Object.keys(counts) as DrivingEventType[];
  const subtitle = driveLabel(startedAt ?? Date.now());

  const onDone = () => {
    reset();
    router.dismissAll?.();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Road hero + score gauge */}
        <View style={styles.hero}>
          <Image
            source={road}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.background, opacity: 0.55 },
            ]}
          />

          <View
            style={[styles.heroHeader, { paddingTop: insets.top + spacing.sm }]}
          >
            <Logo />
            <Pressable
              hitSlop={12}
              onPress={onDone}
              accessibilityLabel="Close summary"
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.surfaceContainerHigh },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Ionicons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.heroCenter}>
            <ScoreRing
              size={200}
              strokeWidth={12}
              progress={score / 100}
              color={accent}
              trackColor={colors.surfaceContainerHighest}
            >
              <Text
                style={[styles.finalLabel, { color: colors.onSurfaceVariant }]}
              >
                FINAL SCORE
              </Text>
              <Text style={[styles.score, { color: accent }]}>{score}</Text>
            </ScoreRing>
          </View>
        </View>

        {/* Sheet pulled over the hero */}
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Title + ribbon */}
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                {rating} Drive
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
              >
                {subtitle}
              </Text>
            </View>
            <View style={[styles.ribbon, { borderColor: accent }]}>
              <Text style={[styles.ribbonText, { color: accent }]}>
                {summaryRibbon(tier)}
              </Text>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.outlineVariant }]}
          />

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard
              colors={colors}
              icon="time-outline"
              label="DURATION"
              value={formatClock(durationSec)}
            />
            <StatCard
              colors={colors}
              icon="git-network-outline"
              label="DISTANCE"
              value={`${distanceKm.toFixed(1)} km`}
            />
          </View>

          {/* Event breakdown */}
          <Text
            style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}
          >
            EVENT BREAKDOWN
          </Text>
          <View style={styles.breakdown}>
            {types.length === 0
              ? CLEAN_HIGHLIGHTS.map((h) => (
                  <BreakdownRow
                    key={h.id}
                    colors={colors}
                    icon={h.icon}
                    accent={colors.safetyGreen}
                    label={h.label}
                    desc={h.desc}
                  />
                ))
              : types.map((t) => (
                  <BreakdownRow
                    key={t}
                    colors={colors}
                    icon={EVENT_ICON[t]}
                    accent={colors.safetyAmber}
                    label={EVENT_LABELS[t]}
                    desc={`${counts[t]} instance${counts[t]! > 1 ? "s" : ""} detected.`}
                  />
                ))}
          </View>

          {/* Pulse Coach (dummy AI) */}
          <View
            style={[
              styles.coach,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.secondary,
              },
            ]}
          >
            <View style={styles.coachHead}>
              <Ionicons name="sparkles" size={16} color={colors.secondary} />
              <Text style={[styles.coachTag, { color: colors.secondary }]}>
                PULSE COACH INSIGHTS
              </Text>
            </View>
            <Text style={[styles.coachBody, { color: colors.onSurface }]}>
              {SUMMARY_AI_FEEDBACK}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Done action */}
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Pressable
          onPress={onDone}
          style={({ pressed }) => [
            styles.doneBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.doneText, { color: colors.onPrimary }]}>
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 380 },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  finalLabel: { ...typography.labelCaps, fontWeight: "600" },
  score: { ...typography.displayScore, fontWeight: "700" },

  sheet: {
    marginTop: -spacing.xxl,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleCol: { flex: 1, gap: 2 },
  title: { ...typography.headlineLg, fontWeight: "700" },
  subtitle: { ...typography.bodyLg },
  ribbon: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  ribbonText: { ...typography.labelCaps, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth },

  statsRow: { flexDirection: "row", gap: spacing.md },

  sectionTitle: {
    ...typography.labelCaps,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  breakdown: { gap: spacing.lg },

  coach: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  coachHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  coachTag: { ...typography.labelCaps, fontWeight: "700" },
  coachBody: { ...typography.bodyLg },

  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  doneBtn: {
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: { ...typography.bodyLg, fontWeight: "700" },
});
