import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateRangeInput } from "./DateRangeInput";
import { AvailabilityRange } from "../../api/listing";
import { useBookingDialogState } from "@/hooks/useBookingDialogState";

interface BookingDialogProps {
  open: boolean;
  availability: AvailabilityRange;
  onOpenChange: (open: boolean) => void;
  onBook: (startDate: string, endDate: string) => void;
  isBooking?: boolean;
  error?: string;
}

export function BookingDialog({ open, availability, onOpenChange, onBook, isBooking = false, error: externalError }: BookingDialogProps) {
  const { startDate, endDate, error, handleBook, reset, updateRange } = useBookingDialogState(availability, onBook);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Listing</DialogTitle>
          <DialogDescription>Select a date range to book the listing</DialogDescription>
        </DialogHeader>
        {(error || externalError) && (
          <Alert variant="destructive">
            <AlertDescription>{error || externalError}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <DateRangeInput range={{ start: startDate, end: endDate }} canRemove={false} onUpdate={updateRange} onRemove={() => {}} availableRange={{ start: availability.start, end: availability.end }} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isBooking}>Cancel</Button>
          <Button onClick={handleBook} disabled={isBooking}>{isBooking ? 'Booking...' : 'Book'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
