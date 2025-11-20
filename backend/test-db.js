#!/usr/bin/env node

/**
 * Quick database connection test
 */

// Disable TLS certificate validation for Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  }
});

async function testConnection() {
  console.log('Testing database connection...');

  try {
    // Test query
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Server time:', result.rows[0].now);

    // Check tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 Available tables:');
    tables.rows.forEach(row => {
      console.log('  -', row.table_name);
    });

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
