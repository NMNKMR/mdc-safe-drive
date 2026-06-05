import {
  getSafetyRating,
  SCORE_MIN,
  SCORE_START,
  type DrivingEventType,
} from "@/constants/thresholds";
import type { DrivingEvent } from "@/detection/DetectionEngine";

export { getSafetyRating };

/** Final score = 100 minus all deductions, floored at SCORE_MIN. */
export function scoreFromEvents(events: DrivingEvent[]): number {
  const deducted = events.reduce((sum, e) => sum + e.deduction, 0);
  return Math.max(SCORE_MIN, SCORE_START - deducted);
}

/** Count of each event type (only types that occurred are included). */
export function eventBreakdown(
  events: DrivingEvent[],
): Partial<Record<DrivingEventType, number>> {
  const out: Partial<Record<DrivingEventType, number>> = {};
  for (const e of events) out[e.type] = (out[e.type] ?? 0) + 1;
  return out;
}
