# PostgreSQL Setup Guide for AirBrB Backend

This guide will help you set up and deploy the AirBrB backend with PostgreSQL (Supabase) on Vercel.

## Prerequisites

- Vercel account
- Supabase Postgres database (already created)
- Node.js >= 18.0.0

## Step 1: Set Up Local Environment

### 1.1 Create `.env.local` file

Create a `.env.local` file in the `backend` directory:

```bash
cd backend
cp .env.example .env.local
```

### 1.2 Add your database credentials

Edit `.env.local` with your Supabase credentials:

```env
JWT_SECRET=your-strong-secret-key-here
DATABASE_URL=postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL=postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

**Important**: Use one of these URL formats:
- `POSTGRES_URL` - For connection pooling (recommended for serverless)
- `POSTGRES_URL_NON_POOLING` - For direct connections
- `POSTGRES_PRISMA_URL` - If using Prisma

## Step 2: Initialize Database Schema

Run the migration script to create tables:

```bash
npm run db:migrate
```

This will create:
- `users` table
- `listings` table
- `bookings` table
- `reviews` table

You should see output like:
```
Starting database migration...
✅ Database schema created successfully!
Tables created:
  - users
  - listings
  - reviews
  - bookings
```

## Step 3: Test Locally

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000/api/docs` to see the Swagger documentation.

### Test the API:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Get all listings
curl http://localhost:3000/api/listings
```

## Step 4: Deploy to Vercel

### 4.1 Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 4.2 Configure Environment Variables on Vercel

After deployment, add environment variables in the Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `JWT_SECRET` | Your strong secret key | Production, Preview, Development |
| `DATABASE_URL` | Your Postgres connection URL | Production, Preview, Development |
| `POSTGRES_URL` | Your Postgres connection URL | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

**Using your Supabase credentials:**

```
DATABASE_URL=postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x

POSTGRES_URL=postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x

JWT_SECRET=your-strong-random-secret
```

### 4.3 Set Environment Variables via CLI

Alternatively, use the CLI:

```bash
vercel env add DATABASE_URL
# Paste your database URL when prompted

vercel env add JWT_SECRET
# Enter your JWT secret when prompted
```

### 4.4 Run Migration on Production Database

**Option 1: From your local machine**

Set the production DATABASE_URL temporarily:

```bash
DATABASE_URL="your-production-postgres-url" npm run db:migrate
```

**Option 2: Using Supabase SQL Editor**

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `backend/database/schema.sql`
3. Paste and execute

### 4.5 Deploy to Production

```bash
vercel --prod
```

## Step 5: Verify Deployment

After deployment, test your API:

```bash
# Replace with your Vercel URL
VERCEL_URL="https://your-app.vercel.app"

# Test registration
curl -X POST $VERCEL_URL/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Test listings
curl $VERCEL_URL/api/listings
```

View API documentation at: `https://your-app.vercel.app/api/docs`

## Database Schema

The application uses the following tables:

### Users
- `email` (PRIMARY KEY)
- `name`
- `password`
- `session_active`
- `created_at`

### Listings
- `id` (SERIAL PRIMARY KEY)
- `title` (UNIQUE)
- `owner` (FOREIGN KEY → users.email)
- `address` (JSONB)
- `price`
- `thumbnail`
- `metadata` (JSONB)
- `availability` (JSONB)
- `published`
- `posted_on`
- `created_at`

### Bookings
- `id` (SERIAL PRIMARY KEY)
- `owner` (FOREIGN KEY → users.email)
- `listing_id` (FOREIGN KEY → listings.id)
- `date_range` (JSONB)
- `total_price`
- `status` (pending/accepted/declined)
- `created_at`

### Reviews
- `id` (SERIAL PRIMARY KEY)
- `listing_id` (FOREIGN KEY → listings.id)
- `reviewer_email` (FOREIGN KEY → users.email)
- `booking_id` (FOREIGN KEY → bookings.id)
- `review_data` (JSONB)
- `created_at`

## Troubleshooting

### Connection Issues

**Error**: `connection refused` or `timeout`

**Solution**: Check that:
1. Your Supabase database is running
2. Connection pooling is enabled (use `POSTGRES_URL` not `POSTGRES_URL_NON_POOLING`)
3. SSL mode is required: `?sslmode=require`

### Migration Errors

**Error**: `relation already exists`

**Solution**: Tables already exist. To reset:

```bash
# Connect to your database via psql or Supabase SQL Editor
# Run: DROP SCHEMA public CASCADE; CREATE SCHEMA public;
# Then run migration again
npm run db:migrate
```

### JWT Secret Issues

**Error**: `Invalid Token`

**Solution**: Ensure `JWT_SECRET` is set in Vercel environment variables and matches between deployments.

### CORS Errors

**Error**: `CORS policy blocked`

**Solution**: Update `api/_lib/handler.ts` to allow your frontend domain:

```typescript
export const enableCors = (res: VercelResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend.vercel.app');
  // ... rest of CORS headers
};
```

## Monitoring

### View Database in Supabase

1. Go to Supabase Dashboard
2. Navigate to "Table Editor"
3. View your tables: users, listings, bookings, reviews

### View Logs in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Click "Logs" to see function execution logs

## Performance Tips

1. **Use Connection Pooling**: Always use `POSTGRES_URL` (pooled connection) for serverless functions
2. **Add Indexes**: Already included in schema for common queries
3. **Limit Query Results**: Use pagination for large datasets
4. **Monitor Connection Usage**: Check Supabase Dashboard → Database → Connection pooling

## Security Checklist

- [ ] Change default JWT_SECRET to a strong random string
- [ ] Use environment variables for all sensitive data
- [ ] Never commit `.env` or `.env.local` to git
- [ ] Enable SSL for database connections
- [ ] Set appropriate CORS origins for production
- [ ] Use prepared statements (already handled by `pg` library)
- [ ] Regularly update dependencies

## Next Steps

1. **Add Authentication Improvements**:
   - Implement password hashing (bcrypt)
   - Add email verification
   - Implement refresh tokens

2. **Add Data Validation**:
   - Use Zod or Joi for request validation
   - Add input sanitization

3. **Implement Caching**:
   - Use Vercel KV for session storage
   - Cache frequently accessed listings

4. **Add Monitoring**:
   - Set up Vercel Analytics
   - Add error tracking (Sentry)

## Support

For issues:
- Check logs in Vercel Dashboard
- View database tables in Supabase Dashboard
- Review API documentation at `/api/docs`

---

**Your Database Credentials** (for reference):

- **Host**: `db.lglthuuxojxyejqlnwmp.supabase.co`
- **Database**: `postgres`
- **User**: `postgres`
- **Connection URL**: `postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x`

Keep these credentials secure!
