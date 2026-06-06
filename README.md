# SafeDrive Pulse 🚗

A mobile app that uses a phone's motion sensors to analyze driving behavior in
real time and produce a **driving safety score**. It detects events like harsh
braking, sharp turns, and phone handling during a drive, then summarizes each
trip and tracks your safety trend over time — the same ideas behind insurance
telematics and fleet driver-safety systems.

## Demo Video:
https://drive.google.com/file/d/1YI-8NwhmvLI32ti03JypDVkWFP-EXW22/view?usp=drivesdk

## Screenshots:
<img width="250" height="520" alt="image" src="https://github.com/user-attachments/assets/f8cd5e3c-722b-46dd-aa6b-892e4c8a8d56" />
<img width="250" height="520" alt="image" src="https://github.com/user-attachments/assets/a929615c-f69f-402b-b965-dcf49b9d87ff" />
<img width="250" height="520" alt="image" src="https://github.com/user-attachments/assets/8dfcd561-5b99-4fec-8a42-ee6e46f67741" />
<img width="250" height="520" alt="image" src="https://github.com/user-attachments/assets/b004c9f2-e306-4471-adb2-0aa7a240f954" />
<img width="250" height="520" alt="image" src="https://github.com/user-attachments/assets/f41ae6ee-f4aa-459f-b500-75ccff4be082" />
<img width="250" height="520" alt="image" src="https://github.com/user-attachments/assets/5e793148-9271-4ffb-8538-2b30e1f654c6" />
<img width="250" height="520" alt="image" src="https://github.com/user-attachments/assets/4092af38-2ec5-45ed-9354-4089aeee5255" />


---

## Project Overview

- **Start / End a drive** — a session records sensor data only while active.
- **Real-time event detection** — six driving events are detected live from the
  accelerometer, gyroscope, and device-motion streams.
- **Live driving score** — starts at 100 and drops as risky events occur.
- **Drive summary** — final score, safety rating, duration, distance, total
  events, and a per-type breakdown (with an event timeline).
- **History + Insights** — every drive is saved locally (SQLite); the Insights
  screen charts your score trend, best drive, total drives, and streak.
- **Speed & distance** — derived live from GPS (coordinates are never stored).

> AI coaching text on the dashboard/insights/summary is currently **placeholder**
> (no model wired up) — see [Assumptions](#assumptions-made).

---

## Tech Stack

| Area | Choice |
|---|---|
| Framework | **Expo (managed)** SDK 55, React Native 0.83, React 19 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based, typed routes) |
| State | Zustand (+ `persist` via AsyncStorage for preferences) |
| Persistence | `expo-sqlite` (drives + events) |
| Sensors | `expo-sensors` (accelerometer, gyroscope, device motion, magnetometer) |
| Location | `expo-location` (live speed + distance only) |
| Charts | `react-native-svg` (custom score-trend chart) |
| Misc | `expo-keep-awake` (screen stays on during a drive), `react-native-reanimated` |

Runs in **Expo Go** — no native/dev build required.

---

## Sensors Used

| Sensor | Rate | Used for |
|---|---|---|
| **Accelerometer** | ~50 Hz | Total acceleration magnitude / jerk (excessive movement) |
| **Gyroscope** | ~50 Hz | Yaw rate → sharp turns & aggressive steering |
| **Device Motion** | ~20 Hz | Gravity-free linear acceleration (braking/accel), gravity vector (orientation), `accelerationIncludingGravity` (gravity estimate) |
| **Magnetometer** | — | Optional; availability checked only (heading not required) |
| **GPS** (`expo-location`) | ~1 Hz | Live speed and trip distance |

All raw readings are normalized into one unit system (m/s², rad/s, degrees) and
smoothed before any detection runs.

---

## Event Detection Strategy

1. **SensorManager** subscribes to all sensors only between Start and End, then
   builds one normalized **frame** per accelerometer tick (~50 Hz), each holding:
   forward/lateral/vertical acceleration, yaw rate, acceleration magnitude,
   jerk, and the gravity direction.
   - **Exponential moving average (EMA)** smoothing suppresses road-bump / sensor
     noise so single spikes don't trigger false events.
   - **Mount-independence via gravity:** yaw rate is the gyroscope **projected
     onto the gravity vector** (true rotation about vertical, regardless of how
     the phone is held), and "excessive movement" uses **gravity-free** linear
     acceleration (no constant 9.8 m/s² baseline).
   - Frames are kept in a rolling **ring buffer** (`WINDOW_MS = 2000 ms`).
2. **DetectionEngine** evaluates the buffer on a 10 Hz tick:
   - **Sustained-window checks** — an event must hold for a minimum duration
     (not a single sample) to count.
   - **Per-event cooldowns** — one physical maneuver isn't counted repeatedly.
