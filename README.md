# FoodieFlow - Online Food Ordering System 🍕🍔🥗

A modern, full-stack **Online Food Ordering System** built with **React, Node.js, Express, and MongoDB**. Features end-to-end customer ordering, live GPS satellite order tracking with animated courier movement, simulated external services (Payment Gateway, Maps, SMS/Email notifications), and an administrative control center.

---

## 🏛️ System Architecture

```text
Online Food Ordering System
│
├── 1. Frontend (User Interface)
│   ├── Home Page (Hero, Cuisines, Trending Dishes, Top Restaurants)
│   ├── Login / Register (JWT Auth, 1-Click Demo Accounts)
│   ├── Restaurant List (Live Search, Cuisine & Rating Filters)
│   ├── Food Menu (Dietary Veg Filters, Category Navigation)
│   ├── Shopping Cart (Quantity Steppers, Promo Vouchers, Payment Gateway)
│   └── Order Tracking (Real-time GPS Animated Courier, Live Progress Timeline)
│
├── 2. Backend (REST API)
│   ├── Authentication API
│   │   ├── POST /api/auth/register
│   │   ├── POST /api/auth/login
│   │   └── GET  /api/auth/profile
│   │
│   ├── Restaurant API
│   │   ├── GET  /api/restaurants
│   │   └── GET  /api/restaurants/{id}
│   │
│   ├── Food API
│   │   ├── GET  /api/foods
│   │   ├── GET  /api/foods/{id}
│   │   └── GET  /api/restaurants/{id}/foods
│   │
│   ├── Cart API
│   │   ├── GET    /api/cart
│   │   ├── POST   /api/cart/items
│   │   ├── PUT    /api/cart/items/{id}
│   │   └── DELETE /api/cart/items/{id}
│   │
│   ├── Order API
│   │   ├── POST /api/orders
│   │   ├── GET  /api/orders
│   │   ├── GET  /api/orders/{id}
│   │   └── PUT  /api/orders/{id}/cancel
│   │
│   ├── Payment API
│   │   ├── POST /api/payments
│   │   └── GET  /api/payments/{id}
│   │
│   └── Admin API
│       ├── GET    /api/admin/users
│       ├── POST   /api/admin/restaurants
│       ├── POST   /api/admin/foods
│       └── PUT    /api/admin/orders/{id}
│
├── 3. Database (MongoDB)
│   ├── Users
│   ├── Restaurants
│   ├── Food_Items
│   ├── Cart_Items
│   ├── Orders
│   ├── Order_Items
│   └── Payments
│
└── 4. External Services (Simulated)
    ├── Payment Gateway API (Stripe / Razorpay simulation)
    ├── Maps / Location API (Distance calculation & route coordinates)
    ├── SMS / Email Notification API (Order updates & cancel alerts)
    └── Delivery Partner API (Rider telemetry & status simulation)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on port `27017`

### 1. Seed the Database
Populates 6 restaurants, 24 gourmet dishes, demo users, and a sample active tracking order:
```bash
npm run seed
```

### 2. Start the Backend API Server
Runs on `http://localhost:5000`:
```bash
npm run server
```

### 3. Start the Frontend Client
In a separate terminal, launch Vite dev server on `http://localhost:5173`:
```bash
npm run client
```

Open `http://localhost:5173` in your browser.

The Vite development server proxies API requests to the backend on port `5000`. Start the backend before the frontend; if MongoDB is unavailable, the backend will not start and API requests will fail rather than being saved to a local mock JSON file. To start all services together, use `npm run dev`.

---

## 🔑 Demo Accounts

Quick 1-click login buttons are provided on the login modal:

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** | `user@foodie.com` | `user123` | Cart, Checkout, Order Tracking, Profile |
| **Admin** | `admin@foodie.com` | `admin123` | Restaurant Management, Add Food, Live Order Status Dispatcher |

---

## 💳 Special Offers & Vouchers
- Use promo voucher code **`FOODIE20`** at checkout for **20% off** your entire meal!
