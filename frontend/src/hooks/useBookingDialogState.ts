import { useState } from 'react';
import { AvailabilityRange } from '../api/listing';
import { validateBookingDates } from '../utils/bookingValidation';

export function useBookingDialogState(availability: AvailabilityRange, onBook: (start: string, end: string) => void) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState("");

  const handleBook = () => {
    setError("");
    const validation = validateBookingDates(startDate, endDate, availability);

    if (!validation.valid) {
      setError(validation.error || "Invalid booking dates");
      return;
    }

    onBook(startDate, endDate);
  };

  const reset = () => {
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const updateRange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') setStartDate(value);
    else setEndDate(value);
  };

  return { startDate, endDate, error, handleBook, reset, updateRange };
}
