import type { TextStyle } from "react-native";

export const fonts = {
  sansRegular: "HankenGrotesk_400Regular",
  sansSemiBold: "HankenGrotesk_600SemiBold",
  sansBold: "HankenGrotesk_700Bold",
  monoRegular: "JetBrainsMono_400Regular",
  monoSemiBold: "JetBrainsMono_600SemiBold",
  monoBold: "JetBrainsMono_700Bold",
} as const;

export const typography = {
  headlineLg: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.48,
  },
  headlineLgMobile: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    lineHeight: 28,
  },
  headlineMd: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.55,
  },
  badge: {
    fontFamily: fonts.monoBold,
    fontSize: 10,
    lineHeight: 12,
  },
  displayScore: {
    fontFamily: fonts.sansBold,
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -1.12,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
