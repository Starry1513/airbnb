import { Pool, PoolClient } from 'pg';

// Disable TLS certificate validation for Supabase
if ((process.env.DATABASE_URL || process.env.POSTGRES_URL || '').includes('supabase')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Get connection string - support both standard and prefixed (starry_) variable names
const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env['starry_POSTGRES_URL'] || 
  process.env['starry_DATABASE_URL'];

if (!connectionString) {
  const errorMsg = 'Database connection string not configured. Please set DATABASE_URL or POSTGRES_URL environment variable.';
  console.error('❌ Database connection error:', errorMsg);
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATABASE')));
  // Don't throw here - let it fail on first query so we can see the error in logs
  // This allows the function to start and we can handle the error on first query
}

// Create connection pool only if connection string exists
let pool: Pool | null = null;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('supabase') ? {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    console.log('✅ Database connection pool created');
  } catch (error) {
    console.error('❌ Failed to create database pool:', error);
    pool = null;
  }
} else {
  console.warn('⚠️ No database connection string, pool not created');
}

// Handle pool errors
if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
}

/**
 * Execute a query with the pool
 */
export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    const error = new Error('Database connection not configured. Please set DATABASE_URL or POSTGRES_URL environment variable.');
    console.error('❌ Query failed - no database pool:', error.message);
    throw error;
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.error('❌ Query error', { 
      text: text.substring(0, 100), 
      error: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async (): Promise<PoolClient> => {
  if (!pool) {
    throw new Error('Database connection not configured. Please set DATABASE_URL or POSTGRES_URL environment variable.');
  }
  const client = await pool.connect();
  return client;
};

/**
 * Close the pool (for graceful shutdown)
 */
export const end = async () => {
  if (pool) {
    await pool.end();
  }
};

export default {
  query,
  getClient,
  end,
};
