import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  CreditCard, 
  QrCode, 
  Banknote, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Compass,
  Crosshair,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function CartPage({ onNavigate, onOpenAuth, onOpenAddress }) {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { user, isAuthenticated, currentAddress, updateDeliveryAddress } = useAuth();

  const [address, setAddress] = useState({
    street: currentAddress?.street || user?.address?.street || '452 Elm Street, Apt 3B',
    city: currentAddress?.city || user?.address?.city || 'San Francisco',
    zipCode: currentAddress?.zipCode || user?.address?.zipCode || '94103',
    phone: currentAddress?.phone || user?.phone || '+1 (555) 800-4321',
    tag: currentAddress?.tag || 'Home',
    coordinates: currentAddress?.coordinates || { lat: 37.7749, lng: -122.4194 },
  });

  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState('');

  // Keep in sync with AuthContext's currentAddress
  useEffect(() => {
    if (currentAddress) {
      setAddress((prev) => ({
        ...prev,
        street: currentAddress.street || prev.street,
        city: currentAddress.city || prev.city,
        zipCode: currentAddress.zipCode || prev.zipCode,
        phone: currentAddress.phone || prev.phone,
        tag: currentAddress.tag || prev.tag,
        coordinates: currentAddress.coordinates || prev.coordinates,
      }));
    }
  }, [currentAddress]);

  const handleQuickLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setGeoNotice('Detecting live GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(5);
        const lng = +pos.coords.longitude.toFixed(5);
        const liveAddr = {
          ...address,
          tag: 'Live GPS',
          street: `Live GPS Point (${lat}, ${lng})`,
          city: 'San Francisco',
          coordinates: { lat, lng },
        };
        setAddress(liveAddr);
        updateDeliveryAddress(liveAddr);
        setLocating(false);
        setGeoNotice(`📍 Live GPS Locked: ${lat}° N, ${lng}° W`);
      },
      () => {
        setLocating(false);
        const demoLat = 37.7749;
        const demoLng = -122.4194;
        const demoAddr = {
          ...address,
          tag: 'Live GPS',
          street: 'Market & 4th Street (GPS Demo Pin)',
          city: 'San Francisco',
          coordinates: { lat: demoLat, lng: demoLng },
        };
        setAddress(demoAddr);
        updateDeliveryAddress(demoAddr);
        setGeoNotice('📍 GPS Demo Location Applied (San Francisco)');
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '4242 •••• •••• 4242', exp: '12/28', cvc: '123' });
  const [upiId, setUpiId] = useState('sarah@oksbi');
  const [processing, setProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');

  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = +(subtotal * 0.08).toFixed(2);
  const discount = couponApplied ? +(subtotal * 0.2).toFixed(2) : 0;
  const grandTotal = +(subtotal + deliveryFee + tax - discount).toFixed(2);

  const applyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'FOODIE20') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try FOODIE20');
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }

    setProcessing(true);
    setOrderError('');

    try {
      // 1. Create order
      const orderRes = await api.post('/orders', {
        deliveryAddress: address,
        paymentMethod,
      });

      const createdOrder = orderRes.data?.data;

      // 2. Process simulated payment
      if (paymentMethod !== 'cod') {
        await api.post('/payments', {
          orderId: createdOrder._id,
          paymentMethod,
          cardDetails: paymentMethod === 'card' ? cardDetails : null,
          upiId: paymentMethod === 'upi' ? upiId : null,
        });
      }

      // 3. Clear local cart & navigate to tracking
      clearCart();
      onNavigate('orders', { newOrderId: createdOrder._id });
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderError(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Looks like you haven't added anything to your cart yet. Explore our top restaurants!
        </p>
        <button
          onClick={() => onNavigate('restaurants')}
          className="mt-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all inline-flex items-center gap-2"
        >
          <span>Find Delicious Food</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Shopping Cart</h1>
        <p className="text-xs text-slate-500 mt-1">Review your meal, delivery address, and proceed to checkout</p>
      </div>

      {orderError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Cart Items & Address */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Items Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Order Items ({cart.items.length})</h2>
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.items.map((item) => {
                const food = item.food || {};
                const foodId = food._id || item._id;
                return (
                  <div key={item._id || foodId} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {food.image && (
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-slate-100"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{food.name || 'Delicious Dish'}</h4>
                        <span className="text-xs text-slate-500 font-medium">
                          ${(item.price || food.price || 0).toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(foodId, (item.quantity || 1) - 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(foodId, (item.quantity || 1) + 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <span className="font-black text-sm text-slate-900 w-16 text-right">
                        ${((item.price || food.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(foodId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Live Location Map Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Delivery Destination</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black uppercase tracking-wider">
                      {address.tag || 'Home'}
                    </span>
                    <span className="text-slate-400 text-xs">• 20-30 min express delivery</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Change Address & Live GPS */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickLiveLocation}
                  disabled={locating}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Detect current device GPS coordinates"
                >
                  <Navigation className={`w-3.5 h-3.5 text-orange-600 ${locating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{locating ? 'Locating...' : 'Use Live GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAddress}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Change address or pinpoint on map"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Change on Map</span>
                </button>
              </div>
            </div>

            {/* Live GPS Notice */}
            {geoNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{geoNotice}</span>
              </div>
            )}

            {/* Interactive Mini Map Preview */}
            <div 
              onClick={onOpenAddress}
              className="relative w-full h-32 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 cursor-pointer group shadow-inner"
              title="Click to open interactive full-screen map picker"
            >
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

              {/* Route connecting restaurant to user delivery location */}
              <svg viewBox="0 0 400 120" className="w-full h-full relative z-10 pointer-events-none">
                <path
                  d="M 50 80 Q 200 20 350 45"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                  strokeDasharray="5 3"
                  className="animate-pulse"
                />
                {/* Restaurant marker */}
                <circle cx="50" cy="80" r="8" fill="#3b82f6" />
                <circle cx="50" cy="80" r="3" fill="#ffffff" />
                <text x="50" y="105" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Kitchen Hub
                </text>

                {/* Destination pin */}
                <circle cx="350" cy="45" r="14" fill="#f97316" fillOpacity="0.3" className="animate-ping" />
                <circle cx="350" cy="45" r="9" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
                <circle cx="350" cy="45" r="3" fill="#ffffff" />
                <text x="350" y="70" fill="#fdba74" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Your Pin
                </text>
              </svg>

              {/* Click overlay prompt */}
              <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-bold border border-slate-700 backdrop-blur-md flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                  <Compass className="w-3.5 h-3.5 text-orange-400" />
                  Click to adjust pin on full live map
                </span>
              </div>

              {/* Coordinates badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-[10px] font-mono text-slate-300 border border-slate-800 pointer-events-none">
                Lat: {address.coordinates?.lat || 37.7749}° | Lng: {address.coordinates?.lng || -122.4194}°
              </div>
            </div>

            {/* Editable Address Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => {
                    const newAddr = { ...address, street: e.target.value };
                    setAddress(newAddr);
                    updateDeliveryAddress(newAddr);
                  }}
                  placeholder="Street Address, Apt"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City & Postal</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => {
                    const newAddr = { ...address, city: e.target.value };
                    setAddress(newAddr);
                    updateDeliveryAddress(newAddr);
                  }}
                  placeholder="San Francisco, 94103"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone for Delivery Rider</label>
                <input
                  type="text"
                  value={address.phone}
                  onChange={(e) => {
                    const newAddr = { ...address, phone: e.target.value };
                    setAddress(newAddr);
                    updateDeliveryAddress(newAddr);
                  }}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-800">Card (Debit/Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <QrCode className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-800">UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-800">Cash On Delivery</span>
              </button>
            </div>

            {/* Extra details input based on payment method */}
            {paymentMethod === 'card' && (
              <div className="pt-2 grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Exp & CVC</label>
                  <input
                    type="text"
                    value={`${cardDetails.exp} | ${cardDetails.cvc}`}
                    onChange={(e) => {}}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Bill Summary & Checkout */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Coupon Code Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600" />
              Apply Promo Voucher
            </h3>
            <form onSubmit={applyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter FOODIE20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={couponApplied}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  couponApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {couponApplied ? 'Applied!' : 'Apply'}
              </button>
            </form>
            {couponApplied && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                20% discount applied to your order!
              </p>
            )}
            {couponError && (
              <p className="text-xs text-rose-600 font-medium">{couponError}</p>
            )}
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Bill Summary</h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className="font-bold text-slate-900">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Government Taxes (8%)</span>
                <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Voucher (20%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>To Pay</span>
                <span className="text-orange-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Place Order • ${grandTotal.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
