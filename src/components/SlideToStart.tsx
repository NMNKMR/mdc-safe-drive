/**
 * SlideToStart — slide-to-confirm action used to begin a drive.
 * -------------------------------------------------------------
 * A pill track with a draggable knob. The user must drag past ~80% of the
 * track to fire `onComplete`; an incomplete drag springs back. Built on the
 * modern Gesture API + Reanimated worklets so the drag stays on the UI thread.
 *
 * Pill / fully-rounded styling per Theme.md (interactive elements are pills,
 * informational cards are 16px rounded).
 */
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  type LayoutRectangle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";

const KNOB = 56;
const TRACK_PADDING = 6;
const HEIGHT = KNOB + TRACK_PADDING * 2;
/** Fraction of the track the knob must cross to count as "completed". */
const COMPLETE_AT = 0.82;

type Props = {
  label?: string;
  onComplete: () => void;
};

export default function SlideToStart({
  label = "Slide to Start",
  onComplete,
}: Props) {
  const { colors } = useTheme();
  const [track, setTrack] = useState<LayoutRectangle | null>(null);

  const x = useSharedValue(0);
  const maxX = track ? track.width - KNOB - TRACK_PADDING * 2 : 0;

  const onLayout = (e: LayoutChangeEvent) => setTrack(e.nativeEvent.layout);

  const pan = Gesture.Pan()
    .onChange((e) => {
      x.value = Math.max(0, Math.min(maxX, x.value + e.changeX));
    })
    .onEnd(() => {
      if (maxX > 0 && x.value >= maxX * COMPLETE_AT) {
        x.value = withSpring(maxX, { damping: 18, stiffness: 180 });
        runOnJS(onComplete)();
      } else {
        x.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity:
      maxX > 0
        ? interpolate(x.value, [0, maxX * 0.6], [1, 0], Extrapolation.CLAMP)
        : 1,
  }));

  // brighten the track as the knob travels, hinting at "arming"
  const fillStyle = useAnimatedStyle(() => ({
    width: x.value + KNOB + TRACK_PADDING,
    opacity:
      maxX > 0
        ? interpolate(x.value, [0, maxX], [0, 0.35], Extrapolation.CLAMP)
        : 0,
  }));

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.track,
        {
          backgroundColor: colors.surfaceContainerHigh,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <Animated.View
        style={[styles.fill, fillStyle, { backgroundColor: colors.primary }]}
      />

      <Animated.Text
        style={[
          styles.label,
          typography.bodyLg,
          labelStyle,
          { color: colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Animated.Text>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.knob, knobStyle, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="car-sport" size={26} color={colors.onPrimary} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: TRACK_PADDING,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: HEIGHT / 2,
  },
  label: {
    position: "absolute",
    alignSelf: "center",
    fontWeight: "600",
    letterSpacing: 0.3,
    paddingLeft: spacing.xxl,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
