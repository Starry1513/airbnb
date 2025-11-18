import { Star } from './star/Star';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

export function StarRating({ rating, maxRating = 5, size = 16 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star key={i} filled={i < fullStars} half={i === fullStars && hasHalfStar} size={size} />
      ))}
    </div>
  );
}
