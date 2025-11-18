import { Button } from "@/components/ui/button";
import { DateRangeInput } from "./DateRangeInput";
import { AvailabilityRange } from "../../api/listing";

interface DateRangeListProps {
  ranges: AvailabilityRange[];
  onUpdate: (index: number, field: keyof AvailabilityRange, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

export function DateRangeList({ ranges, onUpdate, onRemove, onAdd }: DateRangeListProps) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {ranges.map((range, index) => (
        <DateRangeInput
          key={index}
          range={range}
          canRemove={ranges.length > 1}
          onUpdate={(field, value) => onUpdate(index, field, value)}
          onRemove={() => onRemove(index)}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        + Add Date Range
      </Button>
    </div>
  );
}
