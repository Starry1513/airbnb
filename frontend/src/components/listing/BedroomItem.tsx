import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Bedroom } from "../../api/listing";

interface BedroomItemProps {
  bedroom: Bedroom;
  canRemove: boolean;
  onUpdate: (field: keyof Bedroom, value: string | number) => void;
  onRemove: () => void;
}

export function BedroomItem({ bedroom, canRemove, onUpdate, onRemove }: BedroomItemProps) {
  return (
    <div className="flex gap-3 items-center">
      <Input
        type="number"
        min="1"
        value={bedroom.beds}
        onChange={(e) => onUpdate("beds", Number(e.target.value))}
        className="w-20"
        placeholder="Beds"
      />
      <Select value={bedroom.bedType} onValueChange={(value) => onUpdate("bedType", value)}>
        <SelectTrigger className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Single">Single</SelectItem>
          <SelectItem value="Double">Double</SelectItem>
          <SelectItem value="Queen">Queen</SelectItem>
          <SelectItem value="King">King</SelectItem>
          <SelectItem value="Bunk">Bunk</SelectItem>
        </SelectContent>
      </Select>
      {canRemove && (
        <Button type="button" onClick={onRemove} variant="destructive" size="sm">
          Remove
        </Button>
      )}
    </div>
  );
}
