# AirBrB Backend API

A serverless TypeScript backend API for the AirBrB (Airbnb clone) application, designed for deployment on Vercel.

## Features

- **Serverless Architecture**: Individual API endpoints as serverless functions
- **TypeScript**: Full type safety and modern JavaScript features
- **Swagger Documentation**: Interactive API documentation at `/api/docs`
- **JWT Authentication**: Secure token-based authentication
- **CORS Enabled**: Cross-origin resource sharing for frontend integration
- **RESTful API**: Following REST principles and best practices

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit API documentation
open http://localhost:3000/api/docs
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## API Overview

### User Authentication
- Register, login, and logout functionality
- JWT token-based authentication

### Listing Management
- Create, read, update, and delete property listings
- Publish/unpublish listings
- Add reviews to listings

### Booking Management
- Create and manage bookings
- Accept/decline booking requests
- View all bookings

## Documentation

- **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Documentation**: Available at `/api/docs` when running
- **API Specification**: See [swagger.json](./swagger.json)

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Platform**: Vercel Serverless Functions
- **Authentication**: JWT (jsonwebtoken)
- **Documentation**: Swagger UI

## Project Structure

```
backend/
├── api/              # Serverless function endpoints
├── swagger.json      # OpenAPI specification
├── vercel.json       # Vercel configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Dependencies
```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT signing

## License

ISC
