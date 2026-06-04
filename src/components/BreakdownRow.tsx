import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export default function BreakdownRow({
  colors,
  icon,
  accent,
  label,
  desc,
}: {
  colors: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  label: string;
  desc: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: accent + "22" }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.desc, { color: colors.onSurfaceVariant }]}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { flex: 1, gap: 2 },
  label: { ...typography.bodyLg, fontWeight: "600" },
  desc: { ...typography.bodyMd },
});
