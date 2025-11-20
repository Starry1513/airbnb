import fs from 'fs';
import path from 'path';
import { DataStore } from './types';

// In-memory store for Vercel serverless environment
// NOTE: This is ephemeral and will reset between deployments and cold starts
// For production, use Vercel KV, Postgres, or another persistent storage
let memoryStore: DataStore = {
  users: {},
  listings: {},
  bookings: {},
};

const isVercel = process.env.VERCEL === '1';
const DATABASE_FILE = path.join(process.cwd(), 'database.json');

// Initialize data from file if in local development
if (!isVercel) {
  try {
    const data = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8')) as DataStore;
    memoryStore = data;
  } catch {
    console.log('WARNING: No database found, creating a new one');
    if (!isVercel) {
      fs.writeFileSync(DATABASE_FILE, JSON.stringify(memoryStore, null, 2));
    }
  }
}

export const getDataStore = (): DataStore => {
  return memoryStore;
};

export const saveDataStore = (updates: Partial<DataStore>): void => {
  // Merge updates into memory store
  Object.assign(memoryStore, updates);

  // Only save to file in local development
  if (!isVercel) {
    try {
      fs.writeFileSync(DATABASE_FILE, JSON.stringify(memoryStore, null, 2));
    } catch (error) {
      console.error('Failed to save data to file:', error);
    }
  }
};

export const resetDataStore = (): void => {
  memoryStore = {
    users: {},
    listings: {},
    bookings: {},
  };
  saveDataStore(memoryStore);
};