3. All tunable numbers live in one file: [`src/constants/thresholds.ts`](src/constants/thresholds.ts).

---

## Threshold Values Chosen

Starting heuristics (tuned to reduce false positives during handheld testing;
expect refinement against real in-car data):

| Event | Trigger | Sustained | Cooldown |
|---|---|---|---|
| **Harsh Braking** | forward accel ≤ **−3.0 m/s²** | 300 ms | 2000 ms |
| **Harsh Acceleration** | forward accel ≥ **+3.0 m/s²** | 300 ms | 2000 ms |
| **Sharp Turn** | yaw rate ≥ **1.2 rad/s** (about true vertical) | 350 ms | 2500 ms |
| **Aggressive Steering** | yaw swing (sign flip) ≥ **2.5 rad/s** within 500 ms | — | 2000 ms |
| **Excessive Device Movement** | linear accel ≥ **18 m/s²** or jerk ≥ **60 m/s³** | — | 3000 ms |
| **Phone Handling** | gravity tilt ≥ **60°** over 1500 ms | — | 5000 ms |

Signal-processing constants: sampling 50 Hz (accel/gyro) / 20 Hz (device motion),
`SMOOTHING_ALPHA = 0.2`, gravity-estimate alpha `0.08`, buffer `2000 ms`.

---

## Driving Score Calculation Logic

- Every drive **starts at 100**.
- Each detected event **deducts** points:

  | Event | Deduction |
  |---|---|
  | Harsh Braking | −5 |
  | Harsh Acceleration | −5 |
  | Sharp Turn | −3 |
  | Aggressive Steering | −4 |
  | Excessive Device Movement | −5 |
  | Phone Handling | −10 |

- Score is **floored at 0**: `score = max(0, 100 − Σ deductions)`.
- The numeric score maps to a **safety rating**:

  | Score | Rating |
  |---|---|
  | 90–100 | Excellent |
  | 75–89 | Good |
  | 60–74 | Fair |
  | 40–59 | Risky |
  | 0–39 | Dangerous |

Scoring is implemented as pure functions in
[`src/scoring/score.ts`](src/scoring/score.ts).

---

## How to Run Locally

**Prerequisites:** Node.js 18+, the **Expo Go** app on a **physical phone**
(sensors and GPS do not work in simulators/emulators).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start

# 3. Scan the QR code with Expo Go (Android) or the Camera app (iOS)
```

Tips:
- **Use a real device** — the simulator has no accelerometer/gyroscope/GPS.
- **Test speed/distance outdoors** — GPS is unreliable indoors (see limitations).
- Grant **location** permission when prompted (optional; the app works without it).

---

## Project Structure

```
src/
  app/                # Expo Router screens (dashboard, drive, history, insights, settings)
  sensors/            # SensorManager: subscribe → normalize → smooth → buffer
  detection/          # DetectionEngine: events from the sensor buffer
  scoring/            # Pure score + rating helpers
  db/                 # SQLite connection, migrations, drive repository (queries)
  hooks/              # Data hooks (useDrives, useDrive, useInsights, ...)
  store/              # Zustand stores (drive session, preferences)
  components/         # Reusable UI (ScoreRing, ScoreTrendChart, ...)
  constants/          # thresholds, colors, spacing, typography, formatting helpers
  context/            # Theme provider
```

---

## Data & Privacy

- **All data stays on-device** in SQLite — no backend, no account.
- **Location is used transiently only** to compute live speed and accumulate
  distance. Raw coordinates are **never persisted or transmitted**; only the most
  recent fix is held in memory to measure the next leg and is cleared when the
  drive ends. The app does not record or display a route.

---

## Assumptions Made

- **Phone is reasonably stable** during a drive (mounted or resting). Forward /
  lateral axes assume a roughly upright phone; yaw and tilt are gravity-based and
  so are orientation-tolerant, but extreme handling can still be misread.
- **Thresholds are heuristic** starting points. They were tuned to behave on a
  handheld phone; real-world accuracy needs tuning against actual driving data.
- **Walking ≠ driving** — footstep impacts and body motion don't match a car's
  forces, so handheld/on-foot testing produces more noise than a mounted phone.
- **GPS speed/distance are best-effort** and degrade or read 0 indoors; they are
  an optional enhancement, not required for scoring.
- **Magnetometer is optional** and not used for detection.
- **AI coaching is placeholder** content; no model is integrated yet (planned to
  run server-side via an Expo API Route so no key ships in the app).
- **Single user / single device**; no authentication.

---

## Known Limitations & Future Work

- Indoor GPS can't measure short walks — distance may stay near 0 until you're
  outdoors with a clear sky view.
- Forward/lateral acceleration still assumes an upright phone; full car-frame
  projection (using GPS heading) is a future refinement.
- Stretch ideas: route replay/heatmap, real AI-generated feedback, richer
  historical comparison.
