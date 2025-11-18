import { useState } from 'react';
import { AvailabilityRange } from '../api/listing';
import { validateDateRanges, getValidRanges } from '../utils/dateValidation';

export function usePublishDialogState(onPublish: (availability: AvailabilityRange[]) => void) {
  const [ranges, setRanges] = useState<AvailabilityRange[]>([{ start: "", end: "" }]);
  const [error, setError] = useState("");

  const addRange = () => {
    setRanges([...ranges, { start: "", end: "" }]);
    setError("");
  };

  const removeRange = (index: number) => {
    setRanges(ranges.filter((_, i) => i !== index));
    setError("");
  };

  const updateRange = (index: number, field: keyof AvailabilityRange, value: string) => {
    const updated = [...ranges];
    updated[index] = { ...updated[index], [field]: value };
    setRanges(updated);
    setError("");
  };

  const handlePublish = () => {
    setError("");
    const validation = validateDateRanges(ranges);

    if (!validation.valid) {
      setError(validation.error || "Invalid date ranges");
      return;
    }

    const validRanges = getValidRanges(ranges);
    console.log('Publishing with availability:', validRanges);
    onPublish(validRanges);
  };

  const reset = () => {
    setRanges([{ start: "", end: "" }]);
    setError("");
  };

  return { ranges, error, addRange, removeRange, updateRange, handlePublish, reset };
}
