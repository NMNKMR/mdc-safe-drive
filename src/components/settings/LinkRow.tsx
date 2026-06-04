import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export default function LinkRow({
  colors,
  icon,
  title,
  desc,
  onPress,
}: {
  colors: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surfaceContainerHighest }]}>
        <Ionicons name={icon} size={20} color={colors.onSurface} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        <Text style={[styles.desc, { color: colors.onSurfaceVariant }]}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  title: { ...typography.bodyLg, fontWeight: "600" },
  desc: { ...typography.bodyMd },
});
