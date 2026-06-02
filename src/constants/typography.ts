import type { TextStyle } from "react-native";

export const typography = {
  headlineLg: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.48,
  },
  headlineLgMobile: {
    fontSize: 22,
    lineHeight: 28,
  },
  headlineMd: {
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
  },
  labelCaps: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.55,
  },
  badge: {
    fontSize: 10,
    lineHeight: 12,
  },
  displayScore: {
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -1.12,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
