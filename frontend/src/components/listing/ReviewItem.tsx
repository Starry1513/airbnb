import { StarRating } from './StarRating';

interface Review {
    score: number;
    comment: string;
    userEmail: string;
}

interface ReviewItemProps {
    review: Review;
    onRatingClick: (rating: number) => void;
}

export const ReviewItem = ({ review, onRatingClick }: ReviewItemProps) => {
  const reviewRating = Math.round(review.score);

  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <StarRating
          rating={review.score}
          onClick={() => onRatingClick(reviewRating)}
          title={`Click to see all ${reviewRating}-star reviews`}
        />
        <span className="text-sm text-muted-foreground">
          {review.userEmail}
        </span>
      </div>
      <p className="text-sm">{review.comment}</p>
    </div>
  );
};

