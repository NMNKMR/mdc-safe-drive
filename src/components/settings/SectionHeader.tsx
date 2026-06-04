import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export default function SectionHeader({
  colors,
  icon,
  title,
}: {
  colors: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.head}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { ...typography.headlineMd, fontWeight: "700" },
});
