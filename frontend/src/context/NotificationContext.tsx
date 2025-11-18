import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Notification, getAllNotifications } from '@/api/notification';
import { Booking, getBookingsForListing } from '@/api/booking';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isPolling: boolean;
  triggerPoll: () => void; // Manually trigger polling
}

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLLING_INTERVAL = 10000; // Poll every 10 seconds
const MAX_NOTIFICATIONS = 100; // Keep maximum 100 notifications

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userEmail, isLoggedIn } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const previousBookingsRef = useRef<Booking[] | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load notifications from localStorage
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      const saved = localStorage.getItem(`notifications_${userEmail}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(parsed);
        } catch (e) {
          console.error('Error loading notifications from localStorage:', e);
        }
      }
    }
  }, [isLoggedIn, userEmail]);

  // Save notifications to localStorage
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    if (isLoggedIn && userEmail) {
      localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(newNotifications));
    }
  }, [isLoggedIn, userEmail]);

  // Poll for new notifications
  const pollNotifications = useCallback(async () => {
    if (!isLoggedIn || !userEmail) {
      console.log('[Notification] Skipping poll - not logged in');
      return;
    }

    setIsPolling(true);
    try {
      console.log('[Notification] Polling notifications, previous bookings count:', previousBookingsRef.current?.length || 0);
      const newNotifications = await getAllNotifications(
        previousBookingsRef.current,
        userEmail
      );

      console.log('[Notification] New notifications found:', newNotifications.length);
      if (newNotifications.length > 0) {
        console.log('[Notification] New notifications:', newNotifications);
        setNotifications(prev => {
          // Merge new notifications, deduplicating based on ID and bookingId+type combination
          const existingIds = new Set(prev.map(n => n.id));
          // Also check bookingId and type combination to prevent duplicates
          const existingBookingTypes = new Set(
            prev.map(n => `${n.type}_${n.bookingId}`)
          );
          const uniqueNew = newNotifications.filter(n => {
            const bookingTypeKey = `${n.type}_${n.bookingId}`;
            return !existingIds.has(n.id) && !existingBookingTypes.has(bookingTypeKey);
          });
          
          if (uniqueNew.length > 0) {
            console.log('[Notification] Adding', uniqueNew.length, 'unique notifications');
            const updated = [...uniqueNew, ...prev];
            
            // Limit number of notifications
            const limited = updated.slice(0, MAX_NOTIFICATIONS);
            saveNotifications(limited);
            console.log('[Notification] Total notifications after merge:', limited.length);
            return limited;
          }
          return prev;
        });
      }

      // Update previousBookingsRef - always update regardless of new notifications
      const bookingsResponse = await getBookingsForListing();
      previousBookingsRef.current = bookingsResponse.bookings || [];
      console.log('[Notification] Updated previous bookings count:', previousBookingsRef.current.length);
    } catch (error) {
      console.error('[Notification] Error polling notifications:', error);
    } finally {
      setIsPolling(false);
    }
  }, [isLoggedIn, userEmail, saveNotifications]);

  // Listen for manual notification check events
  useEffect(() => {
    const handleCheckNotifications = () => {
      console.log('[Notification] Received manual check event');
      pollNotifications();
    };
    window.addEventListener('checkNotifications', handleCheckNotifications);
    return () => {
      window.removeEventListener('checkNotifications', handleCheckNotifications);
    };
  }, [pollNotifications]);

  // Start/stop polling
  useEffect(() => {
    if (!isLoggedIn || !userEmail) {
      // Clear polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Clear notifications
      setNotifications([]);
      previousBookingsRef.current = null;
      return;
    }

    // Initialize bookings as baseline on first load
    const initializeBookings = async () => {
      try {
        console.log('[Notification] Initializing bookings for user:', userEmail);
        const bookingsResponse = await getBookingsForListing();
        previousBookingsRef.current = bookingsResponse.bookings || [];
        console.log('[Notification] Initialized with', previousBookingsRef.current.length, 'bookings');
      } catch (error) {
        console.error('[Notification] Error initializing bookings for notifications:', error);
      }
    };

    // Initialize bookings, then start polling
    initializeBookings().then(() => {
      console.log('[Notification] Starting polling interval');
      // Execute polling immediately once
      pollNotifications();
      // Set polling interval
      pollingIntervalRef.current = setInterval(pollNotifications, POLLING_INTERVAL);
    });

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isLoggedIn, userEmail, pollNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    if (isLoggedIn && userEmail) {
      localStorage.removeItem(`notifications_${userEmail}`);
    }
  }, [isLoggedIn, userEmail]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Manually trigger polling (for immediate checks after booking creation/acceptance/rejection)
  const triggerPoll = useCallback(() => {
    console.log('[Notification] Manual poll triggered');
    pollNotifications();
  }, [pollNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        isPolling,
        triggerPoll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

