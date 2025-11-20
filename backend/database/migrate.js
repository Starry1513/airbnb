#!/usr/bin/env node

/**
 * Database Migration Script
 * Run this to initialize the PostgreSQL database schema
 */

// Disable TLS certificate validation for Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { Pool } = require('pg');
const fs = require('fs');

// Read database URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL or POSTGRES_URL environment variable not set');
  console.error('Please set one of these variables with your PostgreSQL connection string');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('supabase') ? {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  } : false
});

async function migrate() {
  console.log('Starting database migration...');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database schema created successfully!');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - listings');
    console.log('  - reviews');
    console.log('  - bookings');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
