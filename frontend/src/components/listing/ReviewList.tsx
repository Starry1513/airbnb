import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewItem } from './ReviewItem';
import { Review } from '@/api/listing';

interface ReviewListProps {
    reviews: Review[];
    canLeaveReview: boolean;
    onLeaveReviewClick: () => void;
    onRatingClick: (rating: number) => void;
}

export const ReviewList = ({ 
  reviews, 
  canLeaveReview, 
  onLeaveReviewClick,
  onRatingClick 
}: ReviewListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reviews ({reviews.length})</CardTitle>
          {canLeaveReview && (
            <Button
              onClick={onLeaveReviewClick}
              size="sm"
            >
                            Leave a Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewItem
              key={index}
              review={review}
              onRatingClick={onRatingClick}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet</p>
        )}
      </CardContent>
    </Card>
  );
};

