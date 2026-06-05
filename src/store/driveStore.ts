/**
 * driveStore
 * ----------
 * The drive session state machine. Owns the lifecycle that ties everything
 * together:
 *
 *   startDrive() → sensorManager.start() + keep-awake + detection loop
 *   (loop tick) → engine.detect(buffer) → append events → recompute live score
 *   endDrive()  → stop loop + sensorManager.stop() + finalize summary
 *
 * The detection loop and engine live at module scope (not in zustand state)
 * so the 50 Hz sensor stream never triggers React re-renders directly — the
 * store only updates a few times per second.
 */
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";
import * as Location from "expo-location";
import { create } from "zustand";

import { SCORE_START, type DrivingEventType } from "@/constants/thresholds";
import { saveDrive } from "@/db/driveRepository";
import { DetectionEngine, type DrivingEvent } from "@/detection/DetectionEngine";
import { sensorManager } from "@/sensors/SensorManager";
import {
  eventBreakdown,
  getSafetyRating,
  scoreFromEvents,
} from "@/scoring/score";

const KEEP_AWAKE_TAG = "safedrive-active";
/** How often the detection loop runs (10 Hz). */
const TICK_MS = 100;

/** Short, collision-resistant id for a drive. */
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// --- module-scoped, non-reactive bits ---
const engine = new DetectionEngine();
let tickTimer: ReturnType<typeof setInterval> | null = null;
let locationSub: Location.LocationSubscription | null = null;
let lastCoord: { lat: number; lon: number; t: number } | null = null;

/** Great-circle distance between two lat/lon points, in kilometres. */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // earth radius km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Start GPS tracking for live speed + distance. Silently skips if denied.
 *
 * PRIVACY CONTRACT: location is used transiently ONLY to compute speed and
 * accumulate distance. Raw coordinates are never persisted to storage, never
 * sent off-device, and only the most recent fix is held in memory (`lastCoord`)
 * to measure the next leg — it is cleared when the drive ends. We do not track,
 * store, or expose the route.
 */
async function startLocation(set: (partial: Partial<DriveState>) => void) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return;

  lastCoord = null;
  locationSub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      // 0 = deliver fixes on the time cadence, not gated by a movement distance
      // (gating on distance suppressed updates indoors / at low speed).
      distanceInterval: 0,
    },
    (loc) => {
      const { latitude, longitude, speed, accuracy } = loc.coords;
      const t = loc.timestamp;

      if (!lastCoord) {
        lastCoord = { lat: latitude, lon: longitude, t };
      } else {
        const legKm = haversineKm(
          lastCoord.lat,
          lastCoord.lon,
          latitude,
          longitude,
        );
        // Only count travel larger than the GPS uncertainty so jitter while
        // stationary isn't accumulated as fake distance. The anchor (lastCoord)
        // is NOT advanced until a leg qualifies, so slow movement still adds up.
        const minLegKm = Math.max(accuracy ?? 999, 5) / 1000;
        if (legKm > minLegKm) {
          const dtH = (t - lastCoord.t) / 3_600_000;
          const derivedKmh = dtH > 0 ? legKm / dtH : 0;
          lastCoord = { lat: latitude, lon: longitude, t };
          const speedKmh =
            speed != null && speed >= 0 ? speed * 3.6 : derivedKmh;
          set({
            speedKmh: Math.max(0, speedKmh),
            distanceKm: useDriveStore.getState().distanceKm + legKm,
          });
          return;
        }
      }

      // No qualifying movement — still reflect live GPS speed if reported.
      if (speed != null && speed >= 0) set({ speedKmh: speed * 3.6 });
    },
  );
}

function stopLocation() {
  locationSub?.remove();
  locationSub = null;
  lastCoord = null;
}

type DriveStatus = "idle" | "driving" | "ended";

type DriveState = {
  status: DriveStatus;
  startedAt: number | null;
  endedAt: number | null;
  durationSec: number;
  events: DrivingEvent[];
  score: number;
  rating: string;
  speedKmh: number;
  distanceKm: number;
  /** Id of the most recently saved drive (set on endDrive). */
  lastDriveId: string | null;

  startDrive: () => Promise<void>;
  endDrive: () => void;
  reset: () => void;

  // derived helpers
  breakdown: () => Partial<Record<DrivingEventType, number>>;
};

export const useDriveStore = create<DriveState>((set, get) => ({
  status: "idle",
  startedAt: null,
  endedAt: null,
  durationSec: 0,
  events: [],
  score: SCORE_START,
  rating: getSafetyRating(SCORE_START),
  speedKmh: 0,
  distanceKm: 0,
  lastDriveId: null,

  startDrive: async () => {
    if (get().status === "driving") return;

    engine.reset();
    await sensorManager.start();
    await activateKeepAwakeAsync(KEEP_AWAKE_TAG);

    const startedAt = Date.now();
    set({
      status: "driving",
      startedAt,
      endedAt: null,
      durationSec: 0,
      events: [],
      score: SCORE_START,
      rating: getSafetyRating(SCORE_START),
      speedKmh: 0,
      distanceKm: 0,
      lastDriveId: null,
    });

    // GPS runs independently of the sensor loop (~1 Hz); failures are non-fatal.
    startLocation(set).catch(() => {});

    tickTimer = setInterval(() => {
      const detected = engine.detect(sensorManager.getBuffer());
      const { events, startedAt: s } = get();

      const nextEvents = detected.length ? [...events, ...detected] : events;
      const score = detected.length ? scoreFromEvents(nextEvents) : get().score;

      set({
        events: nextEvents,
        score,
        rating: getSafetyRating(score),
        durationSec: s ? Math.floor((Date.now() - s) / 1000) : 0,
      });
    }, TICK_MS);
  },

  endDrive: () => {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    sensorManager.stop();
    stopLocation();
    deactivateKeepAwake(KEEP_AWAKE_TAG);

    const { startedAt, events, distanceKm } = get();
    const endedAt = Date.now();
    const score = scoreFromEvents(events);
    const rating = getSafetyRating(score);
    const durationSec = startedAt ? Math.floor((endedAt - startedAt) / 1000) : 0;
    const id = uid();

    set({
      status: "ended",
      endedAt,
      durationSec,
      score,
      rating,
      lastDriveId: id,
    });

    // Persist in the background — the summary reads live state, so a slow
    // write never blocks the UI. Skip empty/instant taps with no real drive.
    if (startedAt && durationSec > 0) {
      saveDrive(
        {
          id,
          startedAt,
          endedAt,
          durationSec,
          distanceKm,
          score,
          rating,
        },
        events,
      ).catch((err) => console.warn("Failed to save drive:", err));
    }
  },

  reset: () => {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    stopLocation();
    engine.reset();
    set({
      status: "idle",
      startedAt: null,
      endedAt: null,
      durationSec: 0,
      events: [],
      score: SCORE_START,
      rating: getSafetyRating(SCORE_START),
      speedKmh: 0,
      distanceKm: 0,
      lastDriveId: null,
    });
  },

  breakdown: () => eventBreakdown(get().events),
}));
