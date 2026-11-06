const { MongoClient } = require('../backend/node_modules/mongodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('../backend/node_modules/dotenv');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_ordering_db';
const storeFile = path.resolve(__dirname, '../backend/data/db_store.json');

async function syncToMongo() {
  console.log('====================================================');
  console.log('🔄 MongoDB Data Synchronizer');
  console.log(`Connecting to: ${uri}`);
  console.log('====================================================');

  if (!fs.existsSync(storeFile)) {
    console.error(`Store file not found at: ${storeFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(storeFile, 'utf-8');
  const store = JSON.parse(raw);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB server!');

    const db = client.db();

    // 1. Sync Users
    if (store.users && store.users.length > 0) {
      const usersCol = db.collection('users');
      let usersSynced = 0;
      for (const u of store.users) {
        const { _id, createdAt, ...userData } = u;
        await usersCol.updateOne(
          { email: u.email.toLowerCase() },
          { 
            $set: {
              ...userData,
              email: u.email.toLowerCase(),
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: createdAt ? new Date(createdAt) : new Date()
            }
          },
          { upsert: true }
        );
        usersSynced++;
        console.log(`  👤 Synced User: ${u.name} (${u.email}) [Role: ${u.role}]`);
      }
      console.log(`✨ Total Users Synced to MongoDB: ${usersSynced}`);
    }

    // 2. Sync Restaurants
    if (store.restaurants && store.restaurants.length > 0) {
      const restCol = db.collection('restaurants');
      for (const r of store.restaurants) {
        const { _id, ...restData } = r;
        await restCol.updateOne(
          { name: r.name },
          { $set: { ...restData, updatedAt: new Date() } },
          { upsert: true }
        );
      }
      console.log(`🍽️  Synced ${store.restaurants.length} Restaurants to MongoDB`);
    }

    // 3. Sync Foods
    if (store.foods && store.foods.length > 0) {
      const foodCol = db.collection('foods');
      for (const f of store.foods) {
        const { _id, ...foodData } = f;
        await foodCol.updateOne(
          { name: f.name },
          { $set: { ...foodData, updatedAt: new Date() } },
          { upsert: true }
        );
      }
      console.log(`🍕 Synced ${store.foods.length} Food Items to MongoDB`);
    }

    // 4. Sync Orders
    if (store.orders && store.orders.length > 0) {
      const orderCol = db.collection('orders');
      for (const o of store.orders) {
        const { _id, ...orderData } = o;
        await orderCol.updateOne(
          { _id: o._id },
          { $set: { ...orderData, updatedAt: new Date() } },
          { upsert: true }
        );
      }
      console.log(`📦 Synced ${store.orders.length} Orders to MongoDB`);
    }

    console.log('====================================================');
    console.log('🎉 All Customer, Restaurant, and Food data is now in MongoDB!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ MongoDB Sync Failed:', err.message);
    console.log('\nTip: Make sure MongoDB is running on port 27017.');
    console.log('Run: npm run mongo');
  } finally {
    await client.close();
  }
}

syncToMongo();
