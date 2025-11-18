import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationItem } from '../components/notification/NotificationItem';

// Mock the dependencies
vi.mock('../components/notification/NotificationIcon', () => ({
  NotificationIcon: ({ type }: { type: string }) => <div data-testid="notification-icon">{type}</div>,
}));

vi.mock('../utils/timeUtils', () => ({
  formatTimeAgo: (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  },
}));

describe('NotificationItem Component', () => {
  const mockNotification = {
    id: '1',
    type: 'booking_request',
    message: 'New booking request',
    timestamp: Date.now() - 300000, // 5 minutes ago
    read: false,
  };

  describe('Rendering', () => {
    it('should render notification message', () => {
      const handleClick = vi.fn();
      render(<NotificationItem notification={mockNotification} onClick={handleClick} />);

      expect(screen.getByText('New booking request')).toBeInTheDocument();
    });

    it('should render notification icon', () => {
      const handleClick = vi.fn();
      render(<NotificationItem notification={mockNotification} onClick={handleClick} />);

      const icon = screen.getByTestId('notification-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('booking_request');
    });

    it('should render timestamp', () => {
      const handleClick = vi.fn();
      render(<NotificationItem notification={mockNotification} onClick={handleClick} />);

      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });

    it('should show blue indicator for unread notifications', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <NotificationItem notification={mockNotification} onClick={handleClick} />
      );

      const indicator = container.querySelector('.bg-blue-500');
      expect(indicator).toBeInTheDocument();
    });

    it('should hide blue indicator for read notifications', () => {
      const handleClick = vi.fn();
      const readNotification = { ...mockNotification, read: true };
      const { container } = render(
        <NotificationItem notification={readNotification} onClick={handleClick} />
      );

      const indicator = container.querySelector('.bg-blue-500');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply special styles for unread notifications', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <NotificationItem notification={mockNotification} onClick={handleClick} />
      );

      const wrapper = container.querySelector('.bg-blue-50');
      expect(wrapper).toBeInTheDocument();

      const border = container.querySelector('.border-l-blue-500');
      expect(border).toBeInTheDocument();
    });

    it('should apply bold font to unread notification messages', () => {
      const handleClick = vi.fn();
      render(
        <NotificationItem notification={mockNotification} onClick={handleClick} />
      );

      const message = screen.getByText('New booking request');
      expect(message.className).toContain('font-semibold');
    });

    it('should apply normal styles for read notifications', () => {
      const handleClick = vi.fn();
      const readNotification = { ...mockNotification, read: true };
      const { container } = render(
        <NotificationItem notification={readNotification} onClick={handleClick} />
      );

      const wrapper = container.querySelector('.bg-blue-50');
      expect(wrapper).not.toBeInTheDocument();

      const message = screen.getByText('New booking request');
      expect(message.className).not.toContain('font-semibold');
    });

    it('should apply cursor-pointer class to entire component', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <NotificationItem notification={mockNotification} onClick={handleClick} />
      );

      const wrapper = container.querySelector('.cursor-pointer');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick callback when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<NotificationItem notification={mockNotification} onClick={handleClick} />);

      const notification = screen.getByText('New booking request').closest('div');
      if (notification) {
        await user.click(notification);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onClick multiple times when clicked multiple times', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<NotificationItem notification={mockNotification} onClick={handleClick} />);

      const notification = screen.getByText('New booking request').closest('div');
      if (notification) {
        await user.click(notification);
        await user.click(notification);
        await user.click(notification);
        expect(handleClick).toHaveBeenCalledTimes(3);
      }
    });
  });

  describe('Different Notification Types', () => {
    it('should render booking accepted notification', () => {
      const handleClick = vi.fn();
      const acceptedNotification = {
        ...mockNotification,
        type: 'booking_accepted',
        message: 'Your booking was accepted',
      };

      render(<NotificationItem notification={acceptedNotification} onClick={handleClick} />);

      expect(screen.getByText('Your booking was accepted')).toBeInTheDocument();
      expect(screen.getByTestId('notification-icon')).toHaveTextContent('booking_accepted');
    });

    it('should render booking declined notification', () => {
      const handleClick = vi.fn();
      const declinedNotification = {
        ...mockNotification,
        type: 'booking_declined',
        message: 'Your booking was declined',
      };

      render(<NotificationItem notification={declinedNotification} onClick={handleClick} />);

      expect(screen.getByText('Your booking was declined')).toBeInTheDocument();
      expect(screen.getByTestId('notification-icon')).toHaveTextContent('booking_declined');
    });
  });

  describe('Time Formatting', () => {
    it('should correctly format recent time', () => {
      const handleClick = vi.fn();
      const recentNotification = {
        ...mockNotification,
        timestamp: Date.now() - 30000, // 30 seconds ago
      };

      render(<NotificationItem notification={recentNotification} onClick={handleClick} />);

      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('should correctly format minute-level time', () => {
      const handleClick = vi.fn();
      const minutesAgoNotification = {
        ...mockNotification,
        timestamp: Date.now() - 600000, // 10 minutes ago
      };

      render(<NotificationItem notification={minutesAgoNotification} onClick={handleClick} />);

      expect(screen.getByText('10m ago')).toBeInTheDocument();
    });

    it('should correctly format hour-level time', () => {
      const handleClick = vi.fn();
      const hoursAgoNotification = {
        ...mockNotification,
        timestamp: Date.now() - 7200000, // 2 hours ago
      };

      render(<NotificationItem notification={hoursAgoNotification} onClick={handleClick} />);

      expect(screen.getByText('2h ago')).toBeInTheDocument();
    });
  });
});
