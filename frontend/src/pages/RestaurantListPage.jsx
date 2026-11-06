import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Bike, Filter, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';

export default function RestaurantListPage({ onSelectRestaurant, initialFilters }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [selectedCuisine, setSelectedCuisine] = useState(initialFilters?.cuisine || '');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const cuisinesList = ['All', 'Italian', 'Indian', 'Japanese', 'American', 'Mexican', 'Healthy'];

  useEffect(() => {
    fetchRestaurants();
  }, [search, selectedCuisine, minRating, sortBy]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCuisine && selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (minRating) params.rating = minRating;
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/restaurants', { params });
      setRestaurants(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Filters Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Browse Restaurants</h1>
        <p className="text-sm text-slate-500 mt-1">Discover the finest culinary spots delivered straight to you</p>
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search restaurants or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Min Rating Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.7">4.7+ Stars</option>
              <option value="4.8">4.8+ Stars</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="deliveryFee">Lowest Delivery Fee</option>
            </select>
          </div>

        </div>

      </div>

      {/* Cuisine Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {cuisinesList.map((cuisine) => {
          const isSelected = (!selectedCuisine && cuisine === 'All') || selectedCuisine === cuisine;
          return (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine === 'All' ? '' : cuisine)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cuisine}
            </button>
          );
        })}
      </div>

      {/* Restaurants Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">Finding delicious spots near you...</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
          <p className="text-base font-bold text-slate-800">No restaurants match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search or selecting a different cuisine.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCuisine('');
              setMinRating('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
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
      )}

    </div>
  );
}
