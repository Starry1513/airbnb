import { KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AmenityFormSectionProps {
  amenities: string[];
  amenityInput: string;
  setAmenityInput: (value: string) => void;
  onAdd: () => void;
  onRemove: (amenity: string) => void;
}
export function AmenityFormSection({
  amenities, amenityInput, setAmenityInput, onAdd, onRemove,
}: AmenityFormSectionProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Amenities</h3>
      <div className="flex gap-2">
        <Input
          value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
          onKeyDown={handleKeyDown} className="flex-1"  placeholder="e.g., WiFi, Pool, Parking"
        />
        <Button type="button" onClick={onAdd} variant="default">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {amenities.map((amenity) => (
          <Badge key={amenity} variant="secondary" className="flex items-center gap-1 px-3 py-1">
            {amenity}
            <Button
              type="button"  onClick={() => onRemove(amenity)} variant="ghost" size="sm"
              className="h-4 w-4 p-0 ml-1 hover:text-destructive">
              ×
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
