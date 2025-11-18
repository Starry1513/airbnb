import { Review } from '@/api/listing';
import { RatingDistribution } from '@/utils/ratingUtils';
import { RatingFilterItem } from './RatingFilterItem';

interface RatingFilterListProps {
  reviews: Review[];
  ratingDistribution: RatingDistribution;
  onRatingSelect: (rating: number) => void;
}

export function RatingFilterList({ reviews, ratingDistribution, onRatingSelect }: RatingFilterListProps) {
  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const reviewsForRating = reviews.filter((review) => Math.round(review.score) === rating);
        return (
          <RatingFilterItem
            key={rating}
            rating={rating}
            reviewCount={reviewsForRating.length}
            distribution={ratingDistribution}
            onClick={onRatingSelect}
          />
        );
      })}
    </div>
  );
}
