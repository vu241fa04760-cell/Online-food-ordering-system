import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Zap, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-20 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Superfast 30-Min Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Real-time GPS tracking from kitchen to your door.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">100% Hygienic Packaging</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tamper-proof safety seals on every order.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Top Rated Gourmet Kitchens</h4>
              <p className="text-xs text-slate-400 mt-0.5">Handpicked premium culinary partners.</p>
            </div>
          </div>
        </div>

        {/* Links & Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Foodie<span className="text-orange-500">Flow</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Bringing your neighborhood's most celebrated flavors right to your doorstep.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>for food lovers.</span>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Popular Cuisines</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Italian & Artisanal Pizzas</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Royal Dum Biryanis</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Japanese Sushi & Ramen</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Gourmet Smashed Burgers</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Organic Acai & Bowls</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Browse Restaurants</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Live Order Tracker</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Payment Methods</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Partner With Us</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Admin Dashboard</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Accepted Payments</h5>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">VISA / MC</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">UPI / QR</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">Apple Pay</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">COD</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              © {new Date().getFullYear()} FoodieFlow Inc. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
