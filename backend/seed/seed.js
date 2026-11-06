const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

dotenv.config();

const seedData = async (exitOnComplete = true) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_ordering_db';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
      console.log('[Seed] Connected to MongoDB...');
    }

    // Clear existing collections
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Food.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await Payment.deleteMany();
    console.log('[Seed] Cleared existing data.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@foodie.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 900-0001',
      address: {
        street: '100 Culinary Plaza, Suite 400',
        city: 'San Francisco',
        zipCode: '94105',
      },
    });

    const demoCustomer = await User.create({
      name: 'Sarah Connor',
      email: 'user@foodie.com',
      password: 'user123',
      role: 'customer',
      phone: '+1 (555) 800-4321',
      address: {
        street: '452 Elm Street, Apt 3B',
        city: 'San Francisco',
        zipCode: '94103',
      },
    });

    console.log('[Seed] Created default Admin and Demo Customer accounts.');

    // 2. Create Restaurants
    const restaurantsData = [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
    ];

    const createdRestaurants = await Restaurant.insertMany(restaurantsData);
    console.log(`[Seed] Created ${createdRestaurants.length} restaurants.`);

    // 3. Create Foods for each restaurant
    const foodsData = [
      // Bella Napoli
      {
        restaurant: createdRestaurants[0]._id,
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
        restaurant: createdRestaurants[0]._id,
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
        restaurant: createdRestaurants[0]._id,
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
        restaurant: createdRestaurants[0]._id,
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
        restaurant: createdRestaurants[0]._id,
        name: 'Signature Venetian Tiramisu',
        description: 'Espresso-soaked savoiardi ladyfingers layered with velvety mascarpone cream and Valrhona cocoa.',
        price: 8.5,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=60',
        isVeg: true,
        rating: 4.9,
        calories: 380,
      },

      // Royal Spice Kitchen
      {
        restaurant: createdRestaurants[1]._id,
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
        restaurant: createdRestaurants[1]._id,
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
        restaurant: createdRestaurants[1]._id,
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
        restaurant: createdRestaurants[1]._id,
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
        restaurant: createdRestaurants[1]._id,
        name: 'Gulab Jamun with Pistachio',
        description: 'Golden fried milk dumplings soaked in cardamom and rose water infused sugar syrup.',
        price: 6.5,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=60',
        isVeg: true,
        rating: 4.9,
        calories: 310,
      },

      // Tokyo Sushi House
      {
        restaurant: createdRestaurants[2]._id,
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
        restaurant: createdRestaurants[2]._id,
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
        restaurant: createdRestaurants[2]._id,
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
        restaurant: createdRestaurants[2]._id,
        name: 'Crispy Vegetable Gyoza (6 pcs)',
        description: 'Pan-fried Japanese dumplings stuffed with cabbage, mushrooms and spring onion, served with soy vinegar dip.',
        price: 8.99,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=60',
        isVeg: true,
        rating: 4.7,
        calories: 290,
      },

      // Burger Crafters
      {
        restaurant: createdRestaurants[3]._id,
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
        restaurant: createdRestaurants[3]._id,
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
        restaurant: createdRestaurants[3]._id,
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
        restaurant: createdRestaurants[3]._id,
        name: 'Salted Caramel Milkshake',
        description: 'Hand-spun Madagascar vanilla ice cream blended with salted caramel syrup and topped with whipped cream.',
        price: 6.5,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60',
        isVeg: true,
        rating: 4.7,
        calories: 520,
      },

      // Taqueria El Sol
      {
        restaurant: createdRestaurants[4]._id,
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
        restaurant: createdRestaurants[4]._id,
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
        restaurant: createdRestaurants[4]._id,
        name: 'Loaded Nachos con Queso',
        description: 'Warm tortilla chips drenched in melted queso, jalapeños, black beans, sour cream, and fresh salsa.',
        price: 10.99,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=60',
        isVeg: true,
        rating: 4.7,
        calories: 670,
      },

      // Green Oasis Bowl & Cafe
      {
        restaurant: createdRestaurants[5]._id,
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
        restaurant: createdRestaurants[5]._id,
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
        restaurant: createdRestaurants[5]._id,
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

    const createdFoods = await Food.insertMany(foodsData);
    console.log(`[Seed] Created ${createdFoods.length} delicious food items.`);

    // 4. Create an active sample order for Sarah Connor for demonstration
    const sampleOrder = await Order.create({
      user: demoCustomer._id,
      restaurant: createdRestaurants[0]._id,
      items: [
        {
          food: createdFoods[0]._id,
          name: createdFoods[0].name,
          price: createdFoods[0].price,
          quantity: 1,
          image: createdFoods[0].image,
        },
        {
          food: createdFoods[3]._id,
          name: createdFoods[3].name,
          price: createdFoods[3].price,
          quantity: 1,
          image: createdFoods[3].image,
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
      statusTimeline: [
        {
          status: 'placed',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          message: 'Order received and confirmed by Bella Napoli Trattoria',
        },
        {
          status: 'preparing',
          timestamp: new Date(Date.now() - 18 * 60 * 1000),
          message: 'Chef is baking your authentic wood-fired pizza',
        },
        {
          status: 'out_for_delivery',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          message: 'Courier Alex Morgan picked up order and is on the way',
        },
      ],
    });

    await Payment.create({
      order: sampleOrder._id,
      user: demoCustomer._id,
      amount: sampleOrder.totalAmount,
      paymentMethod: 'card',
      transactionId: 'TXN_CARD_DEMO_99812',
      status: 'success',
    });

    console.log(`[Seed] Created sample live order #${sampleOrder._id} for demo.`);
    console.log('[Seed] Database successfully seeded!');
    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (exitOnComplete) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
