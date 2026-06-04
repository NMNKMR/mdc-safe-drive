/**
 * SensorManager
 * -------------
 * Owns the lifecycle of all device sensors during a drive. Responsibilities:
 *   1. Subscribe / tear down Accelerometer, Gyroscope, DeviceMotion (+ check
 *      Magnetometer availability) using the rates in `SAMPLING`.
 *   2. Normalize every sensor into ONE unit system (m/s², rad/s, degrees).
 *   3. Smooth the derived signals with an exponential moving average.
 *   4. Keep a rolling ring buffer (`WINDOW_MS`) of normalized frames for the
 *      detection engine (Day 2).
 *   5. Expose a debug snapshot (Day 1) so we can verify the pipeline on device.
 *
 * It is a singleton: there is only ever one set of physical sensors. Import the
 * exported `sensorManager` instance everywhere.
 *
 * NOTE: sensors fire up to 50x/sec. This class only keeps the latest values in
 * memory and never calls React state — UI reads `getSnapshot()` on its own
 * (throttled) cadence so the 50 Hz stream never drives 50 Hz re-renders.
 */
import {
  Accelerometer,
  DeviceMotion,
  Gyroscope,
  Magnetometer,
} from "expo-sensors";

import { SAMPLING, SMOOTHING_ALPHA, WINDOW_MS } from "@/constants/thresholds";

/** expo-sensors doesn't export its Subscription type; derive it. */
type Subscription = ReturnType<typeof Accelerometer.addListener>;

const RAD2DEG = 180 / Math.PI;

/**
 * Heavy smoothing for the gravity estimate. Gravity is ~constant and
 * low-frequency, so a small alpha isolates it from transient linear motion.
 */
const GRAVITY_ALPHA = 0.08;

const zero = (): Vec3 => ({ x: 0, y: 0, z: 0 });

/** Exponential moving average: smoothed = a*raw + (1-a)*prev. */
const ema = (prev: number, raw: number, a = SMOOTHING_ALPHA) =>
  a * raw + (1 - a) * prev;

const emaVec = (prev: Vec3, raw: Vec3, a: number): Vec3 => ({
  x: ema(prev.x, raw.x, a),
  y: ema(prev.y, raw.y, a),
  z: ema(prev.z, raw.z, a),
});

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const mag = (v: Vec3) => Math.sqrt(dot(v, v));

class SensorManager {
  private running = false;
  private subscriptions: Subscription[] = [];

  // --- latest raw values, in native units ---
  private rawAccelG: Vec3 = zero(); // G's
  private rawGyro: Vec3 = zero(); // rad/s
  private rawDeviceAccel: Vec3 = zero(); // m/s², gravity removed
  private rawAccelInclG: Vec3 = zero(); // m/s², gravity included (DeviceMotion)
  private rawRotationDeg: Vec3 = zero(); // degrees

  // --- low-pass gravity estimate + its unit direction ---
  private gravity: Vec3 = { x: 0, y: 0, z: 9.80665 }; // sane default (flat)

  // --- smoothed derived signals ---
  private sm = {
    forwardAccel: 0,
    lateralAccel: 0,
    verticalAccel: 0,
    yawRate: 0,
    accelMagnitude: 0,
    jerk: 0,
  };

  // --- ring buffer of normalized frames ---
  private buffer: SensorFrame[] = [];

  // --- jerk needs the previous magnitude + time ---
  private prevMagnitude = 0;
  private prevMagTime = 0;

  // --- rolling timestamps (last ~1s) to MEASURE actual delivery rate ---
  private tsAccel: number[] = [];
  private tsGyro: number[] = [];
  private tsDeviceMotion: number[] = [];

  private available = {
    accelerometer: false,
    gyroscope: false,
    deviceMotion: false,
    magnetometer: false,
  };

  /** A monotonic-ish clock. Date.now() is fine here (not in a workflow). */
  private now() {
    return Date.now();
  }

