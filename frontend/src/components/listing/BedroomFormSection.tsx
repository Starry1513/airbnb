import { Button } from "@/components/ui/button";
import { Bedroom } from "../../api/listing";
import { BedroomItem } from "./BedroomItem";

interface BedroomFormSectionProps {
  bedrooms: Bedroom[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof Bedroom, value: string | number) => void;
}

export function BedroomFormSection({
  bedrooms,
  onAdd,
  onRemove,
  onUpdate,
}: BedroomFormSectionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Bedrooms *</h3>
        <Button type="button" onClick={onAdd} size="sm" variant="default">
          + Add Bedroom
        </Button>
      </div>
      <div className="space-y-3">
        {bedrooms.map((bedroom, index) => (
          <BedroomItem
            key={index}
            bedroom={bedroom}
            canRemove={bedrooms.length > 1}
            onUpdate={(field, value) => onUpdate(index, field, value)}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
}
