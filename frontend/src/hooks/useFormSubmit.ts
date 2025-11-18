import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bedroom } from '../api/listing';

interface FormData {
  title: string;
  price: string;
  thumbnail: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  propertyType: string;
  bathrooms: string;
  bedrooms: Bedroom[];
  amenities: string[];
}

interface UseFormSubmitParams extends FormData {
  setError: (value: string) => void;
  setSuccessMessage: (value: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listing?: any;
  isEditMode: boolean;
}

export function useFormSubmit(params: UseFormSubmitParams) {
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    params.setError('');
    params.setSuccessMessage('');

    if (!params.title.trim()) {
      params.setError('Title is required');
      return;
    }
    if (!params.price || Number(params.price) <= 0) {
      params.setError('Valid price is required');
      return;
    }
    if (!params.propertyType.trim()) {
      params.setError('Property type is required');
      return;
    }
    if (!params.bathrooms || Number(params.bathrooms) < 0) {
      params.setError('Number of bathrooms is required');
      return;
    }
    if (params.bedrooms.length === 0) {
      params.setError('At least one bedroom is required');
      return;
    }

    const address = { street: params.street || '', city: params.city || '', state: params.state || '', postcode: params.postcode || '', country: params.country || '' };
    const metadata = { propertyType: params.propertyType, bathrooms: Number(params.bathrooms), bedrooms: params.bedrooms, amenities: params.amenities };
    const defaultThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

    const thumbnailToUse = params.thumbnail || (params.isEditMode && params.listing?.thumbnail ? params.listing.thumbnail : defaultThumbnail);
    const newData = { title: params.title.trim(), address, price: Number(params.price), thumbnail: thumbnailToUse, metadata };

    if (params.isEditMode && params.listing) {
      const hasChanged = newData.title !== params.listing.title || newData.price !== params.listing.price || newData.thumbnail !== params.listing.thumbnail || JSON.stringify(newData.address) !== JSON.stringify(params.listing.address) || JSON.stringify(newData.metadata) !== JSON.stringify(params.listing.metadata);
      if (!hasChanged) {
        navigate('/my-listings');
        return;
      }
    }

    params.mutation.mutate(newData);
  };

  return { handleSubmit };
}
