import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvailabilityRange } from "../../api/listing";

interface DateRangeInputProps {
  range: AvailabilityRange;
  canRemove: boolean;
  onUpdate: (field: keyof AvailabilityRange, value: string) => void;
  onRemove: () => void;
  availableRange?: AvailabilityRange; // Optional available date range to restrict selection
}

export function DateRangeInput({ range, canRemove, onUpdate, onRemove, availableRange }: DateRangeInputProps) {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Start Date</Label>
        <Input
          type="date"
          value={range.start}
          onChange={(e) => onUpdate("start", e.target.value)}
          min={availableRange?.start}
          max={availableRange?.end}
        />
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-xs">End Date</Label>
        <Input
          type="date"
          value={range.end}
          onChange={(e) => onUpdate("end", e.target.value)}
          min={availableRange?.start}
          max={availableRange?.end}
        />
      </div>
      {canRemove && (
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          ×
        </Button>
      )}
    </div>
  );
}
