import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";

export default function Card({
  colors,
  children,
}: {
  colors: ThemeColors;
  children: ReactNode;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainer }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
});
