const DAY_MS = 24 * 60 * 60 * 1000;

/** Parses a date (YYYY-MM-DD or full ISO) to a UTC-midnight timestamp. */
export const toDay = (value: string): number => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${value}`);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export const isValidDate = (value: string): boolean => !Number.isNaN(new Date(value).getTime());

/** Nights between two dates; a same-day booking counts as one night. */
export const nightsBetween = (start: string, end: string): number =>
  Math.max(1, Math.round((toDay(end) - toDay(start)) / DAY_MS));

/** True if [innerStart, innerEnd] lies inside [outerStart, outerEnd]. */
export const rangeWithin = (
  innerStart: string,
  innerEnd: string,
  outerStart: string,
  outerEnd: string,
): boolean => toDay(innerStart) >= toDay(outerStart) && toDay(innerEnd) <= toDay(outerEnd);

/**
 * True if two stays overlap. End dates are check-out days, so a stay ending
 * on the 5th does not clash with one starting on the 5th.
 */
export const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean =>
  toDay(aStart) < toDay(bEnd) && toDay(bStart) < toDay(aEnd);

/** Accepts {start,end} or the legacy {from,to}. */
export const normalizeRange = (
  range: Record<string, unknown> | null | undefined,
): { start: string; end: string } | null => {
  if (!range) return null;
  const start = range.start ?? range.from;
  const end = range.end ?? range.to;
  if (typeof start !== 'string' || typeof end !== 'string') return null;
  return { start, end };
};
