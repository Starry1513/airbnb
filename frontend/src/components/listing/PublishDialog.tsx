import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvailabilityRange } from "../../api/listing";
import { DateRangeList } from "./DateRangeList";
import { usePublishDialogState } from "@/hooks/usePublishDialogState";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (availability: AvailabilityRange[]) => void;
  isPublishing?: boolean;
  error?: string;
}

export function PublishDialog({ open, onOpenChange, onPublish, isPublishing = false, error: externalError }: PublishDialogProps) {
  const { ranges, error, addRange, removeRange, updateRange, handlePublish, reset } = usePublishDialogState(onPublish);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Listing</DialogTitle>
          <DialogDescription>Add availability date ranges</DialogDescription>
        </DialogHeader>
        {(error || externalError) && (
          <Alert variant="destructive">
            <AlertDescription>{error || externalError}</AlertDescription>
          </Alert>
        )}
        <DateRangeList ranges={ranges} onUpdate={updateRange} onRemove={removeRange} onAdd={addRange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPublishing}>Cancel</Button>
          <Button onClick={handlePublish} disabled={isPublishing}>{isPublishing ? 'Publishing...' : 'Publish'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
