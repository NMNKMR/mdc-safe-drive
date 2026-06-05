import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemeColors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { EVENT_LABELS, type DrivingEventType } from "@/constants/thresholds";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";

/** Minimal event shape both DrivingEvent and StoredEvent satisfy. */
export type TimelineEvent = {
  id: string;
  type: DrivingEventType;
  t: number;
  severity: number;
};

const EVENT_ICON: Record<DrivingEventType, keyof typeof Ionicons.glyphMap> = {
  HARSH_BRAKE: "warning",
  HARSH_ACCELERATION: "flash",
  SHARP_TURN: "git-branch",
  AGGRESSIVE_STEERING: "swap-horizontal",
  EXCESSIVE_DEVICE_MOVEMENT: "phone-portrait",
  PHONE_HANDLING: "call",
};

const EVENT_DESC: Record<DrivingEventType, string> = {
  HARSH_BRAKE: "Sudden deceleration detected.",
  HARSH_ACCELERATION: "Rapid acceleration detected.",
  SHARP_TURN: "Sharp turn taken at speed.",
  AGGRESSIVE_STEERING: "Erratic left–right steering detected.",
  EXCESSIVE_DEVICE_MOVEMENT: "Large device movement detected.",
  PHONE_HANDLING: "Phone likely handled while driving.",
};

const fmtTime = (t: number) => {
  const d = new Date(t);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

function severityMeta(severity: number, colors: ThemeColors) {
  if (severity >= 3) return { color: colors.safetyRed, label: "CRITICAL" };
  if (severity === 2) return { color: colors.tertiary, label: "MODERATE" };
  return { color: colors.safetyAmber, label: "LOW SEVERITY" };
}

type Props = {
  visible: boolean;
  events: TimelineEvent[];
  onClose: () => void;
};

export default function EventTimelineSheet({
  visible,
  events,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const ordered = [...events].sort((a, b) => a.t - b.t);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceContainerLow,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: colors.outlineVariant }]}
          />

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              Event Timeline
            </Text>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: colors.surfaceContainerHigh },
              ]}
            >
              <Text
                style={[styles.countText, { color: colors.onSurfaceVariant }]}
              >
                {ordered.length} EVENT{ordered.length === 1 ? "" : "S"}
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {ordered.map((e, i) => {
              const sev = severityMeta(e.severity, colors);
              const isLast = i === ordered.length - 1;
              return (
                <View key={e.id} style={styles.row}>
                  {/* Rail: node + connecting line */}
                  <View style={styles.rail}>
                    <View style={[styles.node, { backgroundColor: sev.color }]}>
                      <Ionicons
                        name={EVENT_ICON[e.type]}
                        size={16}
                        color={colors.surfaceContainerLowest}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.line,
                          { backgroundColor: colors.outlineVariant },
                        ]}
                      />
                    )}
                  </View>

                  {/* Content */}
                  <View style={[styles.content, !isLast && styles.contentGap]}>
                    <View style={styles.contentHead}>
                      <Text
                        style={[styles.eventTitle, { color: sev.color }]}
                        numberOfLines={1}
                      >
                        {EVENT_LABELS[e.type]}
                      </Text>
                      <Text
                        style={[
                          styles.time,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {fmtTime(e.t)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.desc, { color: colors.onSurfaceVariant }]}
                    >
                      {EVENT_DESC[e.type]}
                    </Text>
                    <View
                      style={[
                        styles.sevBadge,
                        {
                          borderColor: sev.color,
                          backgroundColor: sev.color + "22",
                        },
                      ]}
                    >
                      <Text style={[styles.sevText, { color: sev.color }]}>
                        {sev.label}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000099" },
  sheet: {
    maxHeight: "82%",
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { ...typography.headlineLg, fontWeight: "700" },
  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  countText: { ...typography.labelCaps, fontWeight: "700" },

  list: { paddingBottom: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md },
  rail: { width: 34, alignItems: "center" },
  node: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { width: 2, flex: 1, marginVertical: spacing.xs },
  content: { flex: 1, gap: spacing.xs },
  contentGap: { paddingBottom: spacing.xl },
  contentHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  eventTitle: { ...typography.headlineMd, fontWeight: "700", flex: 1 },
  time: { ...typography.labelCaps, fontVariant: ["tabular-nums"] },
  desc: { ...typography.bodyMd },
  sevBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  sevText: { ...typography.labelCaps, fontWeight: "700" },
});
