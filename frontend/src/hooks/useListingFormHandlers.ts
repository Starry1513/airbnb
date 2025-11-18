import { Bedroom } from '../api/listing';

interface FormHandlersParams {
  bedrooms: Bedroom[];
  setBedrooms: (value: Bedroom[]) => void;
  amenities: string[];
  setAmenities: (value: string[]) => void;
  amenityInput: string;
  setAmenityInput: (value: string) => void;
}

export function useListingFormHandlers({
  bedrooms, setBedrooms,
  amenities, setAmenities,
  amenityInput, setAmenityInput
}: FormHandlersParams) {
  const addBedroom = () => {
    setBedrooms([...bedrooms, { beds: 1, bedType: 'Single' }]);
  };

  const removeBedroom = (index: number) => {
    setBedrooms(bedrooms.filter((_, i) => i !== index));
  };

  const updateBedroom = (index: number, field: keyof Bedroom, value: string | number) => {
    const updated = [...bedrooms];
    updated[index] = { ...updated[index], [field]: value };
    setBedrooms(updated);
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  return { addBedroom, removeBedroom, updateBedroom, addAmenity, removeAmenity };
}
