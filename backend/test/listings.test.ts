import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers';

let t: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => { t = await setupTestApp(); });
beforeEach(async () => { await t.reset(); });

describe('listings CRUD', () => {
  it('creates, reads, updates and deletes a listing', async () => {
    const token = await t.registerUser('host@a.com');
    const created = await t.request('POST', '/listings/new', { token, body: t.listingBody() });
    expect(created.status).toBe(200);
    const id = created.body.listingId;

    const detail = await t.request('GET', `/listings/${id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.listing).toMatchObject({
      title: 'Harbour View',
      owner: 'host@a.com',
      price: 100,
      published: false,
      reviews: [],
      availability: [],
    });
    expect(detail.body.listing.metadata.bedrooms).toHaveLength(1);

    const upd = await t.request('PUT', `/listings/${id}`, { token, body: { price: 0.5, title: 'Renamed' } });
    expect(upd.status).toBe(200);
    expect((await t.request('GET', `/listings/${id}`)).body.listing).toMatchObject({ price: 0.5, title: 'Renamed' });

    expect((await t.request('DELETE', `/listings/${id}`, { token })).status).toBe(200);
    expect((await t.request('GET', `/listings/${id}`)).status).toBe(404);
  });

  it('returns metadata, availability and published in the list', async () => {
    const token = await t.registerUser('host@a.com');
    await t.publishedListing(token);
    const { body } = await t.request('GET', '/listings');
    expect(body.total).toBe(1);
    expect(body.listings[0]).toMatchObject({
      published: true,
      availability: [{ from: '2030-01-01', to: '2030-12-31' }],
      metadata: { propertyType: 'Apartment' },
    });
  });

  it('only lets the owner modify a listing', async () => {
    const host = await t.registerUser('host@a.com');
    const other = await t.registerUser('other@a.com');
    const id = (await t.request('POST', '/listings/new', { token: host, body: t.listingBody() })).body.listingId;
    expect((await t.request('PUT', `/listings/${id}`, { token: other, body: { price: 1 } })).status).toBe(403);
    expect((await t.request('DELETE', `/listings/${id}`, { token: other })).status).toBe(403);
    expect((await t.request('POST', '/listings/new', { body: t.listingBody() })).status).toBe(403);
  });

  it('rejects duplicate titles and invalid bodies with 400', async () => {
    const token = await t.registerUser('host@a.com');
    await t.request('POST', '/listings/new', { token, body: t.listingBody() });
    const dup = await t.request('POST', '/listings/new', { token, body: t.listingBody() });
    expect(dup.status).toBe(400);
    expect(dup.body.error).toMatch(/already exists/);

    const bad = await t.request('POST', '/listings/new', { token, body: t.listingBody({ price: -5 }) });
    expect(bad.status).toBe(400);
    expect(bad.body.error).toMatch(/^price:/);
  });

  it('publishes and unpublishes', async () => {
    const token = await t.registerUser('host@a.com');
    const id = await t.publishedListing(token);
    const again = await t.request('PUT', `/listings/publish/${id}`, {
      token,
      body: { availability: [{ from: '2030-01-01', to: '2030-01-02' }] },
    });
    expect(again.status).toBe(400);
    expect((await t.request('PUT', `/listings/unpublish/${id}`, { token })).status).toBe(200);
    expect((await t.request('GET', `/listings/${id}`)).body.listing.published).toBe(false);
  });
});

describe('listing search', () => {
  beforeEach(async () => {
    const token = await t.registerUser('host@a.com');
    await t.publishedListing(token, {
      title: 'Bondi Beach House',
      price: 300,
      address: { city: 'Sydney' },
      metadata: { bathrooms: 2, bedrooms: [{ type: 'King' }, { type: 'Queen' }, { type: 'Single' }] },
    });
    await t.publishedListing(token, {
      title: 'city studio',
      price: 80,
      address: { city: 'Melbourne' },
      metadata: { bathrooms: 1, bedrooms: [{ type: 'Double' }] },
    });
    // Unpublished, legacy numeric bedrooms.
    await t.request('POST', '/listings/new', {
      token,
      body: t.listingBody({ title: 'Alpine Lodge', price: 150, address: { city: 'Thredbo' }, metadata: { bathrooms: '3', bedrooms: 4 } }),
    });
  });

  const titles = async (query: string) =>
    (await t.request('GET', `/listings?${query}`)).body.listings.map((l: { title: string }) => l.title);

  it('filters by text in title or city', async () => {
    expect(await titles('q=sydney')).toEqual(['Bondi Beach House']);
    expect(await titles('q=STUDIO')).toEqual(['city studio']);
  });

  it('filters by price, bedrooms and bathrooms', async () => {
    expect(await titles('minPrice=100&maxPrice=200')).toEqual(['Alpine Lodge']);
    expect(await titles('minBedrooms=3&sort=title_asc')).toEqual(['Alpine Lodge', 'Bondi Beach House']);
    expect(await titles('maxBathrooms=1')).toEqual(['city studio']);
    expect(await titles('minBathrooms=3')).toEqual(['Alpine Lodge']);
  });

  it('filters by published and availability window', async () => {
    expect(await titles('published=false')).toEqual(['Alpine Lodge']);
    expect((await titles('from=2030-03-01&to=2030-03-05')).sort()).toEqual(['Bondi Beach House', 'city studio']);
    expect(await titles('from=2031-01-01&to=2031-01-05')).toEqual([]);
    expect((await t.request('GET', '/listings?from=2030-01-01')).status).toBe(400);
  });

  it('sorts and paginates', async () => {
    expect(await titles('sort=title_asc')).toEqual(['Alpine Lodge', 'Bondi Beach House', 'city studio']);
    expect(await titles('sort=price_desc')).toEqual(['Bondi Beach House', 'Alpine Lodge', 'city studio']);
    const page = await t.request('GET', '/listings?sort=title_asc&page=2&pageSize=2');
    expect(page.body).toMatchObject({ total: 3, page: 2, pageSize: 2 });
    expect(page.body.listings.map((l: { title: string }) => l.title)).toEqual(['city studio']);
  });

  it('treats LIKE wildcards in the query literally', async () => {
    expect(await titles('q=%25')).toEqual([]);
  });
});
