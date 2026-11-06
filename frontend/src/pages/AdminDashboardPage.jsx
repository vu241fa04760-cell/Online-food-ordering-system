import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Store, 
  Utensils, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import api from '../api/client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'add-restaurant', 'add-food', 'users'

  // Forms
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    cuisine: '',
    image: '',
    deliveryFee: '2.99',
    deliveryTime: '25-35 min',
    street: '',
    city: '',
  });

  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    restaurant: '',
    isVeg: true,
    calories: '500',
  });

  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, restRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders'),
        api.get('/restaurants'),
        api.get('/admin/users'),
      ]);

      setStats(statsRes.data?.data);
      setOrders(ordersRes.data?.data || []);
      setRestaurants(restRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
      if (restRes.data?.data?.length > 0 && !foodForm.restaurant) {
        setFoodForm((prev) => ({ ...prev, restaurant: restRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      setFeedback({ type: 'success', text: `Order status updated to ${newStatus}` });
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/restaurants', {
        name: restaurantForm.name,
        description: restaurantForm.description,
        cuisine: restaurantForm.cuisine.split(',').map((c) => c.trim()),
        image: restaurantForm.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        deliveryFee: Number(restaurantForm.deliveryFee),
        deliveryTime: restaurantForm.deliveryTime,
        address: {
          street: restaurantForm.street || '404 Foodie Street',
          city: restaurantForm.city || 'San Francisco',
        },
      });
      setFeedback({ type: 'success', text: 'New restaurant added successfully!' });
      setRestaurantForm({
        name: '',
        description: '',
        cuisine: '',
        image: '',
        deliveryFee: '2.99',
        deliveryTime: '25-35 min',
        street: '',
        city: '',
      });
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Creation failed' });
    }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/foods', {
        name: foodForm.name,
        description: foodForm.description,
        price: Number(foodForm.price),
        category: foodForm.category,
        image: foodForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
        restaurant: foodForm.restaurant,
        isVeg: foodForm.isVeg,
        calories: Number(foodForm.calories),
      });
      setFeedback({ type: 'success', text: 'Food item added to menu!' });
      setFoodForm((prev) => ({
        ...prev,
        name: '',
        description: '',
        price: '',
      }));
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Creation failed' });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Operations Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage kitchens, menu items, live order lifecycle & users</p>
        </div>
      </div>

      {feedback.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-2xl font-black text-slate-900">${stats?.totalRevenue || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Restaurants</span>
            <span className="text-2xl font-black text-slate-900">{stats?.totalRestaurants || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
            <span className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Live Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('add-restaurant')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'add-restaurant'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Add Restaurant
        </button>
        <button
          onClick={() => setActiveTab('add-food')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'add-food'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Add Food Item
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Live Orders Management Table */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Restaurant</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-900">
                    #{ord._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-slate-900">{ord.user?.name || 'Customer'}</div>
                    <div className="text-[10px] text-slate-400">{ord.user?.email}</div>
                  </td>
                  <td className="py-3 font-bold text-slate-900">
                    {ord.restaurant?.name || 'Kitchen'}
                  </td>
                  <td className="py-3">
                    {ord.items?.length} dishes
                  </td>
                  <td className="py-3 font-black text-slate-900">
                    ${ord.totalAmount?.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : ord.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : 'bg-orange-50 text-orange-700 border-orange-300'
                      }`}
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out For Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Add Restaurant Form */}
      {activeTab === 'add-restaurant' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-2xl">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Add New Partner Restaurant</h3>
          <form onSubmit={handleCreateRestaurant} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Restaurant Name</label>
              <input
                type="text"
                required
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                placeholder="e.g. Saffron Lounge & Bistro"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                required
                rows={2}
                value={restaurantForm.description}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                placeholder="Signature dishes and ambiance description..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cuisines (comma separated)</label>
                <input
                  type="text"
                  required
                  value={restaurantForm.cuisine}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
                  placeholder="Indian, Biryani, Curries"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={restaurantForm.deliveryFee}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryFee: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cover Image URL</label>
              <input
                type="url"
                value={restaurantForm.image}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              Add Restaurant
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Add Food Item Form */}
      {activeTab === 'add-food' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-2xl">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Add Dish to Restaurant Menu</h3>
          <form onSubmit={handleCreateFood} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Restaurant</label>
              <select
                value={foodForm.restaurant}
                onChange={(e) => setFoodForm({ ...foodForm, restaurant: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
              >
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Dish Name</label>
              <input
                type="text"
                required
                value={foodForm.name}
                onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                placeholder="e.g. Artisanal Burrata Pizza"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                required
                rows={2}
                value={foodForm.description}
                onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                placeholder="Ingredients, preparation and flavor notes..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={foodForm.price}
                  onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                  placeholder="14.99"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={foodForm.category}
                  onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                >
                  <option value="Main Course">Main Course</option>
                  <option value="Appetizers">Appetizers</option>
                  <option value="Pizza & Pasta">Pizza & Pasta</option>
                  <option value="Burgers & Wraps">Burgers & Wraps</option>
                  <option value="Biryani & Rice">Biryani & Rice</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Diet Type</label>
                <select
                  value={foodForm.isVeg ? 'true' : 'false'}
                  onChange={(e) => setFoodForm({ ...foodForm, isVeg: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                >
                  <option value="true">Vegetarian</option>
                  <option value="false">Non-Vegetarian</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Image URL</label>
              <input
                type="url"
                value={foodForm.image}
                onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              Add Dish to Menu
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Users List */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80">
                  <td className="py-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 font-mono">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
