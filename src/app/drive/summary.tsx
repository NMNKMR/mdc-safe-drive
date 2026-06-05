import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import DriveSummaryView from "@/components/DriveSummaryView";
import { radius } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { useDriveStore } from "@/store/driveStore";

export default function DriveSummary() {
  const { colors } = useTheme();
  const router = useRouter();

  const score = useDriveStore((s) => s.score);
  const rating = useDriveStore((s) => s.rating);
  const durationSec = useDriveStore((s) => s.durationSec);
  const distanceKm = useDriveStore((s) => s.distanceKm);
  const startedAt = useDriveStore((s) => s.startedAt);
  const events = useDriveStore((s) => s.events);
  const reset = useDriveStore((s) => s.reset);

  const onDone = () => {
    reset();
    router.dismissAll?.();
    router.replace("/");
  };

  return (
    <DriveSummaryView
      score={score}
      rating={rating}
      durationSec={durationSec}
      distanceKm={distanceKm}
      startedAt={startedAt}
      events={events}
      onClose={onDone}
      footer={
        <Pressable
          onPress={onDone}
          style={({ pressed }) => [
            styles.doneBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.doneText, { color: colors.onPrimary }]}>
            Done
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  doneBtn: {
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: { ...typography.bodyLg, fontWeight: "700" },
});
