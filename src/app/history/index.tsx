import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DriveRow from "@/components/DriveRow";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { useDriveHistory } from "@/hooks/useDriveHistory";

export default function DriveHistory() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    results,
    total,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filters,
  } = useDriveHistory();

  const openDrive = (id: string) =>
    router.push({ pathname: "/history/[id]", params: { id } });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.xxl,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <Pressable
        hitSlop={12}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="arrow-back" size={26} color={colors.onSurface} />
      </Pressable>

      <Text style={[styles.title, { color: colors.onSurface }]}>
        Drive History
      </Text>
      <Text style={[styles.desc, { color: colors.onSurfaceVariant }]}>
        Search and review your past drives.
      </Text>

      {/* Search */}
      <View
        style={[
          styles.search,
          {
            backgroundColor: colors.surfaceContainerHigh,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search drives"
          placeholderTextColor={colors.onSurfaceVariant}
          autoCapitalize="none"
          style={[styles.searchInput, { color: colors.onSurface }]}
        />
        {search.length > 0 && (
          <Pressable hitSlop={8} onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.surfaceContainerHigh,
                  borderColor: active ? colors.primary : colors.outlineVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active ? colors.onPrimary : colors.onSurfaceVariant,
                  },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List / states */}
      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xxxl }}
        />
      ) : results.length === 0 ? (
        <EmptyState
          colors={colors}
          icon={total === 0 ? "car-outline" : "search-outline"}
          text={
            total === 0
              ? "No drives recorded yet. Your completed drives will appear here."
              : "No drives match your search or filter."
          }
        />
      ) : (
        <View style={styles.list}>
          {results.map((d) => (
            <DriveRow
              key={d.id}
              drive={d}
              colors={colors}
              onPress={() => openDrive(d.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function EmptyState({
  colors,
  icon,
  text,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={[styles.empty, { backgroundColor: colors.surfaceContainer }]}>
      <Ionicons name={icon} size={28} color={colors.onSurfaceVariant} />
      <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  back: {
    alignSelf: "flex-start",
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  title: { ...typography.headlineLg, fontWeight: "700", marginTop: spacing.sm },
  desc: { ...typography.bodyMd, marginTop: -spacing.sm },

  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  searchInput: { ...typography.bodyLg, flex: 1, paddingVertical: 0 },

  filterRow: { gap: spacing.sm, paddingRight: spacing.xl },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { ...typography.bodyMd, fontWeight: "600" },

  list: { gap: spacing.md },
  empty: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    marginTop: spacing.sm,
  },
  emptyText: { ...typography.bodyMd, textAlign: "center" },
});
