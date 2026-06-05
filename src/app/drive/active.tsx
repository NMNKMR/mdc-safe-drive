import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import IncidentRow from "@/components/IncidentRow";
import PulseDot from "@/components/PulseDot";
import ScoreRing from "@/components/ScoreRing";
import Logo from "@/components/shared/Logo";
import StatCard from "@/components/StatCard";
import {
  formatDistance,
  RECENT_INCIDENTS,
  scoreTier,
  tierColor,
  type DriveIncident,
} from "@/constants/data";
import { radius, spacing } from "@/constants/spacing";
import { EVENT_LABELS } from "@/constants/thresholds";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { useDriveStore } from "@/store/driveStore";

const fmtElapsed = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
};

const timeAgo = (t: number, now: number) => {
  const s = Math.max(0, Math.floor((now - t) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  return `${m} min ago`;
};

const TIER_LABEL: Record<ReturnType<typeof scoreTier>, string> = {
  optimal: "Optimal",
  good: "Good",
  caution: "Caution",
  risky: "At Risk",
};

export default function ActiveDrive() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const status = useDriveStore((s) => s.status);
  const score = useDriveStore((s) => s.score);
  const durationSec = useDriveStore((s) => s.durationSec);
  const events = useDriveStore((s) => s.events);
  const distanceKm = useDriveStore((s) => s.distanceKm);
  const startDrive = useDriveStore((s) => s.startDrive);
  const endDrive = useDriveStore((s) => s.endDrive);

  const onEnd = () => {
    endDrive();
    router.replace("/drive/summary");
  };

  if (status !== "driving") {
    return (
      <View style={[styles.gate, { backgroundColor: colors.background }]}>
        <Text style={[styles.gateTitle, { color: colors.onSurface }]}>
          Ready to drive?
        </Text>
        <Pressable
          onPress={startDrive}
          style={({ pressed }) => [
            styles.gateBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.gateBtnText, { color: colors.onPrimary }]}>
            Start Drive
          </Text>
        </Pressable>
      </View>
    );
  }

  const tier = scoreTier(score);
  const accent = tierColor(tier, colors);
  const avgSpeed =
    durationSec > 0 ? Math.round(distanceKm / (durationSec / 3600)) : 0;

  const now = Date.now();
  const incidents: DriveIncident[] =
    events.length > 0
      ? [...events]
          .slice(-4)
          .reverse()
          .map((e) => ({
            id: e.id,
            label: EVENT_LABELS[e.type],
            when: timeAgo(e.t, now),
            kind: "warning" as const,
          }))
      : RECENT_INCIDENTS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm, paddingBottom: spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Logo />
          <View
            style={[
              styles.recording,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <PulseDot color={colors.safetyGreen} />
            <Text style={[styles.recordingText, { color: colors.safetyGreen }]}>
              RECORDING
            </Text>
          </View>
        </View>

        {/* Elapsed time */}
        <Text style={[styles.elapsedLabel, { color: colors.onSurfaceVariant }]}>
          ELAPSED TIME
        </Text>
        <Text style={[styles.elapsed, { color: colors.onSurface }]}>
          {fmtElapsed(durationSec)}
        </Text>

        {/* Live score gauge */}
        <View style={styles.gaugeWrap}>
          <ScoreRing
            size={240}
            strokeWidth={14}
            progress={score / 100}
            color={accent}
            trackColor={colors.surfaceContainerHighest}
          >
            <Text style={[styles.scoreLabel, { color: colors.onSurfaceVariant }]}>
              DRIVE SCORE
            </Text>
            <Text style={[styles.score, { color: accent }]}>{score}</Text>
            <View style={styles.tierRow}>
              <Ionicons name="shield-checkmark" size={16} color={accent} />
              <Text style={[styles.tierText, { color: accent }]}>
                {TIER_LABEL[tier]}
              </Text>
            </View>
          </ScoreRing>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            centered
            colors={colors}
            icon="location-outline"
            label="DISTANCE"
            value={formatDistance(distanceKm)}
          />
          <StatCard
            centered
            colors={colors}
            icon="speedometer-outline"
            label="AVG SPEED"
            value={`${avgSpeed} km/h`}
          />
        </View>

        {/* Recent incidents */}
        <View
          style={[
            styles.incidents,
            { backgroundColor: colors.surfaceContainer },
          ]}
        >
          <View style={styles.incidentsHead}>
            <Ionicons
              name="time-outline"
              size={15}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[styles.incidentsTitle, { color: colors.onSurfaceVariant }]}
            >
              RECENT INCIDENTS
            </Text>
          </View>
          {incidents.map((it) => (
            <IncidentRow key={it.id} incident={it} colors={colors} />
          ))}
        </View>
      </ScrollView>

      {/* End drive (long press) */}
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Pressable
          onLongPress={onEnd}
          delayLongPress={600}
          style={({ pressed }) => [
            styles.endBtn,
            { backgroundColor: colors.errorContainer },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="stop-circle" size={24} color={colors.error} />
          <Text style={[styles.endText, { color: colors.error }]}>
            END DRIVE
          </Text>
        </Pressable>
        <Text style={[styles.endHint, { color: colors.onSurfaceVariant }]}>
          Long press to confirm emergency stop
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recording: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  recordingText: { ...typography.labelCaps, fontWeight: "700" },

  elapsedLabel: {
    ...typography.labelCaps,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: -spacing.sm,
  },
  elapsed: {
    ...typography.displayScore,
    fontWeight: "700",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  gaugeWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  scoreLabel: { ...typography.labelCaps, fontWeight: "600" },
  score: { ...typography.displayScore, fontWeight: "700" },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: -spacing.xs,
  },
  tierText: { ...typography.bodyLg, fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: spacing.md },

  incidents: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  incidentsHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  incidentsTitle: { ...typography.labelCaps, fontWeight: "600" },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  endBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 64,
    borderRadius: radius.full,
  },
  endText: { ...typography.headlineMd, fontWeight: "700", letterSpacing: 0.5 },
  endHint: { ...typography.bodyMd, textAlign: "center" },

  gate: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl,
  },
  gateTitle: { ...typography.headlineLg, fontWeight: "700" },
  gateBtn: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: radius.full,
  },
  gateBtnText: { ...typography.bodyLg, fontWeight: "700" },
});
