import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface PropertyDetailsFormSectionProps {
  propertyType: string;
  setPropertyType: (value: string) => void;
  bathrooms: string;
  setBathrooms: (value: string) => void;
}

export function PropertyDetailsFormSection({
  propertyType, setPropertyType, bathrooms, setBathrooms,
}: PropertyDetailsFormSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="propertyType">Property Type *</Label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="House">House</SelectItem>
            <SelectItem value="Condo">Condo</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Studio">Studio</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bathrooms">Number of Bathrooms *</Label>
        <Input
          id="bathrooms"
          type="number"
          min="0"
          step="0.5"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          placeholder="e.g., 2"
        />
      </div>
    </>
  );
}
