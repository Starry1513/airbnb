import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInfoFormSectionProps {
  title: string;
  setTitle: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
}

export function BasicInfoFormSection({
  title,
  setTitle,
  price,
  setPrice,
}: BasicInfoFormSectionProps) {
  return (
    <>
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Listing Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter listing title"
        />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">Price per Night ($) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="price"  type="number" min="0" step="0.01"  value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="pl-7"
            placeholder="0.00"
          />
        </div>
      </div>
    </>
  );
}
