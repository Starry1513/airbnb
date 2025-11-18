import { Star } from 'lucide-react';
import { RatingDistribution } from '@/utils/ratingUtils';

interface RatingDistributionTooltipProps {
  ratingDistribution: RatingDistribution;
  onRatingClick: (rating: number) => void;
}

export function RatingDistributionTooltip({ ratingDistribution, onRatingClick }: RatingDistributionTooltipProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold mb-2">Rating Distribution</div>
      {[5, 4, 3, 2, 1].map((rating) => (
        <div
          key={rating}
          className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
          onClick={(e) => { e.stopPropagation(); onRatingClick(rating); }}
        >
          <div className="flex items-center gap-1 w-16">
            <span>{rating}</span>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="flex-1 bg-muted rounded-full h-2 min-w-[60px]">
            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${ratingDistribution[rating].percentage}%` }} />
          </div>
          <div className="w-20 text-right">
            {ratingDistribution[rating].percentage.toFixed(0)}% ({ratingDistribution[rating].count})
          </div>
        </div>
      ))}
      <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">Click any rating to view reviews</div>
    </div>
  );
}
