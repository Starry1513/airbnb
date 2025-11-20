# Quick Start Guide

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Development

### Run locally with Vercel Dev

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

### View API Documentation

Open your browser and navigate to:
```
http://localhost:3000/api/docs
```

## Testing the API

### Register a new user

```bash
curl -X POST http://localhost:3000/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned token for authenticated requests.

### Create a listing (authenticated)

```bash
curl -X POST http://localhost:3000/api/listings/new \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Beautiful Beach House",
    "address": {"street": "123 Ocean Ave", "city": "Sydney"},
    "price": 200,
    "thumbnail": "data:image/png;base64,iVBORw0KGgo...",
    "metadata": {"bedrooms": 3, "bathrooms": 2}
  }'
```

### Get all listings

```bash
curl http://localhost:3000/api/listings
```

## Deploy to Vercel

### One-command deployment

```bash
npm install -g vercel
vercel --prod
```

Follow the prompts to complete deployment.

### Set environment variables (optional)

```bash
vercel env add JWT_SECRET
```

Then enter your secret key.

## Verify Deployment

After deployment, Vercel will provide a URL like:
```
https://your-project.vercel.app
```

Test it:
```bash
curl https://your-project.vercel.app/api/listings
```

View documentation:
```
https://your-project.vercel.app/api/docs
```

## Troubleshooting

### Port already in use
If port 3000 is busy, Vercel Dev will use the next available port.

### TypeScript errors
Run type checking:
```bash
npm run type-check
```

### Module not found
Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Configure persistent database (see DEPLOYMENT.md)
2. Update JWT_SECRET environment variable
3. Set up CORS restrictions for production
4. Configure domain name in Vercel dashboard
5. Enable Vercel Analytics (optional)

## Support

- Documentation: See DEPLOYMENT.md
- API Spec: See swagger.json
- Vercel Docs: https://vercel.com/docs
