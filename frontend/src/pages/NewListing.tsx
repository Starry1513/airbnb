import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BasicInfoFormSection } from '@/components/listing/BasicInfoFormSection';
import { AddressFormSection } from '@/components/listing/AddressFormSection';
import { ThumbnailFormSection } from '@/components/listing/ThumbnailFormSection';
import { PropertyDetailsFormSection } from '@/components/listing/PropertyDetailsFormSection';
import { BedroomFormSection } from '@/components/listing/BedroomFormSection';
import { AmenityFormSection } from '@/components/listing/AmenityFormSection';
import { FormButtons } from '@/components/listing/FormButtons';
import { FormHeader } from '@/components/listing/FormHeader';
import { FormAlerts } from '@/components/listing/FormAlerts';
import { FormLoadingState } from '@/components/listing/FormLoadingState';
import { JSONUploadSection } from '@/components/listing/JSONUploadSection';
import { useListingFormState } from '@/hooks/useListingFormState';
import { useListingFormHandlers } from '@/hooks/useListingFormHandlers';
import { useListingMutation } from '@/hooks/useListingMutation';
import { useListingData } from '@/hooks/useListingData';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { useNavigate } from 'react-router-dom';

export default function NewListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const formState = useListingFormState();
  const handlers = useListingFormHandlers({ bedrooms: formState.bedrooms, setBedrooms: formState.setBedrooms, amenities: formState.amenities, setAmenities: formState.setAmenities, amenityInput: formState.amenityInput, setAmenityInput: formState.setAmenityInput });
  const mutation = useListingMutation({ id, isEditMode, setError: formState.setError, setSuccessMessage: formState.setSuccessMessage });
  const { listing, isLoading } = useListingData(id, isEditMode, formState);
  const { handleSubmit } = useFormSubmit({ ...formState, mutation, listing, isEditMode, setError: formState.setError, setSuccessMessage: formState.setSuccessMessage });

  if (isEditMode && (isLoading || !listing)) {
    return <FormLoadingState />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto p-4 max-w-2xl">
        <FormHeader isEditMode={isEditMode} />
        <FormAlerts error={formState.error} successMessage={formState.successMessage} />
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isEditMode && <JSONUploadSection setters={formState} setError={formState.setError} setSuccessMessage={formState.setSuccessMessage} />}
              <BasicInfoFormSection title={formState.title} setTitle={formState.setTitle} price={formState.price} setPrice={formState.setPrice} />
              <AddressFormSection street={formState.street} setStreet={formState.setStreet} city={formState.city} setCity={formState.setCity} state={formState.state} setState={formState.setState} postcode={formState.postcode} setPostcode={formState.setPostcode} country={formState.country} setCountry={formState.setCountry} />
              <ThumbnailFormSection thumbnail={formState.thumbnail} setThumbnail={formState.setThumbnail} />
              <PropertyDetailsFormSection propertyType={formState.propertyType} setPropertyType={formState.setPropertyType} bathrooms={formState.bathrooms} setBathrooms={formState.setBathrooms} />
              <BedroomFormSection bedrooms={formState.bedrooms} onAdd={handlers.addBedroom} onRemove={handlers.removeBedroom} onUpdate={handlers.updateBedroom} />
              <AmenityFormSection amenities={formState.amenities} amenityInput={formState.amenityInput} setAmenityInput={formState.setAmenityInput} onAdd={handlers.addAmenity} onRemove={handlers.removeAmenity} />
              <FormButtons isSubmitting={mutation.isPending} isEditMode={isEditMode} onCancel={() => navigate('/my-listings')} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
