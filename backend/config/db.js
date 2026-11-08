const mongoose = require('mongoose');
const dns = require('node:dns');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const possibleMongodPaths = [
  'C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe',
  'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
  'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
  'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  'mongod'
];

const isLocalMongoUri = (uri) =>
  /^mongodb(?:\+srv)?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(uri);

function findMongodPath() {
  for (const p of possibleMongodPaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function startLocalMongo() {
  const mongodPath = findMongodPath();
  if (!mongodPath) return false;

  const dataDir = path.resolve(__dirname, '../data/db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`[MongoDB] Attempting to auto-start mongod from: ${mongodPath}`);
  console.log(`[MongoDB] Data path: ${dataDir}`);

  try {
    const proc = spawn(mongodPath, ['--dbpath', dataDir, '--port', '27017', '--quiet'], {
      detached: true,
      stdio: 'ignore'
    });
    proc.unref();
    return true;
  } catch (err) {
    console.warn(`[MongoDB] Could not spawn mongod: ${err.message}`);
    return false;
  }
}

async function autoSeedIfNeeded() {
  try {
    const Restaurant = require('../models/Restaurant');
    const count = await Restaurant.countDocuments();
    if (count === 0) {
      console.log('[Database] No restaurants found in DB. Auto-seeding initial data...');
      const seedData = require('../seed/seed');
      await seedData(false);
      console.log('[Database] Auto-seeding completed successfully!');
    }
  } catch (err) {
    console.warn('[Database] Auto-seed check skipped:', err.message);
  }
}

const connectDB = async () => {
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
    console.log(`[MongoDB] Using configured DNS servers: ${dnsServers.join(', ')}`);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_ordering_db';

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    await autoSeedIfNeeded();
    return conn;
  } catch (initialError) {
    console.log(`[MongoDB] Connection failed: ${initialError.message}`);
    if (!isLocalMongoUri(uri)) {
      throw initialError;
    }

    console.log('[MongoDB] Checking if local mongod can be launched...');

    const started = startLocalMongo();
    if (started) {
      // Wait for mongod to initialize
      await new Promise((res) => setTimeout(res, 2500));
      try {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
        console.log(`[MongoDB Connected]: ${conn.connection.host}`);
        await autoSeedIfNeeded();
        return conn;
      } catch (retryError) {
        console.warn(`[MongoDB Auto-Launch Warning]: ${retryError.message}`);
        throw retryError;
      }
    }

    console.warn('\n======================================================');
    console.warn('⚠️  MONGODB IS NOT RUNNING ON PORT 27017');
    console.warn('To start MongoDB on Windows:');
    console.warn('  1. Open PowerShell as Administrator and run:');
    console.warn('     net start MongoDB');
    console.warn('  2. Or run: npm run mongo');
    console.warn('======================================================\n');
    throw initialError;
  }
};

module.exports = connectDB;
