import React, { useEffect, useState } from 'react';
import { Navigation, Home, Store, Bike, Clock, CheckCircle2 } from 'lucide-react';

export default function LiveMapTracker({ order }) {
  const [courierProgress, setCourierProgress] = useState(0.2);

  // Determine progress based on status
  useEffect(() => {
    if (!order) return;
    const statusMap = {
      placed: 0.05,
      confirmed: 0.15,
      preparing: 0.35,
      out_for_delivery: 0.72,
      delivered: 1.0,
      cancelled: 0,
    };
    const target = statusMap[order.status] ?? 0.5;
    
    // Smooth animation step
    const timer = setTimeout(() => {
      setCourierProgress(target);
    }, 300);

    return () => clearTimeout(timer);
  }, [order?.status]);

  const originX = 60;
  const originY = 220;
  const destX = 460;
  const destY = 80;

  // Bezier curve control points
  const cp1X = 180;
  const cp1Y = 250;
  const cp2X = 320;
  const cp2Y = 60;

  // Compute courier (x, y) along cubic bezier
  const t = courierProgress;
  const courierX =
    Math.pow(1 - t, 3) * originX +
    3 * Math.pow(1 - t, 2) * t * cp1X +
    3 * (1 - t) * Math.pow(t, 2) * cp2X +
    Math.pow(t, 3) * destX;
  const courierY =
    Math.pow(1 - t, 3) * originY +
    3 * Math.pow(1 - t, 2) * t * cp1Y +
    3 * (1 - t) * Math.pow(t, 2) * cp2Y +
    Math.pow(t, 3) * destY;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Live GPS Satellite Tracking
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span>
            {order?.status === 'delivered'
              ? 'Delivered'
              : `ETA: ${order?.estimatedDeliveryTime || '20-30 min'}`}
          </span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-64 bg-slate-950/60 rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

        <svg viewBox="0 0 520 300" className="w-full h-full relative z-10">
          
          {/* Subtle City Blocks */}
          <rect x="30" y="30" width="70" height="90" rx="8" fill="#1e293b" opacity="0.4" />
          <rect x="120" y="40" width="90" height="60" rx="8" fill="#1e293b" opacity="0.3" />
          <rect x="230" y="140" width="100" height="90" rx="8" fill="#1e293b" opacity="0.4" />
          <rect x="360" y="150" width="110" height="80" rx="8" fill="#1e293b" opacity="0.3" />

          {/* Route Path Shadow */}
          <path
            d={`M ${originX} ${originY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${destX} ${destY}`}
            fill="none"
            stroke="#0f172a"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Glowing Route Path */}
          <path
            d={`M ${originX} ${originY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${destX} ${destY}`}
            fill="none"
            stroke="#ea580c"
            strokeWidth="4"
            strokeDasharray="6 4"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Restaurant Origin Node */}
          <g transform={`translate(${originX}, ${originY})`}>
            <circle r="18" fill="#3b82f6" fillOpacity="0.2" />
            <circle r="12" fill="#2563eb" />
            <circle r="4" fill="#ffffff" />
            <text x="0" y="24" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
              Restaurant
            </text>
          </g>

          {/* Customer Destination Node */}
          <g transform={`translate(${destX}, ${destY})`}>
            <circle r="18" fill="#10b981" fillOpacity="0.2" />
            <circle r="12" fill="#059669" />
            <circle r="4" fill="#ffffff" />
            <text x="0" y="24" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">
              Delivery Address
            </text>
          </g>

          {/* Animated Courier Node */}
          <g transform={`translate(${courierX}, ${courierY})`}>
            {/* Pulsing ring */}
            <circle r="22" fill="#f97316" fillOpacity="0.2" className="animate-ping" />
            <circle r="16" fill="#ea580c" stroke="#ffffff" strokeWidth="2.5" />
            {/* Courier icon placeholder dot */}
            <circle r="4" fill="#ffffff" />
            <text x="0" y="-22" fill="#fdba74" fontSize="11" fontWeight="bold" textAnchor="middle">
              {order?.deliveryPartner?.name || 'Courier Alex'}
            </text>
          </g>
        </svg>

        {/* Floating Courier & Destination Details overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              {order?.deliveryPartner?.name || 'Rider Assigned'}
            </p>
            <p className="text-[10px] text-slate-400">
              {order?.deliveryPartner?.vehicle || 'Electric Scooter'} • ⭐ {order?.deliveryPartner?.rating || '4.9'}
            </p>
          </div>
        </div>

        {/* Destination Address Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 max-w-[200px] truncate">
          <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-200 truncate">
            {order?.deliveryAddress?.street || 'Delivery Destination'}
          </span>
        </div>

      </div>

    </div>
  );
}
