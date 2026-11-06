import React from 'react';
import { Plus, Minus, Star, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodCard({ food, onSelect }) {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = (cart.items || []).find((it) => {
    const id = it.food?._id || it.food;
    return id === food._id;
  });

  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Image Section */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Diet Badge (Veg / Non-Veg) */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              food.isVeg ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
            }`}
          />
          <span className={food.isVeg ? 'text-emerald-700' : 'text-rose-700'}>
            {food.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Rating & Calories */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="bg-slate-900/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{food.rating || 4.8}</span>
          </div>
        </div>

        {food.calories && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
            <span>{food.calories} kcal</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              {food.category}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
            {food.name}
          </h3>

          <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Bottom Price & Add Control */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Price</span>
            <span className="text-xl font-black text-slate-900">
              ${food.price.toFixed(2)}
            </span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-orange-600 text-white rounded-2xl p-1 shadow-md shadow-orange-500/20">
              <button
                onClick={() => updateQuantity(food._id, quantity - 1)}
                className="w-8 h-8 rounded-xl bg-orange-700 hover:bg-orange-800 flex items-center justify-center font-bold text-white transition-colors"
                title="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-black">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(food._id, quantity + 1)}
                className="w-8 h-8 rounded-xl bg-orange-700 hover:bg-orange-800 flex items-center justify-center font-bold text-white transition-colors"
                title="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food, 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:shadow-orange-500/20 group/btn"
            >
              <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
              <span>Add</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
