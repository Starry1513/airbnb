import { Review } from '@/api/listing';
import { ReviewItem } from './ReviewItem';

interface FilteredReviewsListProps {
  reviews: Review[];
  onRatingClick: (rating: number | null) => void;
}

export function FilteredReviewsList({ reviews, onRatingClick }: FilteredReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No reviews found for this rating
      </p>
    );
  }

  return (
    <>
      {reviews.map((review, index) => (
        <ReviewItem key={index} review={review} onRatingClick={onRatingClick} />
      ))}
    </>
  );
}
