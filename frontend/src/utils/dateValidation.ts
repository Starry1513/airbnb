import { AvailabilityRange } from '../api/listing';

export function validateDateRanges(ranges: AvailabilityRange[]): { valid: boolean; error?: string } {
  const validRanges = ranges.filter((r) => r.start && r.end);

  if (validRanges.length === 0) {
    return { valid: false, error: "Please add at least one valid date range" };
  }

  const invalidRanges = validRanges.filter((r) => {
    const start = new Date(r.start);
    const end = new Date(r.end);
    return start >= end;
  });

  if (invalidRanges.length > 0) {
    return { valid: false, error: "Start date must be before end date for all ranges" };
  }

  return { valid: true };
}

export function getValidRanges(ranges: AvailabilityRange[]): AvailabilityRange[] {
  return ranges.filter((r) => r.start && r.end);
}
