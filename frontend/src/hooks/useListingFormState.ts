import { useState } from 'react';
import { Bedroom } from '../api/listing';

export function useListingFormState() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [bedrooms, setBedrooms] = useState<Bedroom[]>([{ beds: 1, bedType: 'Single' }]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  return {
    title, setTitle,
    price, setPrice,
    thumbnail, setThumbnail,
    street, setStreet,
    city, setCity,
    state, setState,
    postcode, setPostcode,
    country, setCountry,
    propertyType, setPropertyType,
    bathrooms, setBathrooms,
    bedrooms, setBedrooms,
    amenities, setAmenities,
    amenityInput, setAmenityInput,
    error, setError,
    successMessage, setSuccessMessage,
  };
}
