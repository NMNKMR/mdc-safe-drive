import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import DriveSummaryView from "@/components/DriveSummaryView";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { useDrive } from "@/hooks/useDrives";

export default function DriveDetail() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { drive, events, loading } = useDrive(id);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!drive) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.missing, { color: colors.onSurfaceVariant }]}>
          This drive could not be found.
        </Text>
      </View>
    );
  }

  return (
    <DriveSummaryView
      score={drive.score}
      rating={drive.rating}
      durationSec={drive.durationSec}
      distanceKm={drive.distanceKm}
      startedAt={drive.startedAt}
      events={events}
      aiFeedback={drive.aiFeedback ?? undefined}
      onClose={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  missing: { ...typography.bodyLg, textAlign: "center" },
});
