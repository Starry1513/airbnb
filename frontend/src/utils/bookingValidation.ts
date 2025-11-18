import { AvailabilityRange } from '../api/listing';

export function validateBookingDates(
  startDate: string,
  endDate: string,
  availability: AvailabilityRange
): { valid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return { valid: false, error: "Please select a start and end date" };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return { valid: false, error: "Start date must be before end date" };
  }

  const availStart = new Date(availability.start);
  const availEnd = new Date(availability.end);

  if (start < availStart || end > availEnd) {
    return { valid: false, error: "Selected date range is not available. Please choose dates within the available ranges." };
  }

  return { valid: true };
}
