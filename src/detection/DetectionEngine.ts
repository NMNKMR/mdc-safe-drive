/**
 * DetectionEngine
 * ---------------
 * Evaluates the SensorManager's ring buffer on each tick and emits driving
 * events. Detection logic is (almost) stateless — it re-reads the buffer every
 * call — except for per-event-type COOLDOWNS, which prevent one physical
 * maneuver from being counted many times in a row.
 *
 * All thresholds come from `@/constants/thresholds`. Tune there, not here.
 */
import {
  DEDUCTIONS,
  THRESHOLDS,
  type DrivingEventType,
} from "@/constants/thresholds";

/** A single detected driving event. */
export interface DrivingEvent {
  id: string;
  type: DrivingEventType;
  t: number; // epoch ms when detected
  value: number; // the signal value that triggered it (e.g. -4.2 m/s²)
  severity: 1 | 2 | 3; // 1 mild · 2 moderate · 3 severe
  deduction: number; // points removed from the score
}

/** Map how far past the threshold a value is to a 1–3 severity bucket. */
const severityFor = (value: number, threshold: number): 1 | 2 | 3 => {
  const ratio = Math.abs(value) / Math.abs(threshold || 1);
  if (ratio >= 2) return 3;
  if (ratio >= 1.5) return 2;
  return 1;
};

/** Dot product of two 3-vectors. */
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

export class DetectionEngine {
  /** Last emit time per type, for cooldown gating. */
  private lastEmit: Partial<Record<DrivingEventType, number>> = {};
  private seq = 0;

  reset(): void {
    this.lastEmit = {};
    this.seq = 0;
  }

  /**
   * Evaluate the buffer and return any events newly detected on this tick.
   * Returns [] when nothing fires (the common case).
   */
  detect(buffer: readonly SensorFrame[]): DrivingEvent[] {
    if (buffer.length < 2) return [];

    const latest = buffer[buffer.length - 1];
    const now = latest.t;
    const events: DrivingEvent[] = [];

    /** Emit unless this type is still cooling down. */
    const tryEmit = (
      type: DrivingEventType,
      value: number,
      severity: 1 | 2 | 3,
    ) => {
      const cooldown = THRESHOLDS[type].cooldownMs;
      const last = this.lastEmit[type] ?? -Infinity;
      if (now - last < cooldown) return;
      this.lastEmit[type] = now;
      events.push({
        id: `${type}-${now}-${this.seq++}`,
        type,
        t: now,
        value,
        severity,
        deduction: DEDUCTIONS[type],
      });
    };

    /** True if EVERY frame in the last `ms` satisfies `pred` (≥2 frames). */
    const sustained = (ms: number, pred: (f: SensorFrame) => boolean) => {
      const since = now - ms;
      const win = buffer.filter((f) => f.t >= since);
      return win.length >= 2 && win.every(pred);
    };

    // --- Harsh braking: forward accel strongly negative, sustained ---------
    {
      const th = THRESHOLDS.HARSH_BRAKE;
      if (sustained(th.sustainedMs, (f) => f.forwardAccel <= th.forwardAccel)) {
        tryEmit(
          "HARSH_BRAKE",
          latest.forwardAccel,
          severityFor(latest.forwardAccel, th.forwardAccel),
        );
      }
    }

    // --- Harsh acceleration: forward accel strongly positive, sustained ----
    {
      const th = THRESHOLDS.HARSH_ACCELERATION;
      if (sustained(th.sustainedMs, (f) => f.forwardAccel >= th.forwardAccel)) {
        tryEmit(
          "HARSH_ACCELERATION",
          latest.forwardAccel,
          severityFor(latest.forwardAccel, th.forwardAccel),
        );
      }
    }

    // --- Sharp turn: high yaw rate sustained -------------------------------
    {
      const th = THRESHOLDS.SHARP_TURN;
      if (sustained(th.sustainedMs, (f) => Math.abs(f.yawRate) >= th.yawRate)) {
        tryEmit(
          "SHARP_TURN",
          latest.yawRate,
          severityFor(latest.yawRate, th.yawRate),
        );
      }
    }

    // --- Aggressive steering: yaw swings sign with large delta in window ---
    {
      const th = THRESHOLDS.AGGRESSIVE_STEERING;
      const since = now - th.reversalWindowMs;
      const yaws = buffer.filter((f) => f.t >= since).map((f) => f.yawRate);
      if (yaws.length >= 2) {
        const max = Math.max(...yaws);
        const min = Math.min(...yaws);
        // opposite signs (a left-then-right yank) and a big enough swing
        if (max > 0 && min < 0 && max - min >= th.yawRateDelta) {
          tryEmit(
            "AGGRESSIVE_STEERING",
            max - min,
            severityFor(max - min, th.yawRateDelta),
          );
        }
      }
    }

    // --- Excessive device movement: big magnitude OR big jerk (instant) ----
    {
      const th = THRESHOLDS.EXCESSIVE_DEVICE_MOVEMENT;
      if (
        latest.accelMagnitude >= th.accelMagnitude ||
        Math.abs(latest.jerk) >= th.jerk
      ) {
        const byMag = latest.accelMagnitude >= th.accelMagnitude;
        tryEmit(
          "EXCESSIVE_DEVICE_MOVEMENT",
          byMag ? latest.accelMagnitude : latest.jerk,
          severityFor(
            byMag ? latest.accelMagnitude : latest.jerk,
            byMag ? th.accelMagnitude : th.jerk,
          ),
        );
      }
    }

    // --- Phone handling: device TILTED a lot over the window ---------------
    // Uses the gravity direction (mount-independent): the angle between the
    // current "down" vector and the one `windowMs` ago. Picking up / angling
    // the phone swings gravity; small walking sway does not.
    {
      const th = THRESHOLDS.PHONE_HANDLING;
      const since = now - th.windowMs;
      const past = buffer.find((f) => f.t >= since); // oldest within window
      if (past) {
        const cos = Math.min(
          1,
          Math.max(-1, dot(latest.gravityUnit, past.gravityUnit)),
        );
        const tiltDeg = Math.acos(cos) * (180 / Math.PI);
        if (tiltDeg >= th.orientationChangeDeg) {
          tryEmit(
            "PHONE_HANDLING",
            tiltDeg,
            severityFor(tiltDeg, th.orientationChangeDeg),
          );
        }
      }
    }

    return events;
  }
}
