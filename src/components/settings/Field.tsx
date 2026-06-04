import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export default function Field({
  colors,
  label,
  ...input
}: {
  colors: ThemeColors;
  label: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <TextInput
        {...input}
        placeholderTextColor={colors.onSurfaceVariant}
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceContainerHigh,
            borderColor: colors.outlineVariant,
            color: colors.onSurface,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { ...typography.labelCaps, fontWeight: "600" },
  input: {
    ...typography.bodyLg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
