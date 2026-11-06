import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Bike, 
  MapPin, 
  ShieldCheck, 
  Leaf 
} from 'lucide-react';
import api from '../api/client';
import FoodCard from '../components/FoodCard';

export default function FoodMenuPage({ restaurantId, onBack }) {
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/restaurants/${restaurantId}`);
        setRestaurant(res.data?.data);
        setFoods(res.data?.data?.foods || []);
      } catch (err) {
        console.error('Failed to fetch restaurant menu:', err);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchMenu();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading menu & delicious dishes...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="py-20 text-center">
        <p className="text-base font-bold text-slate-800">Restaurant not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  // Derive unique categories from foods
  const categories = ['All', ...new Set(foods.map((f) => f.category))];

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesVeg = !vegOnly || food.isVeg;
    return matchesCategory && matchesVeg;
  });

  return (
    <div className="space-y-8">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurants</span>
      </button>

      {/* Restaurant Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-lg shadow-slate-100">
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {restaurant.cuisine?.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{restaurant.name}</h1>
              <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-xl">
                {restaurant.description}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shrink-0">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <span className="font-black text-lg text-white leading-none block">{restaurant.rating}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {restaurant.reviewsCount} Reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Restaurant Specs Strip */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>{restaurant.deliveryTime} delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-600" />
              <span>${restaurant.deliveryFee?.toFixed(2)} delivery fee</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{restaurant.address?.street}, {restaurant.address?.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>FSSAI Certified Safe</span>
          </div>
        </div>
      </div>

      {/* Menu Filter & Dietary Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        
        {/* Category Scrollable Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Veg Only Toggle Switch */}
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 self-start sm:self-auto ${
            vegOnly
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Leaf className={`w-3.5 h-3.5 ${vegOnly ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
          <span>Pure Veg Only</span>
        </button>

      </div>

      {/* Menu Items Grid */}
      {filteredFoods.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <p className="font-bold text-slate-800">No dishes found in this category.</p>
          <p className="text-xs text-slate-500 mt-1">Try switching categories or disabling the pure veg filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}

    </div>
  );
}
