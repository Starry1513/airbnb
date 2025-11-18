import { Bedroom } from '../api/listing';

export interface FormSetters {
  setTitle: (value: string) => void;
  setPrice: (value: string) => void;
  setThumbnail: (value: string) => void;
  setStreet: (value: string) => void;
  setCity: (value: string) => void;
  setState: (value: string) => void;
  setPostcode: (value: string) => void;
  setCountry: (value: string) => void;
  setPropertyType: (value: string) => void;
  setBathrooms: (value: string) => void;
  setBedrooms: (value: Bedroom[]) => void;
  setAmenities: (value: string[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const populateFormFromJson = (data: any, setters: FormSetters) => {
  setters.setTitle(data.title || '');
  setters.setPrice(String(data.price || ''));
  setters.setThumbnail(data.thumbnail || '');

  if (data.address) {
    setters.setStreet(data.address.street || '');
    setters.setCity(data.address.city || '');
    setters.setState(data.address.state || '');
    setters.setPostcode(data.address.postcode || '');
    setters.setCountry(data.address.country || '');
  }

  if (data.metadata) {
    setters.setPropertyType(data.metadata.propertyType || '');
    setters.setBathrooms(String(data.metadata.bathrooms || ''));
    setters.setBedrooms(data.metadata.bedrooms || [{ beds: 1, bedType: 'Single' }]);
    setters.setAmenities(data.metadata.amenities || []);
  }
};
