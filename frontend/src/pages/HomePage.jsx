import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Star, 
  Clock, 
  Bike, 
  ArrowRight, 
  Flame, 
  Pizza, 
  Soup, 
  Fish, 
  Sandwich, 
  Salad 
} from 'lucide-react';
import api from '../api/client';
import FoodCard from '../components/FoodCard';

export default function HomePage({ onSelectRestaurant, onNavigate }) {
  const [restaurants, setRestaurants] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const cuisines = [
    { name: 'Pizza', icon: Pizza, color: 'bg-rose-50 text-rose-600 border-rose-200' },
    { name: 'Biryani', icon: Soup, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { name: 'Sushi', icon: Fish, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { name: 'Burgers', icon: Sandwich, color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { name: 'Salads', icon: Salad, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restRes, foodRes] = await Promise.all([
          api.get('/restaurants'),
          api.get('/foods'),
        ]);
        setRestaurants(restRes.data?.data || []);
        setPopularFoods((foodRes.data?.data || []).slice(0, 6));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('restaurants', { search: searchQuery });
  };

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white p-8 md:p-14 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Fastest Delivery in Town
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Delicious food, delivered <span className="underline decoration-amber-300 decoration-wavy">hot & fresh</span>.
          </h1>
          <p className="text-orange-100 text-sm md:text-base leading-relaxed">
            Order from top gourmet restaurants, local gems, and popular kitchens in your neighborhood.
          </p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-xl max-w-lg">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search for restaurants, burgers, sushi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-2 text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shrink-0 shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Special Offer Pill */}
          <div className="flex items-center gap-3 text-xs text-orange-100 pt-2">
            <span className="font-bold text-white bg-white/20 px-2.5 py-1 rounded-lg">PROMO: FOODIE20</span>
            <span>Use code at checkout for 20% off your entire order!</span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Cuisines Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Cuisines</h2>
            <p className="text-xs text-slate-500 mt-1">Explore delicious flavors curated for your cravings</p>
          </div>
          <button
            onClick={() => onNavigate('restaurants')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {cuisines.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.name}
                onClick={() => onNavigate('restaurants', { cuisine: c.name })}
                className={`p-5 rounded-3xl border flex flex-col items-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${c.color}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-slate-800">{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Top Rated Restaurants</h2>
            <p className="text-xs text-slate-500 mt-1">Celebrated kitchens with stellar reviews</p>
          </div>
          <button
            onClick={() => onNavigate('restaurants')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>See All Restaurants</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.slice(0, 6).map((restaurant) => (
            <div
              key={restaurant._id}
              onClick={() => onSelectRestaurant(restaurant._id)}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{restaurant.rating}</span>
                  <span className="text-slate-400 text-[10px]">({restaurant.reviewsCount})</span>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                  {restaurant.cuisine?.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold shadow-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">
                  {restaurant.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {restaurant.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span>${restaurant.deliveryFee.toFixed(2)} Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-600 fill-orange-600" />
              Trending Mouthwatering Dishes
            </h2>
            <p className="text-xs text-slate-500 mt-1">Frequently ordered treats prepared right now</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularFoods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      </section>

    </div>
  );
}
