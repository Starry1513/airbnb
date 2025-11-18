import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { StarRating } from '../components/listing/StarRating';

// Mock lucide-react Star component
vi.mock('lucide-react', () => ({
  Star: ({ className }: { className: string }) => (
    <div data-testid="star" className={className}>★</div>
  ),
}));

describe('StarRating Component', () => {
  describe('Rendering', () => {
    it('should render correct number of stars', () => {
      const { container } = render(<StarRating rating={3} maxRating={5} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      expect(stars).toHaveLength(5);
    });

    it('should render custom maximum rating number of stars', () => {
      const { container } = render(<StarRating rating={2} maxRating={10} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      expect(stars).toHaveLength(10);
    });

    it('should correctly fill stars', () => {
      const { container } = render(<StarRating rating={3} maxRating={5} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      // First 3 should be filled (have fill-yellow-400 class)
      expect(stars[0].className).toContain('fill-yellow-400');
      expect(stars[1].className).toContain('fill-yellow-400');
      expect(stars[2].className).toContain('fill-yellow-400');

      // Last 2 should be unfilled (have text-muted-foreground class)
      expect(stars[3].className).toContain('text-muted-foreground');
      expect(stars[4].className).toContain('text-muted-foreground');
    });
  });

  describe('Sizing', () => {
    it('should apply small size class', () => {
      const { container } = render(<StarRating rating={3} size="sm" />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      stars.forEach(star => {
        expect(star.className).toContain('h-3 w-3');
      });
    });

    it('should apply medium size class (default)', () => {
      const { container } = render(<StarRating rating={3} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      stars.forEach(star => {
        expect(star.className).toContain('h-4 w-4');
      });
    });

    it('should apply large size class', () => {
      const { container } = render(<StarRating rating={3} size="lg" />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      stars.forEach(star => {
        expect(star.className).toContain('h-5 w-5');
      });
    });
  });

  describe('Rating Boundaries', () => {
    it('should handle 0 rating', () => {
      const { container } = render(<StarRating rating={0} maxRating={5} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      stars.forEach(star => {
        expect(star.className).toContain('text-muted-foreground');
      });
    });

    it('should handle maximum rating', () => {
      const { container } = render(<StarRating rating={5} maxRating={5} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      stars.forEach(star => {
        expect(star.className).toContain('fill-yellow-400');
      });
    });

    it('should handle rating exceeding maximum', () => {
      const { container } = render(<StarRating rating={10} maxRating={5} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      // All stars should be filled
      stars.forEach(star => {
        expect(star.className).toContain('fill-yellow-400');
      });
    });

    it('should handle negative rating', () => {
      const { container } = render(<StarRating rating={-1} maxRating={5} />);
      const stars = container.querySelectorAll('[data-testid="star"]');

      // All stars should be unfilled
      stars.forEach(star => {
        expect(star.className).toContain('text-muted-foreground');
      });
    });
  });

  describe('Custom Properties', () => {
    it('should apply custom class name', () => {
      const { container } = render(
        <StarRating rating={3} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
