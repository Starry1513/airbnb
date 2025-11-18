import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishListing, unpublishListing, deleteListing, AvailabilityRange } from '../api/listing';

interface UseMyListingMutationsOptions {
  onPublishSuccess?: () => void;
  onUnpublishSuccess?: () => void;
}

export function useMyListingMutations(options?: UseMyListingMutationsOptions) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: ({ id, availability }: { id: number; availability: AvailabilityRange[] }) =>
      publishListing(id, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      options?.onPublishSuccess?.();
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: unpublishListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      options?.onUnpublishSuccess?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  });

  return { publishMutation, unpublishMutation, deleteMutation };
}
