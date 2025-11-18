import { Input } from "@/components/ui/input";

interface AddressFormSectionProps {
  street: string;
  setStreet: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  postcode: string;
  setPostcode: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
}

export function AddressFormSection({
  street, setStreet, city, setCity, state, setState,
  postcode, setPostcode, country, setCountry,
}: AddressFormSectionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Address</h3>
      <Input
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        placeholder="Street Address"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={city}  onChange={(e) => setCity(e.target.value)}
          placeholder="City"
        />
        <Input
          value={state}  onChange={(e) => setState(e.target.value)}
          placeholder="State"
        />
        <Input
          value={postcode}  onChange={(e) => setPostcode(e.target.value)}
          placeholder="Postcode"
        />
        <Input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
        />
      </div>
    </div>
  );
}
