-- AirBrB Database Schema for PostgreSQL

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    session_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    owner VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    address JSONB NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    thumbnail TEXT,
    metadata JSONB,
    availability JSONB DEFAULT '[]'::jsonb,
    published BOOLEAN DEFAULT false,
    posted_on TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reviewer_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    booking_id INTEGER,
    review_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    date_range JSONB NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for reviews referencing bookings
ALTER TABLE reviews ADD CONSTRAINT fk_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_listings_owner ON listings(owner);
CREATE INDEX idx_listings_published ON listings(published);
CREATE INDEX idx_bookings_owner ON bookings(owner);
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);
