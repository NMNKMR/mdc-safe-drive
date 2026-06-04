import { spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Logo = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.brand}>
      <Image
        source={require("../../../assets/logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={[styles.brandText, { color: colors.primary }]}>
        SafeDrive Pulse
      </Text>
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  logo: { width: 30, height: 30 },
  brandText: { ...typography.headlineMd, fontWeight: "700" },
});
