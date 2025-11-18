import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Review } from '@/api/listing';
import { RatingDistribution } from '@/utils/ratingUtils';
import { RatingFilterList } from './RatingFilterList';
import { FilteredReviewsList } from './FilteredReviewsList';
import { RatingDialogHeader } from './RatingDialogHeader';

interface RatingFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRating: number | null;
  onRatingSelect: (rating: number | null) => void;
  reviews: Review[];
  ratingDistribution: RatingDistribution;
}

export const RatingFilterDialog = ({ open, onOpenChange, selectedRating, onRatingSelect, reviews, ratingDistribution }: RatingFilterDialogProps) => {
  const filteredReviews = selectedRating !== null ? reviews.filter((review) => Math.round(review.score) === selectedRating) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <RatingDialogHeader selectedRating={selectedRating} filteredCount={filteredReviews.length} />
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {selectedRating === null ? (
            <RatingFilterList reviews={reviews} ratingDistribution={ratingDistribution} onRatingSelect={onRatingSelect} />
          ) : (
            <FilteredReviewsList reviews={filteredReviews} onRatingClick={onRatingSelect} />
          )}
        </div>
        <DialogFooter>
          {selectedRating !== null && (
            <Button variant="outline" onClick={() => onRatingSelect(null)}>Back to All Ratings</Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

