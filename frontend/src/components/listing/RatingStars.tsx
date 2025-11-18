import { Star } from 'lucide-react';

interface RatingStarsProps {
  avgRating: number;
  onRatingClick: (rating: number) => void;
}

export function RatingStars({ avgRating, onRatingClick }: RatingStarsProps) {
  const roundedRating = Math.round(avgRating * 10) / 10;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((starNum) => (
        <Star
          key={starNum}
          className={`h-4 w-4 ${
            starNum <= fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : starNum === fullStars + 1 && hasHalfStar
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'text-muted-foreground'
          } cursor-pointer hover:scale-110 transition-transform`}
          onClick={(e) => { e.stopPropagation(); onRatingClick(starNum); }}
          aria-label={`Click to see all ${starNum}-star reviews`}
        />
      ))}
    </div>
  );
}
