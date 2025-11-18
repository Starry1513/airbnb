import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { newListing, updateListing } from '../api/listing';

interface MutationParams {
  id?: string;
  isEditMode: boolean;
  setError: (value: string) => void;
  setSuccessMessage: (value: string) => void;
}

export function useListingMutation({ id, isEditMode, setError, setSuccessMessage }: MutationParams) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingData: Parameters<typeof newListing>[0]) => {
      if (isEditMode) {
        return updateListing(Number(id), listingData);
      } else {
        return newListing(listingData);
      }
    },
    onSuccess: () => {
      setSuccessMessage(`Listing ${isEditMode ? 'updated' : 'created'} successfully!`);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['listing', id] });
      }
      setTimeout(() => navigate('/my-listings'), 1500);
    },
    onError: (err: Error) => {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} listing`);
      setSuccessMessage('');
    },
  });
}
