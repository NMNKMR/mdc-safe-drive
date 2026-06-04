/**
 * SafeDrive — Central Threshold & Scoring Configuration
 * ------------------------------------------------------
 * This module defines all the tunable parameters for the driving event detection
 * Units:
 *   - Linear acceleration: m/s²   (gravity removed, via DeviceMotion)
 *   - Rotation rate:       rad/s   (gyroscope)
 *   - Jerk:                m/s³    (rate of change of acceleration)
 *   - Time:                ms
 */

// ---------------------------------------------------------------------------
// 1. Sensor sampling rates
// ---------------------------------------------------------------------------
/**
 * Update intervals in milliseconds. Lower = more responsive but more battery.
 * Sensors are only subscribed BETWEEN Start Drive and End Drive.
 */
export const SAMPLING = {
  /** Accelerometer @ ~50 Hz — fast enough to catch braking/accel spikes. */
  accelerometerMs: 20,
  /** Gyroscope @ ~50 Hz — needed for sharp turns / steering oscillation. */
  gyroscopeMs: 20,
  /** DeviceMotion @ ~20 Hz — gravity-compensated accel + orientation. */
  deviceMotionMs: 50,
  /** Magnetometer @ low rate — heading only (optional). */
  magnetometerMs: 200,
} as const;

/**
 * Low-pass smoothing factor (0..1) for the exponential moving average applied
 * to raw sensor values before thresholding:
 *   smoothed = alpha * raw + (1 - alpha) * prevSmoothed
 * LOWER alpha = smoother but laggier (more weight on history); HIGHER alpha =
 * more responsive but noisier. 0.2 keeps 80% of the previous value = heavy
 * smoothing to suppress road-bump / sensor noise false positives.
 */
export const SMOOTHING_ALPHA = 0.2;

/**
 * Length of the rolling sample buffer the detection engine keeps in memory.
 * MUST be >= the largest per-event window so every detector has enough history
 * (currently PHONE_HANDLING.windowMs = 2000). At ~50 Hz this holds ~100 samples.
 */
export const WINDOW_MS = 2000;

// ---------------------------------------------------------------------------
// 2. Event types
// ---------------------------------------------------------------------------
export type DrivingEventType =
  | "HARSH_BRAKE"
  | "HARSH_ACCELERATION"
  | "SHARP_TURN"
  | "AGGRESSIVE_STEERING"
  | "EXCESSIVE_DEVICE_MOVEMENT"
  | "PHONE_HANDLING";

/** Human-readable labels for UI (summary, timeline). */
export const EVENT_LABELS: Record<DrivingEventType, string> = {
  HARSH_BRAKE: "Harsh Braking",
  HARSH_ACCELERATION: "Harsh Acceleration",
  SHARP_TURN: "Sharp Turn",
  AGGRESSIVE_STEERING: "Aggressive Steering",
  EXCESSIVE_DEVICE_MOVEMENT: "Excessive Device Movement",
  PHONE_HANDLING: "Phone Handling",
};

// ---------------------------------------------------------------------------
// 3. Detection thresholds
// ---------------------------------------------------------------------------
/**
 * Each event defines the signal threshold that triggers it, an optional
 * "sustained" duration (the condition must hold this long to count), and a
 * cooldown that prevents a single physical event from being counted repeatedly.
 */
export const THRESHOLDS = {
  /** Strong negative forward acceleration = braking hard. */
  HARSH_BRAKE: {
    /** forward linear accel below this (m/s²) triggers. */
    forwardAccel: -3.0,
    sustainedMs: 300,
    cooldownMs: 2000,
  },

  /** Strong positive forward acceleration = flooring it. */
  HARSH_ACCELERATION: {
    forwardAccel: 3.0,
    sustainedMs: 300,
    cooldownMs: 2000,
  },

  /**
   * High yaw rate about TRUE vertical = sharp turn. Now gravity-projected, so
   * arm-swing/tilt no longer leaks in. A real car turn is ~0.3–0.8 rad/s; this
   * sits above brisk turns but below a deliberate quick rotation.
   */
  SHARP_TURN: {
    /** true yaw rate magnitude (rad/s). */
    yawRate: 1.2,
    /** must hold this long — rejects momentary spikes. */
    sustainedMs: 350,
    cooldownMs: 2500,
  },

  /** Rapid left↔right yaw reversal = aggressive/erratic steering. */
  AGGRESSIVE_STEERING: {
    /** magnitude of yaw-rate change across a sign flip (rad/s). */
    yawRateDelta: 2.5,
    /** the reversal must occur within this window. */
    reversalWindowMs: 500,
    cooldownMs: 2000,
  },

  /**
   * Sudden large motion inconsistent with driving. Now measured on GRAVITY-FREE
   * linear acceleration (no ~9.8 baseline), so the threshold is the actual
   * disturbance felt by the phone. Driving forces rarely exceed ~5 m/s²; a
   * deliberate grab/shake is far larger.
   */
  EXCESSIVE_DEVICE_MOVEMENT: {
    /** linear (gravity-free) acceleration magnitude (m/s²). */
    accelMagnitude: 18.0,
    /** OR jerk (rate of change of linear accel, m/s³). */
    jerk: 60.0,
    cooldownMs: 3000,
  },

  /**
   * Picking up / angling the phone. Measured as the TILT of the gravity vector
   * over the window (mount-independent), not raw orientation jitter.
   */
  PHONE_HANDLING: {
    /** gravity-direction change in degrees over the window. */
    orientationChangeDeg: 60,
    /** observation window for the tilt. */
    windowMs: 1500,
    cooldownMs: 5000,
  },
} as const;

// ---------------------------------------------------------------------------
// 4. Scoring
// ---------------------------------------------------------------------------
export const SCORE_START = 100;
export const SCORE_MIN = 0;

/** Points deducted per detected event. */
export const DEDUCTIONS: Record<DrivingEventType, number> = {
  HARSH_BRAKE: 5,
  HARSH_ACCELERATION: 5,
  SHARP_TURN: 3,
  AGGRESSIVE_STEERING: 4,
  EXCESSIVE_DEVICE_MOVEMENT: 5,
  PHONE_HANDLING: 10,
};

// ---------------------------------------------------------------------------
// 5. Safety rating bands
// ---------------------------------------------------------------------------
export type SafetyRating =
  | "Excellent"
  | "Good"
  | "Fair"
  | "Risky"
  | "Dangerous";

/** Ordered high → low. First band whose `min` the score meets wins. */
export const RATING_BANDS: { min: number; rating: SafetyRating }[] = [
  { min: 90, rating: "Excellent" },
  { min: 75, rating: "Good" },
  { min: 60, rating: "Fair" },
  { min: 40, rating: "Risky" },
  { min: 0, rating: "Dangerous" },
];

/** Convenience helper to map a numeric score to its safety rating. */
export function getSafetyRating(score: number): SafetyRating {
  return RATING_BANDS.find((band) => score >= band.min)?.rating ?? "Dangerous";
}
