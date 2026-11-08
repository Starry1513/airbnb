import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers';

let t: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => { t = await setupTestApp(); });

let host: string;
let guest: string;
let stranger: string;
let listingId: number;

beforeEach(async () => {
  await t.reset();
  host = await t.registerUser('host@a.com');
  guest = await t.registerUser('guest@a.com');
  stranger = await t.registerUser('stranger@a.com');
  listingId = await t.publishedListing(host);
});

const book = (token: string, dateRange: Record<string, string>, totalPrice?: number) =>
  t.request('POST', `/bookings/new/${listingId}`, { token, body: { dateRange, totalPrice } });

describe('bookings', () => {
  it('computes the price on the server and normalizes dates to {start,end}', async () => {
    // Legacy {from,to} input and a bogus client price.
    const res = await book(guest, { from: '2030-02-01', to: '2030-02-04' }, 1);
    expect(res.status).toBe(200);

    const { body } = await t.request('GET', '/bookings', { token: guest });
    expect(body.bookings).toHaveLength(1);
    expect(body.bookings[0]).toMatchObject({
      owner: 'guest@a.com',
      listingId,
      totalPrice: 300, // 3 nights × $100
      status: 'pending',
      dateRange: { start: '2030-02-01', end: '2030-02-04' },
    });
  });

  it('only shows a user their own bookings and bookings on their listings', async () => {
    await book(guest, { start: '2030-02-01', end: '2030-02-03' });
    expect((await t.request('GET', '/bookings', { token: guest })).body.bookings).toHaveLength(1);
    expect((await t.request('GET', '/bookings', { token: host })).body.bookings).toHaveLength(1);
    expect((await t.request('GET', '/bookings', { token: stranger })).body.bookings).toHaveLength(0);
  });

  it('rejects bookings outside availability, on own or unpublished listings, or with bad dates', async () => {
    expect((await book(guest, { start: '2031-01-01', end: '2031-01-03' })).status).toBe(400);
    expect((await book(host, { start: '2030-02-01', end: '2030-02-03' })).status).toBe(400);
    expect((await book(guest, { start: '2030-02-05', end: '2030-02-01' })).status).toBe(400);
    expect((await book(guest, { start: 'soon', end: 'later' })).status).toBe(400);

    await t.request('PUT', `/listings/unpublish/${listingId}`, { token: host });
    expect((await book(guest, { start: '2030-02-01', end: '2030-02-03' })).status).toBe(400);
  });

  it('lets only the host accept/decline, once', async () => {
    const id = (await book(guest, { start: '2030-02-01', end: '2030-02-03' })).body.bookingId;
    expect((await t.request('PUT', `/bookings/accept/${id}`, { token: guest })).status).toBe(403);
    expect((await t.request('PUT', `/bookings/accept/${id}`, { token: host })).status).toBe(200);
    expect((await t.request('PUT', `/bookings/accept/${id}`, { token: host })).status).toBe(400);
    expect((await t.request('PUT', `/bookings/decline/${id}`, { token: host })).status).toBe(400);
  });

  it('prevents double-booking accepted dates', async () => {
    const a = (await book(guest, { start: '2030-02-01', end: '2030-02-05' })).body.bookingId;
    const b = (await book(stranger, { start: '2030-02-03', end: '2030-02-07' })).body.bookingId;
    expect((await t.request('PUT', `/bookings/accept/${a}`, { token: host })).status).toBe(200);

    // Accepting an overlapping pending booking fails…
    expect((await t.request('PUT', `/bookings/accept/${b}`, { token: host })).status).toBe(409);
    // …and new requests for taken dates are refused up front.
    expect((await book(stranger, { start: '2030-02-04', end: '2030-02-06' })).status).toBe(409);
    // Check-out day of one stay can be check-in of the next.
    expect((await book(stranger, { start: '2030-02-05', end: '2030-02-06' })).status).toBe(200);
  });

  it('lets only the guest delete their booking', async () => {
    const id = (await book(guest, { start: '2030-02-01', end: '2030-02-03' })).body.bookingId;
    expect((await t.request('DELETE', `/bookings/${id}`, { token: host })).status).toBe(403);
    expect((await t.request('DELETE', `/bookings/${id}`, { token: guest })).status).toBe(200);
    expect((await t.request('DELETE', `/bookings/${id}`, { token: guest })).status).toBe(404);
  });
});

describe('reviews', () => {
  const review = { review: { rating: 4, text: 'Lovely' } };

  it('requires an accepted booking and allows one review per booking', async () => {
    const id = (await book(guest, { start: '2030-02-01', end: '2030-02-03' })).body.bookingId;
    const path = `/listings/${listingId}/review/${id}`;

    expect((await t.request('PUT', path, { token: guest, body: review })).status).toBe(400);
    await t.request('PUT', `/bookings/accept/${id}`, { token: host });

    expect((await t.request('PUT', path, { token: stranger, body: review })).status).toBe(403);
    expect((await t.request('PUT', path, { token: guest, body: review })).status).toBe(200);
    expect((await t.request('PUT', path, { token: guest, body: review })).status).toBe(400);

    const { listing } = (await t.request('GET', `/listings/${listingId}`)).body;
    expect(listing.reviews).toEqual([{ rating: 4, text: 'Lovely', userEmail: 'guest@a.com' }]);
  });

  it('validates the rating', async () => {
    const id = (await book(guest, { start: '2030-02-01', end: '2030-02-03' })).body.bookingId;
    await t.request('PUT', `/bookings/accept/${id}`, { token: host });
    const res = await t.request('PUT', `/listings/${listingId}/review/${id}`, {
      token: guest,
      body: { review: { rating: 9, text: '' } },
    });
    expect(res.status).toBe(400);
  });
});
