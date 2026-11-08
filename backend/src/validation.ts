import { z } from 'zod';
import { isValidDate, normalizeRange, toDay } from './lib/dates';

const dateString = z.string().refine(isValidDate, 'must be a valid date');

/** A date range sent as {start,end} or the legacy {from,to}; normalized to {start,end}. */
const dateRange = z
  .record(z.string(), z.unknown())
  .transform((value, ctx) => {
    const range = normalizeRange(value);
    if (!range || !isValidDate(range.start) || !isValidDate(range.end)) {
      ctx.addIssue({ code: 'custom', message: 'must have valid start and end dates' });
      return z.NEVER;
    }
    if (toDay(range.end) < toDay(range.start)) {
      ctx.addIssue({ code: 'custom', message: 'end date must not be before start date' });
      return z.NEVER;
    }
    return range;
  });

export const registerBody = z.object({
  email: z.email().max(255),
  password: z.string().min(6, 'password must be at least 6 characters').max(128),
  name: z.string().trim().min(1).max(255),
});

export const loginBody = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const price = z.coerce.number().positive().max(99_999_999);

export const newListingBody = z.object({
  title: z.string().trim().min(1).max(255),
  address: z.record(z.string(), z.unknown()),
  price,
  thumbnail: z.string(),
  metadata: z.record(z.string(), z.unknown()),
});

export const updateListingBody = newListingBody.partial();

export const publishBody = z.object({
  availability: z.array(dateRange).min(1, 'must provide at least one availability range'),
});

export const newBookingBody = z.object({
  dateRange,
  // Ignored: the server computes the price. Still accepted so old clients work.
  totalPrice: z.unknown().optional(),
});

export const reviewBody = z.object({
  review: z.looseObject({
    rating: z.coerce.number().min(0).max(5),
    text: z.string().max(5000).default(''),
  }),
});

const optionalNumber = z.coerce.number().nonnegative().optional();

export const listingQuery = z.object({
  q: z.string().trim().max(255).optional(),
  minBedrooms: optionalNumber,
  maxBedrooms: optionalNumber,
  minBathrooms: optionalNumber,
  maxBathrooms: optionalNumber,
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  from: dateString.optional(),
  to: dateString.optional(),
  published: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  sort: z
    .enum(['newest', 'title_asc', 'title_desc', 'price_asc', 'price_desc', 'rating_desc'])
    .default('newest'),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListingQuery = z.infer<typeof listingQuery>;
