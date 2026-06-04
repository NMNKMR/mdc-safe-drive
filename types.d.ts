type ThemeMode = "light" | "dark" | "system";

/**
 * Sensor data contracts shared by the Sensor Manager, the detection engine,
 * and the Day 1 debug screen.
 */

type Vec3 = { x: number; y: number; z: number };

/**
 * One normalized, time-aligned reading. This is what gets pushed into the
 * ring buffer and what the detection engine (Day 2) will threshold against.
 * All signals are in consistent units (m/s², rad/s, degrees) regardless of
 * each sensor's native units.
 */
interface SensorFrame {
  t: number; // timestamp (ms)

  forwardAccel: number; // m/s²  — along the car's travel axis (brake/accel)
  lateralAccel: number; // m/s²  — side-to-side
  verticalAccel: number; // m/s² — up/down (road bumps)
  yawRate: number; // rad/s     — rotation about TRUE vertical (gravity-projected)
  accelMagnitude: number; // m/s² — |linear accel| (gravity removed)
  jerk: number; // m/s³        — rate of change of accelMagnitude
  rotationDeg: Vec3; // degrees — device orientation (debug only)
  gravityUnit: Vec3; // unit vector along gravity (tilt / phone handling)
}

/** Snapshot consumed by the debug screen to prove the pipeline works. */
interface SensorDebugSnapshot {
  isRunning: boolean;

  /** Each required sensor exists on this device. */
  available: {
    accelerometer: boolean;
    gyroscope: boolean;
    deviceMotion: boolean;
    magnetometer: boolean;
  };

  /** Measured (not requested) delivery rate over the last ~1s. */
  actualHz: {
    accelerometer: number;
    gyroscope: number;
    deviceMotion: number;
  };

  /** Latest raw values in each sensor's NATIVE units. */
  raw: {
    accelG: Vec3; // G's (accelerometer)
    gyro: Vec3; // rad/s
    deviceAccel: Vec3; // m/s², gravity removed (DeviceMotion)
    rotationDeg: Vec3; // degrees
  };

  /** EMA-smoothed derived signals — exactly what detectors will use. */
  smoothed: {
    forwardAccel: number;
    lateralAccel: number;
    verticalAccel: number;
    yawRate: number;
    accelMagnitude: number;
    jerk: number;
  };

  /** Ring-buffer health. */
  bufferLength: number; // # frames held (~100 @ 50Hz / 2000ms)
  bufferSpanMs: number; // newest.t - oldest.t (should hover near WINDOW_MS)

  latest: SensorFrame | null;
}
