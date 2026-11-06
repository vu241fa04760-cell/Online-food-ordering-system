// Embedded Persistent Database & Mock API for Vite Dev Server
// Guarantees zero ECONNREFUSED proxy errors and persists all data to disk!
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_STORE_FILE = path.resolve(__dirname, '../backend/data/db_store.json');

const initialRestaurants = [
  {
    _id: 'rest_01',
    name: 'Bella Napoli Trattoria',
    description: 'Authentic wood-fired Neapolitan pizzas, artisanal handmade pasta, and classic Italian desserts.',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 342,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 15,
    address: {
      street: '184 Columbus Ave',
      city: 'San Francisco',
      coordinates: { lat: 37.7981, lng: -122.4075 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_02',
    name: 'The Royal Spice Kitchen',
    description: 'Aromatic Dum Biryanis, rich butter chicken, garlic naans, and authentic North & South Indian delicacies.',
    cuisine: ['Indian', 'Biryani', 'Curry'],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 520,
    deliveryTime: '25-35 min',
    deliveryFee: 2.49,
    minOrder: 18,
    address: {
      street: '520 Mission St',
      city: 'San Francisco',
      coordinates: { lat: 37.7895, lng: -122.3998 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_03',
    name: 'Tokyo Sushi & Ramen House',
    description: 'Fresh sashimi, signature dragon rolls, authentic tonkotsu ramen with 16-hour simmered broth.',
    cuisine: ['Japanese', 'Sushi', 'Ramen'],
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 289,
    deliveryTime: '30-40 min',
    deliveryFee: 2.99,
    minOrder: 20,
    address: {
      street: '1737 Post St',
      city: 'San Francisco',
      coordinates: { lat: 37.7858, lng: -122.4312 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_04',
    name: 'Burger Crafters & Fries',
    description: 'Juicy gourmet smashed Angus patties, brioche buns, loaded truffle fries, and thick shakes.',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 410,
    deliveryTime: '15-25 min',
    deliveryFee: 1.49,
    minOrder: 12,
    address: {
      street: '784 Market St',
      city: 'San Francisco',
      coordinates: { lat: 37.7865, lng: -122.4046 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_05',
    name: 'Taqueria El Sol',
    description: 'Street-style tacos, sizzled fajitas, cheesy quesadillas, and homemade guacamole & salsa.',
    cuisine: ['Mexican', 'Tacos', 'Burritos'],
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 315,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 15,
    address: {
      street: '2889 Mission St',
      city: 'San Francisco',
      coordinates: { lat: 37.7513, lng: -122.4182 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_06',
    name: 'Green Oasis Bowl & Cafe',
    description: 'Wholesome organic poke bowls, crisp Mediterranean salads, acai smoothie bowls, and cold-pressed juices.',
    cuisine: ['Healthy', 'Salads', 'Vegan'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 198,
    deliveryTime: '15-25 min',
    deliveryFee: 2.29,
    minOrder: 14,
    address: {
      street: '340 Pine St',
      city: 'San Francisco',
      coordinates: { lat: 37.7919, lng: -122.4023 },
    },
    createdAt: new Date().toISOString(),
  },
];

const initialFoods = [
  // Bella Napoli (rest_01)
  {
    _id: 'food_01',
    restaurant: 'rest_01',
    name: 'Margherita D.O.P. Wood-Fired Pizza',
    description: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh sweet basil, and extra virgin olive oil.',
    price: 16.99,
    category: 'Pizza & Pasta',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.9,
    calories: 780,
  },
  {
    _id: 'food_02',
    restaurant: 'rest_01',
    name: 'Truffle & Wild Mushroom Tagliatelle',
    description: 'Handmade tagliatelle tossed in fragrant white truffle cream sauce with sauteed porcini mushrooms.',
    price: 19.5,
    category: 'Pizza & Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.8,
    calories: 690,
  },
  {
    _id: 'food_03',
    restaurant: 'rest_01',
    name: 'Classic Pepperoni & Hot Honey Pizza',
    description: 'Crispy artisanal cupping pepperoni, melted aged mozzarella, oregano, and chili hot honey drizzle.',
    price: 18.99,
    category: 'Pizza & Pasta',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.9,
    calories: 890,
  },
  {
    _id: 'food_04',
    restaurant: 'rest_01',
    name: 'Crispy Calamari Fritti',
    description: 'Tender calamari rings dusted in seasoned semolina flour, flash fried, served with citrus garlic aioli.',
    price: 12.99,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.7,
    calories: 420,
  },
  {
    _id: 'food_05',
    restaurant: 'rest_01',
    name: 'Signature Venetian Tiramisu',
    description: 'Espresso-soaked savoiardi ladyfingers layered with velvety mascarpone cream and Valrhona cocoa.',
    price: 8.5,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.9,
    calories: 380,
  },

  // Royal Spice Kitchen (rest_02)
  {
    _id: 'food_06',
    restaurant: 'rest_02',
    name: 'Royal Hyderabadi Dum Biryani',
    description: 'Long grain aged basmati rice layered with spiced tender chicken, saffron, caramelized onions & mint.',
    price: 17.99,
    category: 'Biryani & Rice',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 5.0,
    calories: 820,
  },
  {
    _id: 'food_07',
    restaurant: 'rest_02',
    name: 'Old Delhi Butter Chicken',
    description: 'Tandoor-charred chicken tikka simmered in creamy satin tomato gravy with fenugreek and butter.',
    price: 16.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.9,
    calories: 740,
  },
  {
    _id: 'food_08',
    restaurant: 'rest_02',
    name: 'Paneer Tikka Masala',
    description: 'Grilled cottage cheese cubes in spiced onion-tomato gravy with bell peppers and cilantro.',
    price: 15.5,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.8,
    calories: 610,
  },
  {
    _id: 'food_09',
    restaurant: 'rest_02',
    name: 'Garlic Butter Naan Basket (3 pcs)',
    description: 'Fresh tandoor-baked flatbread brushed with roasted garlic butter and fresh coriander.',
    price: 5.99,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.8,
    calories: 320,
  },
  {
    _id: 'food_10',
    restaurant: 'rest_02',
    name: 'Gulab Jamun with Pistachio',
    description: 'Golden fried milk dumplings soaked in cardamom and rose water infused sugar syrup.',
    price: 6.5,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.9,
    calories: 310,
  },

  // Tokyo Sushi House (rest_03)
  {
    _id: 'food_11',
    restaurant: 'rest_03',
    name: 'Signature Dragon Roll (8 pcs)',
    description: 'Eel and cucumber topped with sliced avocado, tobiko caviar, sweet unagi glaze and sesame seeds.',
    price: 17.5,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.8,
    calories: 520,
  },
  {
    _id: 'food_12',
    restaurant: 'rest_03',
    name: 'Spicy Salmon & Tuna Poke Bowl',
    description: 'Sashimi-grade diced salmon and tuna over seasoned sushi rice with edamame, seaweed salad and spicy ponzu.',
    price: 18.0,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.9,
    calories: 580,
  },
  {
    _id: 'food_13',
    restaurant: 'rest_03',
    name: 'Tonkotsu Chashu Ramen',
    description: 'Rich pork bone broth, wavy noodles, slow-braised chashu pork belly, soft-boiled ajitsuke tamago egg, nori.',
    price: 16.5,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.9,
    calories: 720,
  },
  {
    _id: 'food_14',
    restaurant: 'rest_03',
    name: 'Crispy Vegetable Gyoza (6 pcs)',
    description: 'Pan-fried Japanese dumplings stuffed with cabbage, mushrooms and spring onion, served with soy vinegar dip.',
    price: 8.99,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.7,
    calories: 290,
  },

  // Burger Crafters (rest_04)
  {
    _id: 'food_15',
    restaurant: 'rest_04',
    name: 'The Ultimate Double Smash Cheeseburger',
    description: 'Two smashed Certified Angus Beef patties, double sharp cheddar, house craft sauce, pickles, grilled brioche.',
    price: 14.99,
    category: 'Burgers & Wraps',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.9,
    calories: 890,
  },
  {
    _id: 'food_16',
    restaurant: 'rest_04',
    name: 'Crispy Buttermilk Hot Chicken Sandwich',
    description: 'Southern fried spicy chicken breast, creamy purple slaw, spicy mayo, and pickles on a toasted sesame bun.',
    price: 13.99,
    category: 'Burgers & Wraps',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.8,
    calories: 750,
  },
  {
    _id: 'food_17',
    restaurant: 'rest_04',
    name: 'Parmesan Truffle Fries',
    description: 'Golden crispy fries tossed in white truffle oil, shaved aged parmesan, and minced Italian parsley.',
    price: 6.99,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.9,
    calories: 460,
  },
  {
    _id: 'food_18',
    restaurant: 'rest_04',
    name: 'Salted Caramel Milkshake',
    description: 'Hand-spun Madagascar vanilla ice cream blended with salted caramel syrup and topped with whipped cream.',
    price: 6.5,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.7,
    calories: 520,
  },

  // Taqueria El Sol (rest_05)
  {
    _id: 'food_19',
    restaurant: 'rest_05',
    name: 'Baja Crispy Fish Tacos (3 pcs)',
    description: 'Beer-battered crispy cod, shredded cabbage, pico de gallo, chipotle crema on warm corn tortillas.',
    price: 13.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.8,
    calories: 590,
  },
  {
    _id: 'food_20',
    restaurant: 'rest_05',
    name: 'Carne Asada Burrito Supreme',
    description: 'Fire-grilled marinated flank steak, pinto beans, Mexican rice, cheese, guacamole, and salsa verde.',
    price: 14.5,
    category: 'Burgers & Wraps',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=60',
    isVeg: false,
    rating: 4.9,
    calories: 840,
  },
  {
    _id: 'food_21',
    restaurant: 'rest_05',
    name: 'Loaded Nachos con Queso',
    description: 'Warm tortilla chips drenched in melted queso, jalapeños, black beans, sour cream, and fresh salsa.',
    price: 10.99,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.7,
    calories: 670,
  },

  // Green Oasis Bowl & Cafe (rest_06)
  {
    _id: 'food_22',
    restaurant: 'rest_06',
    name: 'Mediterranean Falafel & Hummus Bowl',
    description: 'Crispy herb falafels, spiced chickpeas, creamy tahini hummus, pickled turnips, quinoa and greens.',
    price: 14.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.9,
    calories: 480,
  },
  {
    _id: 'food_23',
    restaurant: 'rest_06',
    name: 'Dragonfruit Acai Energy Bowl',
    description: 'Organic acai and pitaya blend topped with chia seeds, banana slices, strawberries, coconut flakes & granola.',
    price: 11.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.8,
    calories: 390,
  },
  {
    _id: 'food_24',
    restaurant: 'rest_06',
    name: 'Cold-Pressed Green Detox Juice',
    description: 'Fresh blend of cucumber, green apple, celery, spinach, ginger, and Meyer lemon.',
    price: 6.99,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=60',
    isVeg: true,
    rating: 4.8,
    calories: 140,
  },
];

// Initial Mock Seed Data
const initialUsers = [
  {
    _id: 'user_admin',
    name: 'System Admin',
    email: 'admin@foodie.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 900-0001',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    address: { street: '100 Culinary Plaza', city: 'San Francisco', zipCode: '94105' },
  },
  {
    _id: 'user_sarah',
    name: 'Sarah Connor',
    email: 'user@foodie.com',
    password: 'user123',
    role: 'customer',
    phone: '+1 (555) 800-4321',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    address: { street: '452 Elm Street, Apt 3B', city: 'San Francisco', zipCode: '94103' },
  },
];

const initialOrders = [
  {
    _id: 'order_demo_101',
    user: 'user_sarah',
    restaurant: initialRestaurants[0],
    items: [
      {
        food: initialFoods[0],
        name: initialFoods[0].name,
        price: initialFoods[0].price,
        quantity: 1,
        image: initialFoods[0].image,
      },
      {
        food: initialFoods[3],
        name: initialFoods[3].name,
        price: initialFoods[3].price,
        quantity: 1,
        image: initialFoods[3].image,
      },
    ],
    subtotal: 29.98,
    deliveryFee: 1.99,
    tax: 2.4,
    totalAmount: 34.37,
    deliveryAddress: {
      street: '452 Elm Street, Apt 3B',
      city: 'San Francisco',
      zipCode: '94103',
      phone: '+1 (555) 800-4321',
    },
    status: 'out_for_delivery',
    paymentStatus: 'completed',
    paymentMethod: 'card',
    deliveryPartner: {
      name: 'Alex Morgan',
      phone: '+1 (555) 234-5678',
      vehicle: 'Electric Scooter (EV-902)',
      rating: 4.9,
      currentLocation: { lat: 37.7785, lng: -122.414 },
    },
    estimatedDeliveryTime: '15 mins',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    statusTimeline: [
      {
        status: 'placed',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        message: 'Order received and confirmed by Bella Napoli Trattoria',
      },
      {
        status: 'preparing',
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        message: 'Chef is baking your authentic wood-fired pizza',
      },
      {
        status: 'out_for_delivery',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        message: 'Courier Alex Morgan picked up order and is on the way',
      },
    ],
  },
];

function loadPersistedData() {
  try {
    if (fs.existsSync(DB_STORE_FILE)) {
      const raw = fs.readFileSync(DB_STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DB Persistent Engine] Read error:', err.message);
  }
  return null;
}

const persisted = loadPersistedData();

let restaurants = persisted?.restaurants || [...initialRestaurants];
let foods = persisted?.foods || [...initialFoods];
let users = persisted?.users || [...initialUsers];
let orders = persisted?.orders || [...initialOrders];
let cartStore = persisted?.cartStore || {
  user: 'user_sarah',
  restaurant: 'rest_01',
  items: [],
};

export function saveDbToDisk() {
  try {
    const dir = path.dirname(DB_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = {
      users,
      orders,
      restaurants,
      foods,
      cartStore,
      lastSaved: new Date().toISOString(),
    };
    fs.writeFileSync(DB_STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB Persistent Engine] Save error:', err.message);
  }
}

if (!persisted) {
  saveDbToDisk();
}

// Direct MongoDB Synchronization Engine
let mongoClientInstance = null;

async function getDirectMongoDb() {
  try {
    if (!mongoClientInstance) {
      const mongodbModule = await import('../../backend/node_modules/mongodb/lib/index.js').catch(() => null);
      if (!mongodbModule || !mongodbModule.MongoClient) return null;
      const client = new mongodbModule.MongoClient('mongodb://127.0.0.1:27017/food_ordering_db', {
        serverSelectionTimeoutMS: 2000,
      });
      await client.connect();
      mongoClientInstance = client;
    }
    return mongoClientInstance.db('food_ordering_db');
  } catch (err) {
    mongoClientInstance = null;
    return null;
  }
}

export async function syncUserToMongo(userDoc) {
  try {
    const db = await getDirectMongoDb();
    if (!db) return;
    const usersCol = db.collection('users');
    const { _id, ...userData } = userDoc;
    await usersCol.updateOne(
      { email: userDoc.email.toLowerCase() },
      {
        $set: {
          ...userData,
          email: userDoc.email.toLowerCase(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`[MongoDB Direct] Persisted user "${userDoc.name}" (${userDoc.email}) to MongoDB database!`);
  } catch (err) {
    // Non-blocking
  }
}

export async function syncOrderToMongo(orderDoc) {
  try {
    const db = await getDirectMongoDb();
    if (!db) return;
    const ordersCol = db.collection('orders');
    await ordersCol.updateOne(
      { _id: orderDoc._id },
      { $set: { ...orderDoc, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {}
}

// Initial sync of existing users to MongoDB if reachable
setTimeout(async () => {
  for (const u of users) {
    await syncUserToMongo(u);
  }
}, 1000);

export function handleMockApi(req, res, bodyBuffer) {
  const urlObj = new URL(req.url, 'http://localhost:5173');
  const pathname = urlObj.pathname;
  const method = req.method.toUpperCase();
  const params = urlObj.searchParams;

  let body = {};
  if (bodyBuffer && bodyBuffer.length > 0) {
    try {
      body = JSON.parse(bodyBuffer.toString());
    } catch (e) {
      body = {};
    }
  }

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end(JSON.stringify(data));
  };

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // Health
  if (pathname === '/api/health') {
    return sendJson(200, {
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'Online Food Ordering System REST API (Embedded Engine)',
    });
  }

  // GET /api/restaurants
  if (pathname === '/api/restaurants' && method === 'GET') {
    let result = [...restaurants];
    const search = params.get('search');
    const cuisine = params.get('cuisine');
    const rating = params.get('rating');
    const sort = params.get('sort');

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.cuisine.some((c) => c.toLowerCase().includes(q))
      );
    }
    if (cuisine) {
      result = result.filter((r) => r.cuisine.some((c) => c.toLowerCase() === cuisine.toLowerCase()));
    }
    if (rating) {
      result = result.filter((r) => r.rating >= parseFloat(rating));
    }
    if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'deliveryFee') {
      result.sort((a, b) => a.deliveryFee - b.deliveryFee);
    }

    return sendJson(200, { success: true, count: result.length, data: result });
  }

  // GET /api/restaurants/:id/foods
  const restFoodsMatch = pathname.match(/^\/api\/restaurants\/([^\/]+)\/foods$/);
  if (restFoodsMatch && method === 'GET') {
    const restId = restFoodsMatch[1];
    const restFoods = foods.filter((f) => f.restaurant === restId);
    return sendJson(200, { success: true, count: restFoods.length, data: restFoods });
  }

  // GET /api/restaurants/:id
  const singleRestMatch = pathname.match(/^\/api\/restaurants\/([^\/]+)$/);
  if (singleRestMatch && method === 'GET') {
    const restId = singleRestMatch[1];
    const rest = restaurants.find((r) => r._id === restId);
    if (!rest) return sendJson(404, { success: false, message: 'Restaurant not found' });
    const restFoods = foods.filter((f) => f.restaurant === restId);
    return sendJson(200, { success: true, data: { ...rest, foods: restFoods } });
  }

  // GET /api/foods
  if (pathname === '/api/foods' && method === 'GET') {
    let result = [...foods];
    const search = params.get('search');
    const category = params.get('category');
    const restaurant = params.get('restaurant');
    const isVeg = params.get('isVeg');

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    if (category) {
      result = result.filter((f) => f.category.toLowerCase() === category.toLowerCase());
    }
    if (restaurant) {
      result = result.filter((f) => f.restaurant === restaurant);
    }
    if (isVeg !== null && isVeg !== undefined) {
      result = result.filter((f) => f.isVeg === (isVeg === 'true'));
    }

    // Populate restaurant minimal info
    const populated = result.map((f) => {
      const r = restaurants.find((item) => item._id === f.restaurant);
      return {
        ...f,
        restaurant: r ? { _id: r._id, name: r.name, rating: r.rating, deliveryTime: r.deliveryTime, deliveryFee: r.deliveryFee } : f.restaurant,
      };
    });

    return sendJson(200, { success: true, count: populated.length, data: populated });
  }

  // GET /api/foods/:id
  const singleFoodMatch = pathname.match(/^\/api\/foods\/([^\/]+)$/);
  if (singleFoodMatch && method === 'GET') {
    const foodId = singleFoodMatch[1];
    const food = foods.find((f) => f._id === foodId);
    if (!food) return sendJson(404, { success: false, message: 'Food not found' });
    const r = restaurants.find((item) => item._id === food.restaurant);
    return sendJson(200, {
      success: true,
      data: {
        ...food,
        restaurant: r ? { _id: r._id, name: r.name, rating: r.rating, deliveryTime: r.deliveryTime, deliveryFee: r.deliveryFee } : food.restaurant,
      },
    });
  }

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    if (!email) {
      return sendJson(400, { success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    // If demo customer alias
    if (!found && (cleanEmail === 'user@foodie.com' || cleanEmail === 'customer@foodie.com')) {
      found = users.find((u) => u.email === 'user@foodie.com') || users[1];
    }
    // If demo admin alias
    if (!found && cleanEmail === 'admin@foodie.com') {
      found = users.find((u) => u.email === 'admin@foodie.com') || users[0];
    }

    if (!found) {
      return sendJson(401, {
        success: false,
        message: 'No account registered with this email. Please click "Create one now" to register.',
      });
    }

    // Verify password if set and not demo
    if (password && found.password && found.password !== password) {
      return sendJson(401, {
        success: false,
        message: 'Incorrect password. Click "Forgot password?" to reset.',
      });
    }

    const token = `mock_jwt_${found._id}__${found.role}_${Date.now()}`;
    return sendJson(200, {
      success: true,
      message: 'Login successful!',
      data: {
        _id: found._id,
        name: found.name,
        email: found.email,
        role: found.role,
        phone: found.phone,
        avatar: found.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        address: found.address,
        token,
      },
    });
  }

  // POST /api/auth/register
  if (pathname === '/api/auth/register' && method === 'POST') {
    const { name, email, password, phone, address, role, avatar } = body;
    if (!email || !password) {
      return sendJson(400, { success: false, message: 'Email and password are required' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return sendJson(400, { success: false, message: 'An account with this email already exists. Please Sign In.' });
    }

    const assignedRole = (role === 'admin' || role === 'administrator') ? 'admin' : 'customer';
    const newUser = {
      _id: `user_${Date.now()}`,
      name: (name || 'Gourmet Patron').trim(),
      email: cleanEmail,
      password: password,
      role: assignedRole,
      phone: phone || '+1 (555) 000-0000',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      address: address || { street: '123 Market St', city: 'San Francisco', zipCode: '94105' },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveDbToDisk(); // Persist user to disk permanently!
    syncUserToMongo(newUser); // Save customer directly to MongoDB!

    const token = `mock_jwt_${newUser._id}__${newUser.role}_${Date.now()}`;

    return sendJson(201, {
      success: true,
      message: 'Account created successfully!',
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        address: newUser.address,
        token,
      },
    });
  }

  // POST /api/auth/forgot-password
  if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    const { email } = body;
    if (!email) {
      return sendJson(400, { success: false, message: 'Please provide your email address' });
    }
    const cleanEmail = email.trim().toLowerCase();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Auto-provision demo account so user can immediately test
      user = {
        _id: `user_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        password: 'password123',
        role: 'customer',
        phone: '+1 (555) 012-3456',
        address: { street: '123 Main St', city: 'San Francisco', zipCode: '94105' },
      };
      users.push(user);
    }

    const resetCode = '123456';
    user.resetCode = resetCode;
    user.resetCodeExpire = Date.now() + 15 * 60 * 1000;

    return sendJson(200, {
      success: true,
      message: 'Reset verification code sent to your email!',
      code: resetCode,
      email: cleanEmail,
    });
  }

  // POST /api/auth/reset-password
  if (pathname === '/api/auth/reset-password' && method === 'POST') {
    const { email, code, newPassword } = body;
    if (!email || !newPassword) {
      return sendJson(400, { success: false, message: 'Email and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return sendJson(404, { success: false, message: 'No account found with this email' });
    }

    if (code && code !== '123456' && code !== user.resetCode) {
      return sendJson(400, { success: false, message: 'Invalid verification code. Please enter code: 123456' });
    }

    user.password = newPassword;
    user.resetCode = undefined;

    return sendJson(200, {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  }

  // GET /api/auth/profile
  if (pathname === '/api/auth/profile' && method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    let foundUser = null;
    if (token) {
      foundUser = users.find((u) => token.includes(u._id));
      if (!foundUser && token.includes('admin')) {
        foundUser = users.find((u) => u.role === 'admin');
      }
      if (!foundUser && token.includes('customer')) {
        foundUser = users.find((u) => u.role === 'customer');
      }
    }

    if (!foundUser) {
      foundUser = users[1]; // fallback
    }

    return sendJson(200, {
      success: true,
      data: {
        _id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        phone: foundUser.phone,
        avatar: foundUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        address: foundUser.address,
      },
    });
  }

  // PUT /api/auth/profile & PUT /api/auth/address
  if ((pathname === '/api/auth/profile' || pathname === '/api/auth/address') && method === 'PUT') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    let foundUser = null;
    if (token) {
      foundUser = users.find((u) => token.includes(u._id));
      if (!foundUser && token.includes('admin')) foundUser = users.find((u) => u.role === 'admin');
      if (!foundUser && token.includes('customer')) foundUser = users.find((u) => u.role === 'customer');
    }
    if (!foundUser) {
      foundUser = users[1]; // fallback to active user
    }

    if (body.address) {
      foundUser.address = {
        ...(foundUser.address || {}),
        ...body.address,
      };
    }
    if (body.name) foundUser.name = body.name;
    if (body.phone) foundUser.phone = body.phone;
    if (body.avatar) foundUser.avatar = body.avatar;

    saveDbToDisk(); // Persist changes directly to disk!
    syncUserToMongo(foundUser); // Save updated profile directly to MongoDB!

    return sendJson(200, {
      success: true,
      message: 'Delivery address and profile updated successfully',
      data: {
        _id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        phone: foundUser.phone,
        avatar: foundUser.avatar,
        address: foundUser.address,
      },
    });
  }

  // GET /api/cart
  if (pathname === '/api/cart' && method === 'GET') {
    const rest = restaurants.find((r) => r._id === cartStore.restaurant);
    const populatedCart = {
      ...cartStore,
      restaurant: rest ? { _id: rest._id, name: rest.name, deliveryFee: rest.deliveryFee } : null,
      items: cartStore.items.map((it) => {
        const f = foods.find((food) => food._id === (it.food._id || it.food));
        return {
          ...it,
          food: f || it.food,
        };
      }),
    };
    return sendJson(200, { success: true, data: populatedCart });
  }

  // POST /api/cart/items
  if (pathname === '/api/cart/items' && method === 'POST') {
    const { foodId, quantity = 1 } = body;
    const food = foods.find((f) => f._id === foodId);
    if (!food) return sendJson(404, { success: false, message: 'Food item not found' });

    if (cartStore.restaurant && cartStore.restaurant !== food.restaurant && cartStore.items.length > 0) {
      cartStore.restaurant = food.restaurant;
      cartStore.items = [];
    } else if (!cartStore.restaurant) {
      cartStore.restaurant = food.restaurant;
    }

    const existingIndex = cartStore.items.findIndex((it) => (it.food._id || it.food) === foodId);
    if (existingIndex > -1) {
      cartStore.items[existingIndex].quantity += Number(quantity);
    } else {
      cartStore.items.push({
        _id: `cart_item_${Date.now()}_${Math.random()}`,
        food: food,
        quantity: Number(quantity),
        price: food.price,
      });
    }

    const rest = restaurants.find((r) => r._id === cartStore.restaurant);
    return sendJson(200, {
      success: true,
      data: {
        ...cartStore,
        restaurant: rest ? { _id: rest._id, name: rest.name, deliveryFee: rest.deliveryFee } : null,
      },
    });
  }

  // PUT /api/cart/items/:id
  const updateCartMatch = pathname.match(/^\/api\/cart\/items\/([^\/]+)$/);
  if (updateCartMatch && method === 'PUT') {
    const foodId = updateCartMatch[1];
    const { quantity } = body;
    const idx = cartStore.items.findIndex((it) => (it.food._id || it.food) === foodId);
    if (idx > -1) {
      if (Number(quantity) <= 0) {
        cartStore.items.splice(idx, 1);
      } else {
        cartStore.items[idx].quantity = Number(quantity);
      }
    }
    const rest = restaurants.find((r) => r._id === cartStore.restaurant);
    return sendJson(200, {
      success: true,
      data: {
        ...cartStore,
        restaurant: rest ? { _id: rest._id, name: rest.name, deliveryFee: rest.deliveryFee } : null,
      },
    });
  }

  // DELETE /api/cart/items/:id
  if (updateCartMatch && method === 'DELETE') {
    const foodId = updateCartMatch[1];
    if (foodId === 'clear') {
      cartStore.items = [];
    } else {
      cartStore.items = cartStore.items.filter((it) => (it.food._id || it.food) !== foodId);
    }
    const rest = restaurants.find((r) => r._id === cartStore.restaurant);
    return sendJson(200, {
      success: true,
      data: {
        ...cartStore,
        restaurant: rest ? { _id: rest._id, name: rest.name, deliveryFee: rest.deliveryFee } : null,
      },
    });
  }

  // POST /api/orders
  if (pathname === '/api/orders' && method === 'POST') {
    const rest = restaurants.find((r) => r._id === (body.restaurantId || cartStore.restaurant)) || restaurants[0];
    const orderItems = (cartStore.items.length > 0 ? cartStore.items : [
      { food: foods[0], name: foods[0].name, price: foods[0].price, quantity: 1, image: foods[0].image }
    ]).map((it) => ({
      food: it.food._id || it.food,
      name: it.food.name || it.name,
      price: it.food.price || it.price,
      quantity: it.quantity,
      image: it.food.image || it.image,
    }));

    const subtotal = orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const deliveryFee = rest.deliveryFee || 2.49;
    const tax = +(subtotal * 0.08).toFixed(2);
    const totalAmount = +(subtotal + deliveryFee + tax).toFixed(2);

    const newOrder = {
      _id: `ord_${Date.now()}`,
      user: users[1]._id,
      restaurant: rest,
      items: orderItems,
      subtotal: +subtotal.toFixed(2),
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress: body.deliveryAddress || {
        street: '452 Elm Street, Apt 3B',
        city: 'San Francisco',
        zipCode: '94103',
        phone: '+1 (555) 800-4321',
      },
      status: 'placed',
      paymentStatus: 'completed',
      paymentMethod: body.paymentMethod || 'card',
      deliveryPartner: {
        name: 'Alex Morgan',
        phone: '+1 (555) 234-5678',
        vehicle: 'Electric Scooter (EV-902)',
        rating: 4.9,
        currentLocation: { lat: 37.7801, lng: -122.411 },
      },
      estimatedDeliveryTime: '25-35 mins',
      createdAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'placed',
          timestamp: new Date().toISOString(),
          message: `Order received and confirmed by ${rest.name}`,
        },
      ],
    };

    orders.unshift(newOrder);
    cartStore.items = []; // Clear cart
    saveDbToDisk(); // Persist order to disk!
    syncOrderToMongo(newOrder); // Save order directly to MongoDB!

    return sendJson(201, { success: true, data: newOrder });
  }

  // GET /api/orders
  if (pathname === '/api/orders' && method === 'GET') {
    return sendJson(200, { success: true, count: orders.length, data: orders });
  }

  // GET /api/orders/:id
  const singleOrderMatch = pathname.match(/^\/api\/orders\/([^\/]+)$/);
  if (singleOrderMatch && method === 'GET') {
    const orderId = singleOrderMatch[1];
    const ord = orders.find((o) => o._id === orderId);
    if (!ord) return sendJson(404, { success: false, message: 'Order not found' });
    return sendJson(200, { success: true, data: ord });
  }

  // PUT /api/orders/:id/cancel
  const cancelOrderMatch = pathname.match(/^\/api\/orders\/([^\/]+)\/cancel$/);
  if (cancelOrderMatch && method === 'PUT') {
    const orderId = cancelOrderMatch[1];
    const ord = orders.find((o) => o._id === orderId);
    if (!ord) return sendJson(404, { success: false, message: 'Order not found' });
    ord.status = 'cancelled';
    ord.statusTimeline.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      message: 'Order cancelled by customer.',
    });
    saveDbToDisk();
    return sendJson(200, { success: true, data: ord });
  }

  // POST /api/payments
  if (pathname === '/api/payments' && method === 'POST') {
    return sendJson(200, {
      success: true,
      data: {
        status: 'success',
        transactionId: `TXN_MOCK_${Date.now()}`,
        amount: body.amount || 25.0,
      },
    });
  }

  // Admin APIs
  if (pathname === '/api/admin/stats' && method === 'GET') {
    const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return sendJson(200, {
      success: true,
      data: {
        totalRevenue: +revenue.toFixed(2),
        totalOrders: orders.length,
        activeOrders: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
        totalUsers: users.length,
        totalRestaurants: restaurants.length,
      },
    });
  }

  if (pathname === '/api/admin/orders' && method === 'GET') {
    return sendJson(200, { success: true, count: orders.length, data: orders });
  }

  if (pathname === '/api/admin/users' && method === 'GET') {
    return sendJson(200, { success: true, count: users.length, data: users });
  }

  const adminOrderStatusMatch = pathname.match(/^\/api\/admin\/orders\/([^\/]+)$/);
  if (adminOrderStatusMatch && method === 'PUT') {
    const orderId = adminOrderStatusMatch[1];
    const ord = orders.find((o) => o._id === orderId);
    if (!ord) return sendJson(404, { success: false, message: 'Order not found' });
    ord.status = body.status || ord.status;
    ord.statusTimeline.push({
      status: ord.status,
      timestamp: new Date().toISOString(),
      message: `Status updated to ${ord.status} by administrator.`,
    });
    saveDbToDisk();
    return sendJson(200, { success: true, data: ord });
  }

  if (pathname === '/api/admin/restaurants' && method === 'POST') {
    const newRest = {
      _id: `rest_${Date.now()}`,
      name: body.name || 'New Gourmet Venue',
      description: body.description || 'Artisanal culinary cuisine.',
      cuisine: Array.isArray(body.cuisine) ? body.cuisine : [body.cuisine || 'Continental'],
      image: body.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      rating: body.rating || 4.8,
      reviewsCount: 1,
      deliveryTime: body.deliveryTime || '25-35 min',
      deliveryFee: body.deliveryFee || 2.49,
      minOrder: body.minOrder || 15,
      address: body.address || { street: '100 Main St', city: 'San Francisco' },
      createdAt: new Date().toISOString(),
    };
    restaurants.unshift(newRest);
    saveDbToDisk();
    return sendJson(201, { success: true, data: newRest });
  }

  if (pathname === '/api/admin/foods' && method === 'POST') {
    const newFood = {
      _id: `food_${Date.now()}`,
      restaurant: body.restaurant || restaurants[0]._id,
      name: body.name || 'New Gourmet Dish',
      description: body.description || 'Deliciously crafted by head chef.',
      price: Number(body.price) || 15.99,
      category: body.category || 'Main Course',
      image: body.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      isVeg: Boolean(body.isVeg),
      rating: 4.8,
      calories: 550,
    };
    foods.unshift(newFood);
    saveDbToDisk();
    return sendJson(201, { success: true, data: newFood });
  }

  // Fallback 404
  return sendJson(404, { success: false, message: `Route ${pathname} not found` });
}
