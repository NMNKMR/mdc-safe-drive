import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { tierColor, type RecentDrive } from "@/constants/data";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

const driveIcon = (
  tier: RecentDrive["tier"],
): keyof typeof Ionicons.glyphMap => {
  switch (tier) {
    case "optimal":
    case "good":
      return "navigate";
    case "caution":
      return "time-outline";
    case "risky":
      return "warning-outline";
  }
};

export default function DriveRow({
  drive,
  colors,
}: {
  drive: RecentDrive;
  colors: ThemeColors;
}) {
  const accent = tierColor(drive.tier, colors);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surfaceContainer },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: accent + "22" }]}>
        <Ionicons name={driveIcon(drive.tier)} size={20} color={accent} />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          {drive.title}
        </Text>
        <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>
          {drive.date} · {drive.duration}
        </Text>
      </View>
      <View style={styles.scoreWrap}>
        <Text style={[styles.score, { color: accent }]}>{drive.score}</Text>
        <Text style={[styles.badge, { color: accent }]}>{drive.badge}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { flex: 1, gap: 2 },
  title: { ...typography.bodyLg, fontWeight: "600" },
  sub: { ...typography.bodyMd },
  scoreWrap: { alignItems: "flex-end", gap: 2 },
  score: { ...typography.headlineMd, fontWeight: "700" },
  badge: { ...typography.badge, fontWeight: "700", letterSpacing: 0.5 },
});
