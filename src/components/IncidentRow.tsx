import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import type { DriveIncident } from "@/constants/data";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export default function IncidentRow({
  incident,
  colors,
}: {
  incident: DriveIncident;
  colors: ThemeColors;
}) {
  const ok = incident.kind === "ok";
  const accent = ok ? colors.safetyGreen : colors.safetyAmber;
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: accent + "22" }]}>
        <Ionicons
          name={ok ? "checkmark-circle" : "alert-circle"}
          size={18}
          color={accent}
        />
      </View>
      <Text
        style={[styles.label, { color: ok ? colors.onSurface : colors.onSurfaceVariant }]}
        numberOfLines={1}
      >
        {incident.label}
      </Text>
      <Text style={[styles.when, { color: colors.onSurfaceVariant }]}>
        {incident.when.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { ...typography.bodyLg, flex: 1, fontWeight: "500" },
  when: { ...typography.badge, fontWeight: "600", letterSpacing: 0.5 },
});
