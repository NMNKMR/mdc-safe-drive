# SafeDrive — 4-Day Build Plan

~3–4 hours/day (≈14 hours total). **Core functionality days 1–3, stretch goals day 4.**
Each day ends in a working, demoable state so progress is never blocked.

---

## Day 1 — Scaffold + Sensor Foundation (3–4 hrs)
*Goal: app runs on a physical device and shows live sensor readings.*

- [ ] Init Expo app + Expo Router, set up navigation shell (Home / Active / Summary stubs).
- [ ] Add deps: `expo-sensors`, `expo-sqlite`, `expo-keep-awake`, state lib (Zustand), chart lib.
- [ ] Create `constants/thresholds.ts` (all thresholds + deduction values, documented).
- [ ] Build **Sensor Manager** (`src/sensors/`): subscribe/teardown Accelerometer + Gyroscope + DeviceMotion at chosen rates; low-pass smoothing; sliding window buffer.
- [ ] Debug screen showing live raw + filtered values; verify on physical device.

**End state:** real-time sensor values visible on a phone. ✅

---

## Day 2 — Detection Engine + Scoring + Session Flow (3–4 hrs)
*Goal: Start/End a drive and watch the score react to real events.*

- [ ] Build **Detection Engine** (`src/detection/`): implement all 6 events against thresholds, with per-event debounce/cooldown.
- [ ] Build **Scoring** (`src/scoring/`): start at 100, deduct per event, floor at 0, map to safety rating bands.
- [ ] Zustand **session store**: Start Drive → begin sampling + keep-awake; End Drive → stop + finalize.
- [ ] Wire **Active Drive** screen: live timer, live score, event counters, End button.
- [ ] Physically test each event (brake/accel/turn/handling motions) and sanity-check detection.

**End state:** full live drive loop works end-to-end (un-persisted). ✅

---

## Day 3 — Persistence + Dashboard + Summary (Data Viz) (3–4 hrs)
*Goal: drives are saved and the core dashboards look good.*

- [ ] SQLite schema + queries (`src/db/`): `drives` + `events` tables; save on End Drive.
- [ ] **Drive Summary** screen: score gauge, rating badge, duration, total events, event breakdown chart.
- [ ] **Dashboard/Home** screen: Start Drive action, recent-drives list, average-score widget, empty state.
- [ ] Apply theme (light + dark) and consistent score-color semantics across screens.

**End state:** complete core app — start, drive, score, save, review history. ✅ **All required features done.**

---

## Day 4 — Stretch Goals + Tuning + Polish (3–4 hrs)
*Goal: add the chosen stretch features and tighten everything.*

- [ ] **Event Timeline** (Drive Detail screen): chronological events from DB with icons/severity/timestamps.
- [ ] **Historical Comparison** screen: select drives, compare scores + event counts / trend.
- [ ] **AI Feedback**: Expo API Route calling Claude (server-side key); store + display coaching on summary.
- [ ] **Threshold tuning** against real drive data; reduce false positives.
- [ ] Polish: loading/empty states, dark-mode pass, README documenting thresholds & scoring.

**End state:** all stretch goals + documented, polished submission. ✅

---

## Daily Safety Net
- If a day runs long, **push only stretch/polish** — core (Days 1–3) is the priority.
- AI feedback (Day 4) is the most deferrable item; the app is fully functional without it.
- Keep raw sensor data out of the DB (store events + aggregates only) to protect performance/battery.
