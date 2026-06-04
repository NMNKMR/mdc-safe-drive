import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export default function StatCard({
  colors,
  icon,
  label,
  value,
  centered,
}: {
  colors: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  centered?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceContainer },
        centered && styles.cardCentered,
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.onSurfaceVariant} />
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.onSurface }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  cardCentered: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  label: { ...typography.labelCaps, fontWeight: "600", marginTop: spacing.xs },
  value: {
    ...typography.headlineMd,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
