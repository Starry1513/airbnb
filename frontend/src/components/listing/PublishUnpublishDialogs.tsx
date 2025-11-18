import { PublishDialog } from '@/components/listing/PublishDialog';
import { UnPublishDialog } from '@/components/listing/UnPublishDialog';
import { AvailabilityRange } from '@/api/listing';

interface PublishUnpublishDialogsProps {
  publishDialogOpen: boolean;
  setPublishDialogOpen: (value: boolean) => void;
  unpublishDialogOpen: boolean;
  setUnpublishDialogOpen: (value: boolean) => void;
  selectedListingId: number;
  setSelectedListingId: (value: number) => void;
  onPublish: (data: { id: number; availability: AvailabilityRange[] }) => void;
  onUnpublish: (listingId: number) => void;
  publishReset: () => void;
  unpublishReset: () => void;
  publishError?: string;
  unpublishError?: string;
}

export function PublishUnpublishDialogs(props: PublishUnpublishDialogsProps) {
  const handlePublishChange = (open: boolean) => {
    props.setPublishDialogOpen(open);
    if (!open) { props.setSelectedListingId(0); props.publishReset(); }
  };

  const handleUnpublishChange = (open: boolean) => {
    props.setUnpublishDialogOpen(open);
    if (!open) { props.setSelectedListingId(0); props.unpublishReset(); }
  };

  return (
    <>
      {props.publishDialogOpen && (
        <PublishDialog open={props.publishDialogOpen} onOpenChange={handlePublishChange} onPublish={(availability) => props.selectedListingId && props.onPublish({ id: props.selectedListingId, availability })} error={props.publishError} />
      )}
      {props.unpublishDialogOpen && (
        <UnPublishDialog open={props.unpublishDialogOpen} listingId={props.selectedListingId} onUnPublish={props.onUnpublish} onOpenChange={handleUnpublishChange} error={props.unpublishError} />
      )}
    </>
  );
}
