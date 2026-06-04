/**
 * useSensorDebug
 * --------------
 * Day 1 helper hook. Starts the SensorManager, polls its snapshot on a fixed
 * UI cadence (decoupled from the 50 Hz sensor stream), and tears everything
 * down on unmount. Returns the latest snapshot for rendering.
 */
import { useEffect, useState } from "react";

import { sensorManager } from "./SensorManager";

/** How often the UI refreshes (10 Hz is plenty for human eyes). */
const UI_REFRESH_MS = 100;

export function useSensorDebug(active = true): SensorDebugSnapshot | null {
  const [snapshot, setSnapshot] = useState<SensorDebugSnapshot | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    sensorManager.start();

    const id = setInterval(() => {
      if (!cancelled) setSnapshot(sensorManager.getSnapshot());
    }, UI_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
      sensorManager.stop();
    };
  }, [active]);

  return snapshot;
}
