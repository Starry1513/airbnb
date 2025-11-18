import { Review } from '../api/listing';

export interface RatingDistribution {
    [key: number]: {
        count: number;
        percentage: number;
    };
}

export const calculateRatingDistribution = (reviews: Review[]): RatingDistribution => {
  const distribution: RatingDistribution = {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };
    
  reviews.forEach((review) => {
    const rating = Math.round(review.score);
    if (rating >= 1 && rating <= 5) {
      distribution[rating].count++;
    }
  });
    
  const totalReviews = reviews.length;
  if (totalReviews > 0) {
    Object.keys(distribution).forEach((key) => {
      const rating = Number(key);
      distribution[rating].percentage = (distribution[rating].count / totalReviews) * 100;
    });
  }
    
  return distribution;
};

export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
};

export const filterReviewsByRating = (reviews: Review[], rating: number): Review[] => {
  return reviews.filter((review) => Math.round(review.score) === rating);
};

