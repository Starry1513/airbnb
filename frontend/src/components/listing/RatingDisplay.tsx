import { Tooltip } from '@/components/ui/tooltip';
import { RatingDistribution } from '@/utils/ratingUtils';
import { RatingStars } from './RatingStars';
import { RatingDistributionTooltip } from './RatingDistributionTooltip';

interface RatingDisplayProps {
  avgRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  onRatingClick: (rating: number | null) => void;
}

export const RatingDisplay = ({ avgRating, totalReviews, ratingDistribution, onRatingClick }: RatingDisplayProps) => {
  if (avgRating === 0) return null;

  return (
    <Tooltip content={<RatingDistributionTooltip ratingDistribution={ratingDistribution} onRatingClick={onRatingClick} />}>
      <div className="flex items-center gap-2">
        <RatingStars avgRating={avgRating} onRatingClick={onRatingClick} />
        <span className="text-sm text-muted-foreground">
          {avgRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    </Tooltip>
  );
};
