import { StarRating } from './StarRating';
import { RatingDistribution } from '@/utils/ratingUtils';

interface RatingFilterItemProps {
  rating: number;
  reviewCount: number;
  distribution: RatingDistribution;
  onClick: (rating: number) => void;
}

export function RatingFilterItem({ rating, reviewCount, distribution, onClick }: RatingFilterItemProps) {
  return (
    <div
      className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
      onClick={() => onClick(rating)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{rating}</span>
          <StarRating rating={rating} />
        </div>
        <span className="text-sm text-muted-foreground">
          {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {distribution[rating].percentage.toFixed(0)}% of all reviews
      </div>
    </div>
  );
}
