export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  screenPadding: 16,
  gutter: 12,
} as const;

export const radius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  pill: 24,
  full: 9999,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
