import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Star } from '../components/star/Star';

describe('Star Component', () => {
  describe('Rendering', () => {
    it('should render a filled star', () => {
      const { container } = render(<Star filled={true} half={false} size={24} />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('should render a half star', () => {
      const { container } = render(<Star filled={false} half={true} size={24} />);
      const svg = container.querySelector('svg');
      const linearGradient = container.querySelector('linearGradient');

      expect(svg).toBeInTheDocument();
      expect(linearGradient).toBeInTheDocument();
      expect(linearGradient).toHaveAttribute('id', 'half');
    });

    it('should render an empty star', () => {
      const { container } = render(<Star filled={false} half={false} size={24} />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });
  });

  describe('Sizing', () => {
    it('should correctly set small size (16px)', () => {
      const { container } = render(<Star filled={true} half={false} size={16} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('should correctly set large size (32px)', () => {
      const { container } = render(<Star filled={true} half={false} size={32} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should correctly set default size (24px)', () => {
      const { container } = render(<Star filled={true} half={false} size={24} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });

  describe('Styling', () => {
    it('filled star should have correct class name', () => {
      const { container } = render(<Star filled={true} half={false} size={24} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('text-yellow-400');
    });

    it('half star should have correct class name', () => {
      const { container } = render(<Star filled={false} half={true} size={24} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('text-yellow-400');
    });

    it('empty star should have correct class name', () => {
      const { container } = render(<Star filled={false} half={false} size={24} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('text-yellow-400');
    });
  });

  describe('Edge Cases', () => {
    it('should handle both filled and half being true (filled takes priority)', () => {
      const { container } = render(<Star filled={true} half={true} size={24} />);
      const svg = container.querySelector('svg');

      // Should render filled star (filled takes priority)
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('should handle both filled and half being false', () => {
      const { container } = render(<Star filled={false} half={false} size={24} />);
      const svg = container.querySelector('svg');

      // Should render empty star
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('should handle very small size (1px)', () => {
      const { container } = render(<Star filled={true} half={false} size={1} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '1');
      expect(svg).toHaveAttribute('height', '1');
    });

    it('should handle very large size (100px)', () => {
      const { container } = render(<Star filled={true} half={false} size={100} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '100');
      expect(svg).toHaveAttribute('height', '100');
    });
  });

  describe('SVG Path', () => {
    it('all star states should contain the same path', () => {
      const expectedPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

      // Filled star
      const { container: filled } = render(<Star filled={true} half={false} size={24} />);
      expect(filled.querySelector('path')).toHaveAttribute('d', expectedPath);

      // Half star
      const { container: half } = render(<Star filled={false} half={true} size={24} />);
      expect(half.querySelector('path')).toHaveAttribute('d', expectedPath);

      // Empty star
      const { container: empty } = render(<Star filled={false} half={false} size={24} />);
      expect(empty.querySelector('path')).toHaveAttribute('d', expectedPath);
    });
  });
});
