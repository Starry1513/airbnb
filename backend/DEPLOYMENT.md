# AirBrB Backend - Vercel Deployment Guide

This backend has been refactored to support deployment on Vercel as serverless functions using TypeScript.

## Architecture

The backend has been migrated from a monolithic Express.js application to a serverless architecture:

- **Framework**: Vercel Serverless Functions
- **Language**: TypeScript
- **API Structure**: `/api` directory with individual serverless functions
- **Documentation**: Swagger UI available at `/api/docs`

## Directory Structure

```
backend/
├── api/                          # Serverless functions
│   ├── _lib/                     # Shared utilities
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── error.ts             # Custom error classes
│   │   ├── datastore.ts         # Data persistence layer
│   │   ├── service.ts           # Business logic
│   │   └── handler.ts           # Request/response handlers
│   ├── user/auth/               # Authentication endpoints
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── logout.ts
│   ├── listings/                # Listing management endpoints
│   │   ├── index.ts             # GET /listings
│   │   ├── new.ts               # POST /listings/new
│   │   ├── [listingid].ts       # GET/PUT/DELETE /listings/:id
│   │   ├── publish/
│   │   │   └── [listingid].ts   # PUT /listings/publish/:id
│   │   ├── unpublish/
│   │   │   └── [listingid].ts   # PUT /listings/unpublish/:id
│   │   └── [listingid]/review/
│   │       └── [bookingid].ts   # PUT /listings/:id/review/:bookingid
│   ├── bookings/                # Booking management endpoints
│   │   ├── index.ts             # GET /bookings
│   │   ├── [bookingid].ts       # DELETE /bookings/:id
│   │   ├── new/
│   │   │   └── [listingid].ts   # POST /bookings/new/:listingid
│   │   ├── accept/
│   │   │   └── [bookingid].ts   # PUT /bookings/accept/:id
│   │   └── decline/
│   │       └── [bookingid].ts   # PUT /bookings/decline/:id
│   ├── docs.ts                  # Swagger documentation UI
│   └── index.ts                 # Root endpoint (redirects to docs)
├── src/                         # Legacy Express code (kept for reference)
├── swagger.json                 # OpenAPI/Swagger specification
├── vercel.json                  # Vercel deployment configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## API Endpoints

All endpoints follow the original API specification defined in `swagger.json`:

### User Authentication
- `POST /api/user/auth/register` - Register new user
- `POST /api/user/auth/login` - Login user
- `POST /api/user/auth/logout` - Logout user (authenticated)

### Listing Management
- `GET /api/listings` - Get all listings
- `GET /api/listings/:listingid` - Get listing details
- `POST /api/listings/new` - Create new listing (authenticated)
- `PUT /api/listings/:listingid` - Update listing (authenticated, owner only)
- `DELETE /api/listings/:listingid` - Delete listing (authenticated, owner only)
- `PUT /api/listings/publish/:listingid` - Publish listing (authenticated, owner only)
- `PUT /api/listings/unpublish/:listingid` - Unpublish listing (authenticated, owner only)
- `PUT /api/listings/:listingid/review/:bookingid` - Leave review (authenticated)

### Booking Management
- `GET /api/bookings` - Get all bookings (authenticated)
- `POST /api/bookings/new/:listingid` - Create booking (authenticated)
- `DELETE /api/bookings/:bookingid` - Delete booking (authenticated, owner only)
- `PUT /api/bookings/accept/:bookingid` - Accept booking (authenticated, listing owner only)
- `PUT /api/bookings/decline/:bookingid` - Decline booking (authenticated, listing owner only)

### Documentation
- `GET /` or `GET /api/docs` - Swagger API documentation

## Local Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Run in development mode with Vercel CLI:
```bash
npm run dev
```

This will start the Vercel development server at `http://localhost:3000`.

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Push your code to a GitHub repository
2. Import the repository in the Vercel dashboard
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty or use `npm run vercel-build`)
   - **Output Directory**: (leave empty)
4. Add environment variables (see below)
5. Deploy

### Environment Variables

Set these environment variables in your Vercel project settings:

- `JWT_SECRET` - Secret key for JWT token signing (default: 'giraffegiraffebeetroot')
- `VERCEL` - Automatically set by Vercel (value: '1')

## Data Persistence

### Current Implementation

The current implementation uses an in-memory data store with optional file persistence:

- **Local Development**: Data is saved to `database.json` file
- **Vercel (Serverless)**: Data is stored in memory (ephemeral - resets on cold starts)

### Production Recommendations

For production deployment on Vercel, you should migrate to a persistent data store:

#### Option 1: Vercel KV (Redis)

Vercel KV provides a serverless Redis database:

1. Install Vercel KV:
```bash
npm install @vercel/kv
```

2. Enable Vercel KV in your project dashboard
3. Update `api/_lib/datastore.ts` to use Vercel KV

#### Option 2: Vercel Postgres

For a SQL database:

1. Install Vercel Postgres:
```bash
npm install @vercel/postgres
```

2. Enable Vercel Postgres in your project dashboard
3. Create tables and migrate data
4. Update `api/_lib/datastore.ts` and `api/_lib/service.ts`

#### Option 3: External Database

Use any external database service (MongoDB, PostgreSQL, MySQL, etc.):

1. Set up database on your preferred provider
2. Add connection string as environment variable
3. Update data access layer in `api/_lib/`

## Swagger Documentation

The API documentation is available at:
- Local: `http://localhost:3000/api/docs`
- Production: `https://your-deployment.vercel.app/api/docs`

The documentation is auto-generated from `swagger.json` and matches the original API specification.

## Migration from Legacy Express Server

The legacy Express server code is preserved in the `src/` directory. To run it:

```bash
npm run start:legacy
```

Key differences:
- Legacy: Monolithic Express app on single port
- New: Individual serverless functions with automatic scaling
- Legacy: File-based persistence always works
- New: Requires external database for production

## CORS Configuration

CORS is enabled for all origins in the serverless functions. To restrict origins, modify the `enableCors()` function in `api/_lib/handler.ts`.

## Troubleshooting

### Cold Starts

Serverless functions may experience cold starts (1-3 second delay) when inactive. This is normal behavior.

### Data Not Persisting

In Vercel serverless environment, in-memory data resets on cold starts. Migrate to a persistent data store for production.

### TypeScript Errors

Run type checking to identify issues:
```bash
npm run type-check
```

### Import Errors

Ensure all imports use `.js` extensions or configure path aliases in `tsconfig.json`.

## Testing

Run tests (using legacy test suite):
```bash
npm test
```

Note: Tests may need to be updated to work with the serverless architecture.

## Support

For issues or questions:
1. Check the Vercel documentation: https://vercel.com/docs
2. Review the original `swagger.json` for API specifications
3. Check serverless function logs in Vercel dashboard
