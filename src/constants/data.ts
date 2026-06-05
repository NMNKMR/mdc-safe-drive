import type { ThemeColors } from "@/constants/colors";
import type { DriveRecord } from "@/db/driveRepository";

/** Maps a 0–100 score to its semantic safety tier for tinting rings/badges. */
export type ScoreTier = "optimal" | "good" | "caution" | "risky";

/** Buckets a 0–100 score into a semantic tier. */
export function scoreTier(score: number): ScoreTier {
  if (score >= 90) return "optimal";
  if (score >= 75) return "good";
  if (score >= 60) return "caution";
  return "risky";
}

/** Resolves a tier to its semantic safety colour from the active theme. */
export function tierColor(tier: ScoreTier, colors: ThemeColors): string {
  switch (tier) {
    case "optimal":
    case "good":
      return colors.safetyGreen;
    case "caution":
      return colors.safetyAmber;
    case "risky":
      return colors.safetyRed;
  }
}

// ---------------------------------------------------------------------------
// Display formatting
// ---------------------------------------------------------------------------
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "Jun 4" style short date from an epoch-ms timestamp. */
export function formatDriveDate(ms: number): string {
  const d = new Date(ms);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "24 min" / "1h 5m" duration label from seconds. */
export function formatDurationLabel(sec: number): string {
  const mins = Math.round(sec / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** mm:ss / hh:mm:ss clock label from seconds. */
export function formatClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Time-of-day label used as a drive title (no user-entered names yet). */
export function driveLabel(ms: number): string {
  const h = new Date(ms).getHours();
  if (h < 5) return "Night Drive";
  if (h < 12) return "Morning Drive";
  if (h < 17) return "Afternoon Drive";
  if (h < 21) return "Evening Drive";
  return "Night Drive";
}

// ---------------------------------------------------------------------------
// Recent drives (dashboard list) — derived from persisted records
// ---------------------------------------------------------------------------
export type RecentDrive = {
  id: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  badge: "GOLD" | "SILVER" | "CAUTION";
  tier: ScoreTier;
};

function badgeForTier(tier: ScoreTier): RecentDrive["badge"] {
  if (tier === "optimal") return "GOLD";
  if (tier === "good") return "SILVER";
  return "CAUTION";
}

/** Map a persisted drive to the dashboard card view-model. */
export function driveToCard(d: DriveRecord): RecentDrive {
  const tier = scoreTier(d.score);
  return {
    id: d.id,
    title: driveLabel(d.startedAt),
    date: formatDriveDate(d.startedAt),
    duration: formatDurationLabel(d.durationSec),
    score: d.score,
    badge: badgeForTier(tier),
    tier,
  };
}

/** Short celebratory/critique ribbon shown on the summary header. */
export function summaryRibbon(tier: ScoreTier): string {
  switch (tier) {
    case "optimal":
      return "TOP 10%";
    case "good":
      return "SOLID DRIVE";
    case "caution":
      return "ROOM TO GROW";
    case "risky":
      return "NEEDS WORK";
  }
}

// ---------------------------------------------------------------------------
// AI coaching — still dummy (no model wired up yet)
// ---------------------------------------------------------------------------
export type AiInsight = {
  headline: string;
  detail: string;
  tags: string[];
};

export const AI_INSIGHT: AiInsight = {
  headline: "You're 15% more likely to drive safely on Tuesday mornings.",
  detail: "Focus on maintaining steady acceleration during your commute today.",
  tags: ["SMOOTH BRAKING", "ALERT"],
};

/** Placeholder post-drive coaching paragraph (Pulse Coach Insights card). */
export const SUMMARY_AI_FEEDBACK =
  "Great anticipation on urban roads today. Focus on maintaining steady " +
  "deceleration approaching intersections to reach a perfect 100 score.";

/** Placeholder observation shown on the Insights screen (no model wired up). */
export const AI_COACH_OBSERVATION =
  "Your safety score peaks during morning commutes. Try maintaining that " +
  "same focus during your weekend evening trips where scores slightly dip.";

// ---------------------------------------------------------------------------
// Active-drive incident feed — dummy fallback before any event is detected
// ---------------------------------------------------------------------------
export type DriveIncident = {
  id: string;
  label: string;
  /** Relative time label e.g. "12 min ago", "now". */
  when: string;
  /** "warning" = amber attention, "ok" = green confirmation. */
  kind: "warning" | "ok";
};

export const RECENT_INCIDENTS: DriveIncident[] = [
  {
    id: "i-1",
    label: "Minor Harsh Braking",
    when: "12 min ago",
    kind: "warning",
  },
  {
    id: "i-2",
    label: "Consistent Speed Maintained",
    when: "now",
    kind: "ok",
  },
];
