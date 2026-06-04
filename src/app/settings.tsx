import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemeColors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useUserStore } from "@/store/userStore";
import Card from "@/components/settings/Card";
import Field from "@/components/settings/Field";
import LinkRow from "@/components/settings/LinkRow";
import SectionHeader from "@/components/settings/SectionHeader";
import ToggleRow from "@/components/settings/ToggleRow";

const PRIVACY_URL = "https://example.com/privacy";
const TERMS_URL = "https://example.com/terms";

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: "system", label: "System", icon: "phone-portrait-outline" },
  { mode: "light", label: "Light", icon: "sunny-outline" },
  { mode: "dark", label: "Dark", icon: "moon-outline" },
];

export default function Settings() {
  const { colors, mode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { name, username, email, setName, setUsername, setEmail } =
    useUserStore();
  const {
    autoDriveDetection,
    voiceCoaching,
    setAutoDriveDetection,
    setVoiceCoaching,
  } = usePreferencesStore();

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

      {/* Title */}
      <Text style={[styles.title, { color: colors.onSurface }]}>Settings</Text>
      <Text style={[styles.desc, { color: colors.onSurfaceVariant }]}>
        Manage your account, preferences, and app settings.
      </Text>

      {/* Account Profile */}
      <Card colors={colors}>
        <SectionHeader colors={colors} icon="person-outline" title="Account Profile" />

        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.surfaceContainerHighest }]}>
            <Ionicons name="person" size={44} color={colors.onSurfaceVariant} />
          </View>
          <View style={[styles.avatarEdit, { backgroundColor: colors.primary, borderColor: colors.surfaceContainer }]}>
            <Ionicons name="pencil" size={13} color={colors.onPrimary} />
          </View>
        </View>

        <Field
          colors={colors}
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="alexmercer"
          autoCapitalize="none"
        />
        <Field
          colors={colors}
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Alex Mercer"
        />
        <Field
          colors={colors}
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="alex.mercer@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </Card>

      {/* App Preferences */}
      <Card colors={colors}>
        <SectionHeader colors={colors} icon="options-outline" title="App Preferences" />

        <ToggleRow
          colors={colors}
          title="Auto-Drive Detection"
          desc="Automatically start recording trips when motion is detected."
          value={autoDriveDetection}
          onValueChange={setAutoDriveDetection}
        />
        <Divider colors={colors} />
        <ToggleRow
          colors={colors}
          title="Voice Coaching Alerts"
          desc="Receive real-time audio feedback for harsh events."
          value={voiceCoaching}
          onValueChange={setVoiceCoaching}
        />
        <Divider colors={colors} />

        <View style={styles.prefRow}>
          <View style={styles.prefText}>
            <Text style={[styles.prefTitle, { color: colors.onSurface }]}>Theme</Text>
            <Text style={[styles.prefDesc, { color: colors.onSurfaceVariant }]}>
              Choose your preferred appearance.
            </Text>
          </View>
        </View>
        <View style={[styles.segment, { backgroundColor: colors.surfaceContainerLowest }]}>
          {THEME_OPTIONS.map((opt) => {
            const active = mode === opt.mode;
            return (
              <Pressable
                key={opt.mode}
                onPress={() => toggleTheme(opt.mode)}
                style={[
                  styles.segmentBtn,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={active ? colors.onPrimary : colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? colors.onPrimary : colors.onSurfaceVariant },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* About & Legal */}
      <Card colors={colors}>
        <SectionHeader colors={colors} icon="lock-closed-outline" title="About & Legal" />

        <LinkRow
          colors={colors}
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          desc="How we handle your data."
          onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}
        />
        <Divider colors={colors} />
        <LinkRow
          colors={colors}
          icon="document-text-outline"
          title="Terms of Service"
          desc="The rules for using SafeDrive."
          onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}
        />
      </Card>
    </ScrollView>
  );
}

function Divider({ colors }: { colors: ThemeColors }) {
  return <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  back: { alignSelf: "flex-start", padding: spacing.xs, marginLeft: -spacing.xs },
  title: { ...typography.headlineLg, fontWeight: "700", marginTop: spacing.sm },
  desc: { ...typography.bodyMd, marginTop: -spacing.sm, marginBottom: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth },

  avatarWrap: { alignSelf: "center", marginBottom: spacing.xs },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEdit: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: radius.full,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  prefRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  prefText: { flex: 1, gap: 2 },
  prefTitle: { ...typography.bodyLg, fontWeight: "600" },
  prefDesc: { ...typography.bodyMd },

  segment: {
    flexDirection: "row",
    borderRadius: radius.pill,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  segmentText: { ...typography.bodyMd, fontWeight: "600" },
});