  /** Subscribe to all sensors and start buffering frames. Idempotent. */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.reset();

    // 1) availability (sensors degrade gracefully if one is missing)
    const [acc, gyr, dm, mag] = await Promise.all([
      Accelerometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync(),
      DeviceMotion.isAvailableAsync(),
      Magnetometer.isAvailableAsync(),
    ]);
    this.available = {
      accelerometer: acc,
      gyroscope: gyr,
      deviceMotion: dm,
      magnetometer: mag,
    };

    // 2) request update intervals
    Accelerometer.setUpdateInterval(SAMPLING.accelerometerMs);
    Gyroscope.setUpdateInterval(SAMPLING.gyroscopeMs);
    DeviceMotion.setUpdateInterval(SAMPLING.deviceMotionMs);

    // 3) add listeners. The accelerometer tick (fastest, ~50 Hz) is what
    //    assembles a normalized frame from the latest values of every sensor.
    if (acc) {
      this.subscriptions.push(
        Accelerometer.addListener(({ x, y, z }) => {
          this.rawAccelG = { x, y, z };
          this.markRate(this.tsAccel);
          this.buildFrame();
        }),
      );
    }
    if (gyr) {
      this.subscriptions.push(
        Gyroscope.addListener(({ x, y, z }) => {
          this.rawGyro = { x, y, z };
          this.markRate(this.tsGyro);
        }),
      );
    }
    if (dm) {
      this.subscriptions.push(
        DeviceMotion.addListener((data) => {
          if (data.acceleration) {
            this.rawDeviceAccel = {
              x: data.acceleration.x,
              y: data.acceleration.y,
              z: data.acceleration.z,
            };
          }
          if (data.accelerationIncludingGravity) {
            this.rawAccelInclG = {
              x: data.accelerationIncludingGravity.x,
              y: data.accelerationIncludingGravity.y,
              z: data.accelerationIncludingGravity.z,
            };
          }
          if (data.rotation) {
            this.rawRotationDeg = {
              x: data.rotation.beta * RAD2DEG, // pitch
              y: data.rotation.gamma * RAD2DEG, // roll
              z: data.rotation.alpha * RAD2DEG, // yaw/heading
            };
          }
          this.markRate(this.tsDeviceMotion);
        }),
      );
    }
  }

  /** Remove every listener and clear buffers. CRITICAL for battery. */
  stop(): void {
    this.subscriptions.forEach((s) => s.remove());
    this.subscriptions = [];
    this.running = false;
  }

  /** Read-only view of the ring buffer (Day 2 detectors consume this). */
  getBuffer(): readonly SensorFrame[] {
    return this.buffer;
  }

  // ---- internals -----------------------------------------------------------

  private reset() {
    this.buffer = [];
    this.rawAccelG = zero();
    this.rawGyro = zero();
    this.rawDeviceAccel = zero();
    this.rawAccelInclG = zero();
    this.rawRotationDeg = zero();
    this.gravity = { x: 0, y: 0, z: 9.80665 };
    this.sm = {
      forwardAccel: 0,
      lateralAccel: 0,
      verticalAccel: 0,
      yawRate: 0,
      accelMagnitude: 0,
      jerk: 0,
    };
    this.prevMagnitude = 0;
    this.prevMagTime = 0;
    this.tsAccel = [];
    this.tsGyro = [];
    this.tsDeviceMotion = [];
  }

  /** Record a delivery timestamp and drop entries older than 1s. */
  private markRate(list: number[]) {
    const t = this.now();
    list.push(t);
    const cutoff = t - 1000;
    while (list.length && list[0] < cutoff) list.shift();
  }

  /**
   * Assemble one normalized + smoothed frame from the latest values of all
   * sensors, then push it into the ring buffer (pruning anything older than
   * WINDOW_MS).
   *
   * Mount-independence comes from the GRAVITY VECTOR:
   *   - `yawRate` projects the gyroscope onto gravity → rotation about TRUE
   *     vertical regardless of how the phone is held (fixes false sharp turns
   *     from arm-swing / tilt).
   *   - `accelMagnitude` uses gravity-FREE linear acceleration → no 9.8 m/s²
   *     baseline, so the "excessive movement" threshold is meaningful.
   *   - `gravityUnit` lets the detector measure tilt for phone handling.
   *
   * Forward/lateral/vertical still use DeviceMotion's axes directly (a
   * reasonable approximation for a roughly-upright phone); full car-frame
   * projection of those axes is a later refinement.
   */
  private buildFrame() {
    const t = this.now();

    // 1) update the low-pass gravity estimate + unit direction
    this.gravity = emaVec(this.gravity, this.rawAccelInclG, GRAVITY_ALPHA);
    const gMag = mag(this.gravity) || 1;
    const gUnit: Vec3 = {
      x: this.gravity.x / gMag,
      y: this.gravity.y / gMag,
      z: this.gravity.z / gMag,
    };

    // 2) gravity-free linear acceleration magnitude (excludes the ~9.8 baseline)
    const linearMag = mag(this.rawDeviceAccel);

    // 3) true yaw rate = component of angular velocity about vertical (rad/s)
    const rawYaw = dot(this.rawGyro, gUnit);

    // jerk = Δ(linear magnitude) / Δt  (guard the first sample / zero dt)
    const dt = this.prevMagTime ? (t - this.prevMagTime) / 1000 : 0;
    const rawJerk = dt > 0 ? (linearMag - this.prevMagnitude) / dt : 0;
    this.prevMagnitude = linearMag;
    this.prevMagTime = t;

    // smooth every derived signal
    this.sm.forwardAccel = ema(this.sm.forwardAccel, this.rawDeviceAccel.y);
    this.sm.lateralAccel = ema(this.sm.lateralAccel, this.rawDeviceAccel.x);
    this.sm.verticalAccel = ema(this.sm.verticalAccel, this.rawDeviceAccel.z);
    this.sm.yawRate = ema(this.sm.yawRate, rawYaw);
    this.sm.accelMagnitude = ema(this.sm.accelMagnitude, linearMag);
    this.sm.jerk = ema(this.sm.jerk, rawJerk);

    const frame: SensorFrame = {
      t,
      forwardAccel: this.sm.forwardAccel,
      lateralAccel: this.sm.lateralAccel,
      verticalAccel: this.sm.verticalAccel,
      yawRate: this.sm.yawRate,
      accelMagnitude: this.sm.accelMagnitude,
      jerk: this.sm.jerk,
      rotationDeg: { ...this.rawRotationDeg },
      gravityUnit: gUnit,
    };

    this.buffer.push(frame);
    const cutoff = t - WINDOW_MS;
    while (this.buffer.length && this.buffer[0].t < cutoff) {
      this.buffer.shift();
    }
  }

  /** Build the Day 1 debug snapshot from current state. */
  getSnapshot(): SensorDebugSnapshot {
    const first = this.buffer[0];
    const last = this.buffer[this.buffer.length - 1] ?? null;

    return {
      isRunning: this.running,
      available: { ...this.available },
      actualHz: {
        accelerometer: this.tsAccel.length,
        gyroscope: this.tsGyro.length,
        deviceMotion: this.tsDeviceMotion.length,
      },
      raw: {
        accelG: { ...this.rawAccelG },
        gyro: { ...this.rawGyro },
        deviceAccel: { ...this.rawDeviceAccel },
        rotationDeg: { ...this.rawRotationDeg },
      },
      smoothed: { ...this.sm },
      bufferLength: this.buffer.length,
      bufferSpanMs: first && last ? last.t - first.t : 0,
      latest: last,
    };
  }
}

/** Singleton — there is only one set of physical sensors. */
export const sensorManager = new SensorManager();
