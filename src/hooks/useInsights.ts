import { useMemo } from "react";

import { formatDriveDate } from "@/constants/data";
import { useDrives, useDriveStats } from "@/hooks/useDrives";

/** One point on the score-trend chart. */
export type TrendPoint = { score: number; label: string };

/** Newest N drives shown on the trend (oldest → newest after reversing). */
const TREND_LIMIT = 10;

const dayKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const isToday = (ms: number) => dayKey(ms) === dayKey(Date.now());

/** Consecutive calendar days (ending at the most recent drive) with a drive. */
function computeStreak(startTimes: number[]): number {
  if (startTimes.length === 0) return 0;
  const days = new Set(startTimes.map(dayKey));
  let count = 0;
  let cursor = startOfDay(Math.max(...startTimes));
  while (days.has(dayKey(cursor))) {
    count += 1;
    cursor -= 86_400_000; // step back one day
  }
  return count;
}

export function useInsights() {
  const { drives, loading, refresh } = useDrives();
  const { stats } = useDriveStats();

  return useMemo(() => {
    // drives are newest-first
    const latest = drives[0];
    const previous = drives[1];

    const hasDelta = drives.length >= 2;
    const deltaVsLast = hasDelta ? latest.score - previous.score : 0;

    const bestScore = drives.length
      ? Math.max(...drives.map((d) => d.score))
      : 0;

    // chronological points for the chart (oldest left, newest right)
    const recent = drives.slice(0, TREND_LIMIT).reverse();
    const trend: TrendPoint[] = recent.map((d, i) => ({
      score: d.score,
      label:
        i === recent.length - 1 && isToday(d.startedAt)
          ? "Today"
          : formatDriveDate(d.startedAt),
    }));

    return {
      loading,
      refresh,
      totalDrives: stats.totalDrives,
      averageScore: stats.averageScore,
      bestScore,
      deltaVsLast,
      hasDelta,
      streakDays: computeStreak(drives.map((d) => d.startedAt)),
      trend,
      canShowTrend: trend.length >= 2,
    };
  }, [drives, stats, loading, refresh]);
}
