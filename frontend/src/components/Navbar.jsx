import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  User, 
  LogOut, 
  ShieldAlert, 
  Clock, 
  UtensilsCrossed,
  Search,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onNavigate, currentPage, onOpenAuth, onOpenAddress, onOpenProfilePic }) {
  const { user, isAuthenticated, isAdmin, logout, currentAddress } = useAuth();
  const { itemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                  Foodie<span className="text-orange-600">Flow</span>
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase block -mt-1">
                  Fresh & Fast Delivery
                </span>
              </div>
            </button>

            {/* Delivery Location Indicator with Change Address Trigger */}
            <button
              type="button"
              onClick={onOpenAddress}
              title="Click to change delivery address or view live GPS map"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:border-orange-300 border border-slate-200 transition-all cursor-pointer group text-xs text-left"
            >
              <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="w-3 h-3 text-orange-600" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-800 truncate max-w-[160px]">
                  {currentAddress?.street || user?.address?.street || 'Downtown, San Francisco'}
                </span>
                <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100/80 px-1.5 py-0.2 rounded group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  Change
                </span>
              </div>
              <span className="text-slate-500 text-[10px] bg-white px-1.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                20-30 min
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentPage === 'home'
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('restaurants')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentPage === 'restaurants'
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Restaurants
            </button>
            {isAuthenticated && (
              <button
                onClick={() => onNavigate('orders')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentPage === 'orders'
                    ? 'bg-orange-50 text-orange-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                Live Tracking
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentPage === 'admin'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right Action Icons: Cart & Auth */}
          <div className="flex items-center gap-3">
            
            {/* Visual Authentication Status Indicator */}
            {isAuthenticated ? (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs"
                title={`Authenticated as ${user?.name} (${user?.role})`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Authenticated</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-200/70 text-[10px] font-black uppercase tracking-wide text-emerald-950">
                  {user?.role}
                </span>
              </div>
            ) : (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold"
                title="Not Authenticated (Guest User)"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span>Not Authenticated</span>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold transition-all shadow-sm ${
                currentPage === 'cart'
                  ? 'bg-orange-600 text-white shadow-orange-500/30 ring-2 ring-orange-500 ring-offset-2'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Cart</span>
              {itemCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth Button or User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-800 text-sm font-semibold border border-slate-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-500/40 shadow-xs"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Authentication Active
                      </div>
                      
                      {/* Avatar & User Details */}
                      <div className="flex items-center gap-3">
                        <div 
                          className="relative group/avatar cursor-pointer shrink-0" 
                          onClick={() => { setDropdownOpen(false); if (onOpenProfilePic) onOpenProfilePic(); }}
                          title="Click to change profile picture"
                        >
                          <img
                            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                            alt={user?.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-500 shadow-xs"
                          />
                          <div className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <Camera className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                          <button
                            type="button"
                            onClick={() => { setDropdownOpen(false); if (onOpenProfilePic) onOpenProfilePic(); }}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" /> Change Picture
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onOpenProfilePic) onOpenProfilePic();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-orange-600" />
                      Change Profile Picture
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate('orders');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 font-medium"
                    >
                      <Clock className="w-4 h-4 text-slate-500" />
                      Order Tracking
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onOpenAddress) onOpenAddress();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 font-medium"
                    >
                      <MapPin className="w-4 h-4 text-orange-600" />
                      Change Delivery Address & Map
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-all shadow-sm shadow-orange-500/20"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
