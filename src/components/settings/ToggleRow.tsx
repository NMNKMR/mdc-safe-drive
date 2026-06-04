import { StyleSheet, Switch, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export default function ToggleRow({
  colors,
  title,
  desc,
  value,
  onValueChange,
}: {
  colors: ThemeColors;
  title: string;
  desc: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        <Text style={[styles.desc, { color: colors.onSurfaceVariant }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  text: { flex: 1, gap: 2 },
  title: { ...typography.bodyLg, fontWeight: "600" },
  desc: { ...typography.bodyMd },
});
