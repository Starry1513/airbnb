import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOneListing } from '../api/listing';
import { FormSetters } from '../utils/formPopulation';

export function useListingData(id: string | undefined, isEditMode: boolean, setters: FormSetters) {
  const hasLoadedData = useRef(false);
  const currentListingId = useRef<string | undefined>(undefined);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getOneListing({ listingId: Number(id) }),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (currentListingId.current !== id) {
      hasLoadedData.current = false;
      currentListingId.current = id;
    }
  }, [id]);

  useEffect(() => {
    if (listing && isEditMode && !hasLoadedData.current) {
      setters.setTitle(listing.title || '');
      setters.setPrice(String(listing.price || ''));
      setters.setThumbnail(listing.thumbnail || '');

      if (listing.address) {
        setters.setStreet(listing.address.street || '');
        setters.setCity(listing.address.city || '');
        setters.setState(listing.address.state || '');
        setters.setPostcode(listing.address.postcode || '');
        setters.setCountry(listing.address.country || '');
      }

      if (listing.metadata) {
        setters.setPropertyType(listing.metadata.propertyType || '');
        setters.setBathrooms(String(listing.metadata.bathrooms || ''));
        setters.setBedrooms(listing.metadata.bedrooms || [{ beds: 1, bedType: 'Single' }]);
        setters.setAmenities(listing.metadata.amenities || []);
      }

      hasLoadedData.current = true;
    }
  }, [listing, isEditMode]);

  return { listing, isLoading };
}
