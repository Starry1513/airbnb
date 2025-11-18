import { describe, it, expect, beforeEach } from 'vitest';
import { calculateProfits, formatDateLocal } from '../utils/profitUtils';
import { Booking } from '../api/booking';
import { OneListing } from '../pages/Loading';

describe('calculateProfits', () => {
  // Helper function to create a booking
  const createBooking = (
    id: number,
    listingId: number,
    startDate: string,
    endDate: string,
    totalPrice: number,
    status: string = 'accepted',
    owner: string = 'test@example.com'
  ): Booking => ({
    id,
    owner,
    dateRange: { start: startDate, end: endDate },
    totalPrice,
    listingId,
    status,
  });

  // Helper function to create a listing
  const createListing = (id: number, owner: string = 'test@example.com'): OneListing => ({
    id,
    owner,
    title: `Listing ${id}`,
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia',
    },
    price: 100,
    thumbnail: '',
    metadata: {
      propertyType: 'House',
      bathrooms: 1,
      bedrooms: [{ beds: 1, bedType: 'King' }],
      amenities: [],
    },
    published: true,
    availability: [],
  });

  describe('Basic Functionality', () => {
    it('should calculate profit for today (0 days ago)', () => {
      // Use the same date calculation method as profitUtils
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateLocal(tomorrow);

      const bookings: Booking[] = [
        createBooking(1, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 150.00),
      ];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      expect(result.profits).toBeDefined();
      expect(result.profits.length).toBeGreaterThan(0);

      // Find today's profit (daysAgo === 0)
      const todayProfit = result.profits.find(p => p.daysAgo === 0);
      expect(todayProfit).toBeDefined();
      if (todayProfit) {
        expect(todayProfit.amount).toBe(150.00);
        expect(todayProfit.bookingCount).toBe(1);
      }
    });

    it('should calculate profit for 5 days ago', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      fiveDaysAgo.setHours(0, 0, 0, 0);
      const fiveDaysAgoStr = formatDateLocal(fiveDaysAgo);
      const nextDay = new Date(fiveDaysAgo);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = formatDateLocal(nextDay);

      const bookings: Booking[] = [
        createBooking(1, 1, `${fiveDaysAgoStr}T00:00:00.000Z`, `${nextDayStr}T00:00:00.000Z`, 200.00),
      ];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      const fiveDaysAgoProfit = result.profits.find(p => p.daysAgo === 5);
      expect(fiveDaysAgoProfit).toBeDefined();
      if (fiveDaysAgoProfit) {
        expect(fiveDaysAgoProfit.amount).toBe(200.00);
        expect(fiveDaysAgoProfit.bookingCount).toBe(1);
      }
    });

    it('should aggregate profits from multiple bookings on the same day', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateLocal(tomorrow);

      const bookings: Booking[] = [
        createBooking(1, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 150.00),
        createBooking(2, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 200.00),
        createBooking(3, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 100.00),
      ];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      const todayProfit = result.profits.find(p => p.daysAgo === 0);
      if (todayProfit) {
        expect(todayProfit.amount).toBe(450.00); // 150 + 200 + 100
        expect(todayProfit.bookingCount).toBe(3);
      }
      expect(result.totalProfit).toBe(450.00);
      expect(result.totalBookings).toBe(3);
    });
  });

  describe('Filtering', () => {
    it('should only include bookings with accepted status', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateLocal(tomorrow);

      const bookings: Booking[] = [
        createBooking(1, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 150.00, 'accepted'),
        createBooking(2, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 200.00, 'pending'),
        createBooking(3, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 100.00, 'declined'),
      ];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      const todayProfit = result.profits.find(p => p.daysAgo === 0);
      if (todayProfit) {
        expect(todayProfit.amount).toBe(150.00); // Only includes accepted
        expect(todayProfit.bookingCount).toBe(1);
      }
    });

    it('should only include bookings for user\'s own listings', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateLocal(tomorrow);

      const bookings: Booking[] = [
        createBooking(1, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 150.00), // User's listing
        createBooking(2, 2, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 200.00), // Other user's listing
      ];
      const listings: OneListing[] = [createListing(1, 'test@example.com')]; // Only listing 1

      const result = calculateProfits(bookings, listings);

      const todayProfit = result.profits.find(p => p.daysAgo === 0);
      if (todayProfit) {
        expect(todayProfit.amount).toBe(150.00); // Only includes listing 1's bookings
        expect(todayProfit.bookingCount).toBe(1);
      }
    });
  });

  describe('Date Range', () => {
    it('should only include data from the past 30 days', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyOneDaysAgo = new Date(today);
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
      const thirtyOneDaysAgoStr = formatDateLocal(thirtyOneDaysAgo);
      const thirtyTwoDaysAgo = new Date(thirtyOneDaysAgo);
      thirtyTwoDaysAgo.setDate(thirtyTwoDaysAgo.getDate() + 1);
      const thirtyTwoDaysAgoStr = formatDateLocal(thirtyTwoDaysAgo);

      const bookings: Booking[] = [
        createBooking(1, 1, `${thirtyOneDaysAgoStr}T00:00:00Z`, `${thirtyTwoDaysAgoStr}T00:00:00Z`, 150.00),
      ];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      // Bookings from 31 days ago should not be included in results
      const hasOldBooking = result.profits.some(p => p.amount > 0 && p.daysAgo > 30);
      expect(hasOldBooking).toBe(false);
    });

    it('should include data from exactly 30 days ago', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const thirtyDaysAgoStr = formatDateLocal(thirtyDaysAgo);
      const nextDay = new Date(thirtyDaysAgo);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = formatDateLocal(nextDay);

      const bookings: Booking[] = [
        createBooking(1, 1, `${thirtyDaysAgoStr}T00:00:00.000Z`, `${nextDayStr}T00:00:00.000Z`, 150.00),
      ];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      const thirtyDaysAgoProfit = result.profits.find(p => p.daysAgo === 30);
      expect(thirtyDaysAgoProfit).toBeDefined();
      if (thirtyDaysAgoProfit) {
        expect(thirtyDaysAgoProfit.amount).toBe(150.00);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty bookings list', () => {
      const bookings: Booking[] = [];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      expect(result.profits.length).toBe(31); // 0-30 days, total 31 days
      expect(result.totalProfit).toBe(0);
      expect(result.totalBookings).toBe(0);
      // All days should have 0 amount
      expect(result.profits.every(p => p.amount === 0)).toBe(true);
    });

    it('should handle empty listings list', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateLocal(tomorrow);

      const bookings: Booking[] = [
        createBooking(1, 1, `${todayStr}T00:00:00Z`, `${tomorrowStr}T00:00:00Z`, 150.00),
      ];
      const listings: OneListing[] = [];

      const result = calculateProfits(bookings, listings);

      expect(result.totalProfit).toBe(0);
      expect(result.totalBookings).toBe(0);
    });

    it('should handle multiple listings', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateLocal(tomorrow);

      const bookings: Booking[] = [
        createBooking(1, 1, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 150.00),
        createBooking(2, 2, `${todayStr}T00:00:00.000Z`, `${tomorrowStr}T00:00:00.000Z`, 200.00),
      ];
      const listings: OneListing[] = [
        createListing(1, 'test@example.com'),
        createListing(2, 'test@example.com'),
      ];

      const result = calculateProfits(bookings, listings);

      const todayProfit = result.profits.find(p => p.daysAgo === 0);
      if (todayProfit) {
        expect(todayProfit.amount).toBe(350.00); // 150 + 200
        expect(todayProfit.bookingCount).toBe(2);
      }
      expect(result.totalProfit).toBe(350.00);
    });
  });

  describe('Data Format', () => {
    it('should return data in correct format', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateLocal(tomorrow);

      const bookings: Booking[] = [
        createBooking(1, 1, `${todayStr}T00:00:00Z`, `${tomorrowStr}T00:00:00Z`, 150.00),
      ];
      const listings: OneListing[] = [createListing(1)];

      const result = calculateProfits(bookings, listings);

      expect(result).toHaveProperty('profits');
      expect(result).toHaveProperty('totalProfit');
      expect(result).toHaveProperty('totalBookings');
      expect(Array.isArray(result.profits)).toBe(true);
      expect(result.profits.length).toBe(31); // 0-30 days

      // Check format of each profit item
      result.profits.forEach(profit => {
        expect(profit).toHaveProperty('date');
        expect(profit).toHaveProperty('daysAgo');
        expect(profit).toHaveProperty('amount');
        expect(profit).toHaveProperty('bookingCount');
        expect(typeof profit.daysAgo).toBe('number');
        expect(profit.daysAgo).toBeGreaterThanOrEqual(0);
        expect(profit.daysAgo).toBeLessThanOrEqual(30);
        expect(typeof profit.amount).toBe('number');
        expect(profit.amount).toBeGreaterThanOrEqual(0);
      });

      // Check sorting (daysAgo from 0 to 30)
      for (let i = 0; i < result.profits.length - 1; i++) {
        expect(result.profits[i].daysAgo).toBeLessThanOrEqual(result.profits[i + 1].daysAgo);
      }
    });
  });
});

