import { useMemo, useState } from "react";

import {
  driveToCard,
  type RecentDrive,
  type ScoreTier,
} from "@/constants/data";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDrives } from "@/hooks/useDrives";

/** A filter selects all drives ("all") or one safety tier. */
export type HistoryFilter = "all" | ScoreTier;

export const HISTORY_FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "optimal", label: "Optimal" },
  { key: "good", label: "Good" },
  { key: "caution", label: "Caution" },
  { key: "risky", label: "At Risk" },
];

/** Lowercased, searchable text for a card (title, date, score, badge). */
const haystack = (c: RecentDrive) =>
  `${c.title} ${c.date} ${c.score} ${c.badge}`.toLowerCase();

export function useDriveHistory() {
  const { drives, loading, refresh } = useDrives();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const debouncedSearch = useDebouncedValue(search, 300);

  const cards = useMemo(() => drives.map(driveToCard), [drives]);

  const results = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return cards.filter((c) => {
      const matchesFilter = filter === "all" || c.tier === filter;
      const matchesSearch = q === "" || haystack(c).includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [cards, filter, debouncedSearch]);

  return {
    /** Filtered + searched cards to render. */
    results,
    /** Total drives before filtering (to distinguish empty-DB vs no-match). */
    total: cards.length,
    loading,
    refresh,
    search,
    setSearch,
    filter,
    setFilter,
    filters: HISTORY_FILTERS,
    /** True while the debounce is catching up to the typed query. */
    searching: search !== debouncedSearch,
  };
}
