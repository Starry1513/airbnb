import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewItem } from '../components/listing/ReviewItem';

// Mock StarRating component
vi.mock('../components/listing/StarRating', () => ({
  StarRating: ({ rating, onClick, title }: { rating: number; onClick: () => void; title: string }) => (
    <div
      data-testid="star-rating"
      data-rating={rating}
      onClick={onClick}
      title={title}
    >
      {rating} stars
    </div>
  ),
}));

describe('ReviewItem Component', () => {
  const mockReview = {
    score: 4.5,
    comment: 'Great place to stay!',
    userEmail: 'test@example.com',
  };

  describe('Rendering', () => {
    it('should render review score', () => {
      const handleRatingClick = vi.fn();
      render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toBeInTheDocument();
      expect(rating).toHaveAttribute('data-rating', '4.5');
    });

    it('should render review comment', () => {
      const handleRatingClick = vi.fn();
      render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      expect(screen.getByText('Great place to stay!')).toBeInTheDocument();
    });

    it('should render user email', () => {
      const handleRatingClick = vi.fn();
      render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should correctly format star rating title', () => {
      const handleRatingClick = vi.fn();
      render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      // 4.5 should be rounded to 5
      expect(rating).toHaveAttribute('title', 'Click to see all 5-star reviews');
    });
  });

  describe('Rating Rounding', () => {
    it('should round 4.5 score to 5', () => {
      const handleRatingClick = vi.fn();
      render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toHaveAttribute('title', 'Click to see all 5-star reviews');
    });

    it('should round 4.4 score to 4', () => {
      const handleRatingClick = vi.fn();
      const review = { ...mockReview, score: 4.4 };
      render(<ReviewItem review={review} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toHaveAttribute('title', 'Click to see all 4-star reviews');
    });

    it('should round 3.7 score to 4', () => {
      const handleRatingClick = vi.fn();
      const review = { ...mockReview, score: 3.7 };
      render(<ReviewItem review={review} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toHaveAttribute('title', 'Click to see all 4-star reviews');
    });

    it('should round 2.3 score to 2', () => {
      const handleRatingClick = vi.fn();
      const review = { ...mockReview, score: 2.3 };
      render(<ReviewItem review={review} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toHaveAttribute('title', 'Click to see all 2-star reviews');
    });
  });

  describe('Interactions', () => {
    it('should call onRatingClick when star rating is clicked', async () => {
      const handleRatingClick = vi.fn();
      const user = userEvent.setup();

      render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      await user.click(rating);

      expect(handleRatingClick).toHaveBeenCalledTimes(1);
      expect(handleRatingClick).toHaveBeenCalledWith(5); // 4.5 rounded to 5
    });

    it('should call onRatingClick multiple times when clicked multiple times', async () => {
      const handleRatingClick = vi.fn();
      const user = userEvent.setup();

      render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      await user.click(rating);
      await user.click(rating);
      await user.click(rating);

      expect(handleRatingClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Different Ratings', () => {
    it('should correctly render 5-star review', () => {
      const handleRatingClick = vi.fn();
      const review = { ...mockReview, score: 5 };
      render(<ReviewItem review={review} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toHaveAttribute('data-rating', '5');
    });

    it('should correctly render 1-star review', () => {
      const handleRatingClick = vi.fn();
      const review = { ...mockReview, score: 1 };
      render(<ReviewItem review={review} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toHaveAttribute('data-rating', '1');
    });

    it('should correctly render 3-star review', () => {
      const handleRatingClick = vi.fn();
      const review = { ...mockReview, score: 3 };
      render(<ReviewItem review={review} onRatingClick={handleRatingClick} />);

      const rating = screen.getByTestId('star-rating');
      expect(rating).toHaveAttribute('data-rating', '3');
    });
  });

  describe('Styling and Layout', () => {
    it('should have correct border style (except last one)', () => {
      const handleRatingClick = vi.fn();
      const { container } = render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      const reviewDiv = container.querySelector('.border-b');
      expect(reviewDiv).toBeInTheDocument();
    });

    it('should have correct padding', () => {
      const handleRatingClick = vi.fn();
      const { container } = render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      const reviewDiv = container.querySelector('.pb-4');
      expect(reviewDiv).toBeInTheDocument();
    });

    it('should correctly layout stars and user email', () => {
      const handleRatingClick = vi.fn();
      const { container } = render(<ReviewItem review={mockReview} onRatingClick={handleRatingClick} />);

      // Check container with stars and email
      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).toBeInTheDocument();
    });
  });
});
