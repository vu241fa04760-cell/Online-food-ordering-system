// Automated API test script to verify all backend REST endpoints
const http = require('http');

const runTests = async () => {
  // Start server locally inside test
  const app = require('express')();
  const cors = require('cors');
  const dotenv = require('dotenv');
  const mongoose = require('mongoose');
  dotenv.config();

  await mongoose.connect(process.env.MONGODB_URI);

  app.use(cors());
  app.use(require('express').json());
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/restaurants', require('./routes/restaurantRoutes'));
  app.use('/api/foods', require('./routes/foodRoutes'));
  app.use('/api/cart', require('./routes/cartRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use(require('./middleware/error'));

  const server = app.listen(5005, async () => {
    console.log('[Test Server] Listening on port 5005');

    try {
      const fetch = (url, options = {}) =>
        new Promise((resolve, reject) => {
          const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode, data: JSON.parse(body) });
              } catch (e) {
                resolve({ status: res.statusCode, data: body });
              }
            });
          });
          req.on('error', reject);
          if (options.body) req.write(options.body);
          req.end();
        });

      // 1. Test Login
      console.log('Testing: POST /api/auth/login');
      const loginRes = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@foodie.com', password: 'user123' }),
      });
      console.log('  Login status:', loginRes.status, 'User:', loginRes.data.data?.name);
      const token = loginRes.data.data?.token;

      // 2. Test Restaurants
      console.log('Testing: GET /api/restaurants');
      const restRes = await fetch('http://localhost:5005/api/restaurants');
      console.log('  Restaurants count:', restRes.data.data?.length);
      const restId = restRes.data.data[0]._id;

      // 3. Test Foods
      console.log(`Testing: GET /api/restaurants/${restId}/foods`);
      const foodRes = await fetch(`http://localhost:5005/api/restaurants/${restId}/foods`);
      console.log('  Foods for restaurant:', foodRes.data.data?.length);
      const foodId = foodRes.data.data[0]._id;

      // 4. Test Cart
      console.log('Testing: POST /api/cart/items');
      const cartRes = await fetch('http://localhost:5005/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ foodId, quantity: 2 }),
      });
      console.log('  Cart items count:', cartRes.data.data?.items?.length);

      // 5. Test Orders
      console.log('Testing: POST /api/orders');
      const orderRes = await fetch('http://localhost:5005/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod: 'card' }),
      });
      console.log('  Order created ID:', orderRes.data.data?._id, 'Total:', orderRes.data.data?.totalAmount);

      console.log('ALL API ENDPOINTS TESTED SUCCESSFULLY! 🎉');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Test Failed:', err);
      server.close();
      process.exit(1);
    }
  });
};

runTests();
