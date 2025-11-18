import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UnPublishDialogProps {
  open: boolean;
  listingId: number;
  onUnPublish: (listingId: number) => void;
  onOpenChange?: (open: boolean) => void;
  error?: string;
}

export function UnPublishDialog({ open, listingId, onUnPublish, onOpenChange, error: externalError }: UnPublishDialogProps) {
  const [error, setError] = useState("");

  const handleUnPublish = () => {
    setError("");
    console.log('UnPublishing listing:', listingId);
    onUnPublish(listingId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unpublish Listing</DialogTitle>
          <DialogDescription>Are you sure you want to unpublish this listing?</DialogDescription>
        </DialogHeader>
        {(error || externalError) && (
          <Alert variant="destructive">
            <AlertDescription>{error || externalError}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={handleUnPublish}>Unpublish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
