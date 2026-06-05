import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  getDrive,
  getDriveEvents,
  getDriveStats,
  listDrives,
  type DriveRecord,
  type DriveStats,
  type StoredEvent,
} from "@/db/driveRepository";

/** List of all drives, newest first. */
export function useDrives() {
  const [drives, setDrives] = useState<DriveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setDrives(await listDrives());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { drives, loading, refresh };
}

/** Aggregate stats (total drives + average score) for the dashboard. */
export function useDriveStats() {
  const [stats, setStats] = useState<DriveStats>({
    totalDrives: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setStats(await getDriveStats());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { stats, loading, refresh };
}

/** A single drive plus its events (for the detail / timeline screen). */
export function useDrive(id: string | undefined) {
  const [drive, setDrive] = useState<DriveRecord | null>(null);
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) {
      setDrive(null);
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      const [d, e] = await Promise.all([getDrive(id), getDriveEvents(id)]);
      setDrive(d);
      setEvents(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { drive, events, loading, refresh };
}
