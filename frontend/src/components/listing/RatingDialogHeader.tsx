import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RatingDialogHeaderProps {
  selectedRating: number | null;
  filteredCount: number;
}

export function RatingDialogHeader({ selectedRating, filteredCount }: RatingDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>
        {selectedRating !== null
          ? `${selectedRating}-Star Reviews (${filteredCount})`
          : 'All Reviews by Rating'
        }
      </DialogTitle>
      <DialogDescription>
        {selectedRating !== null
          ? `Showing all reviews with ${selectedRating} star${selectedRating !== 1 ? 's' : ''} rating`
          : 'Click on a rating below to filter reviews'
        }
      </DialogDescription>
    </DialogHeader>
  );
}
