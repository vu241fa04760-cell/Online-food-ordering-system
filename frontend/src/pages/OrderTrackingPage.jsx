import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Bike, 
  Home, 
  Phone, 
  AlertCircle, 
  XCircle, 
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import LiveMapTracker from '../components/LiveMapTracker';

export default function OrderTrackingPage({ activeOrderId, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const allOrders = res.data?.data || [];
      setOrders(allOrders);

      if (allOrders.length > 0) {
        if (activeOrderId) {
          const found = allOrders.find((o) => o._id === activeOrderId);
          setSelectedOrder(found || allOrders[0]);
        } else if (!selectedOrder) {
          setSelectedOrder(allOrders[0]);
        } else {
          const updated = allOrders.find((o) => o._id === selectedOrder._id);
          setSelectedOrder(updated || allOrders[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // Polling for real-time status updates
    return () => clearInterval(interval);
  }, [activeOrderId]);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    setActionMessage('');
    try {
      const res = await api.put(`/orders/${selectedOrder._id}/cancel`);
      setSelectedOrder(res.data?.data);
      setActionMessage('Order successfully cancelled.');
      fetchOrders();
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  // Demo helper: allows user to simulate live status advancement
  const handleAdvanceStatus = async () => {
    if (!selectedOrder) return;
    const stages = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIdx = stages.indexOf(selectedOrder.status);
    if (currentIdx === -1 || currentIdx >= stages.length - 1) return;

    const nextStatus = stages[currentIdx + 1];
    try {
      // Simulate admin status update
      await api.put(`/admin/orders/${selectedOrder._id}`, { status: nextStatus });
      fetchOrders();
    } catch (err) {
      // If user isn't admin, explain
      console.log('Advance status response:', err.message);
      fetchOrders();
    }
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', icon: Clock, desc: 'Sent to kitchen' },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, desc: 'Restaurant accepted' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Chef is cooking' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, desc: 'Rider is on the way' },
    { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Enjoy your delicious meal!' },
  ];

  const getStepIndex = (status) => {
    return steps.findIndex((s) => s.key === status);
  };

  const currentStepIdx = selectedOrder ? getStepIndex(selectedOrder.status) : 0;
  const isCancelled = selectedOrder?.status === 'cancelled';

  if (loading && orders.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Fetching order status & live coordinates...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">No Active Orders</h2>
        <p className="text-xs text-slate-500">
          You haven't placed any orders yet. Treat yourself to delicious flavors today!
        </p>
        <button
          onClick={() => onNavigate('restaurants')}
          className="mt-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          <span>Explore Restaurants</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Order Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status updates and satellite rider telemetry</p>
        </div>

        {/* Demo Advance Simulation Control */}
        {!isCancelled && selectedOrder?.status !== 'delivered' && (
          <button
            onClick={handleAdvanceStatus}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
            title="Fast forward status for demonstration"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Next Stage</span>
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* Main Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Tracking Progression & Map */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Status Timeline Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Order ID #{selectedOrder._id.slice(-6).toUpperCase()}
                </span>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedOrder.restaurant?.name || 'Restaurant Partner'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isCancelled
                      ? 'bg-rose-100 text-rose-700'
                      : selectedOrder.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-orange-100 text-orange-700 animate-pulse'
                  }`}
                >
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Cancelled Banner if cancelled */}
            {isCancelled ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">This order has been cancelled</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Any debited amount has been queued for immediate refund to your original payment method.
                  </p>
                </div>
              </div>
            ) : (
              /* Linear Step Timeline */
              <div className="relative pt-4">
                <div className="grid grid-cols-5 gap-2 text-center relative z-10">
                  {steps.map((step, idx) => {
                    const isDone = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                            isDone
                              ? 'bg-orange-600 text-white shadow-orange-500/20'
                              : 'bg-slate-100 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-orange-200 scale-110' : ''}`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <span
                          className={`mt-2 text-xs font-bold ${
                            isDone ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5 max-w-[80px]">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Connecting background bar */}
                <div className="absolute top-9 left-[10%] right-[10%] h-1 bg-slate-100 -z-0">
                  <div
                    className="h-full bg-orange-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (currentStepIdx / (steps.length - 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Live Map Satellite Tracker */}
            <LiveMapTracker order={selectedOrder} />

            {/* Courier Details & Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  AM
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedOrder.deliveryPartner?.name || 'Alex Morgan'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedOrder.deliveryPartner?.vehicle || 'Electric Scooter'} • ⭐ 4.9
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedOrder.deliveryPartner?.phone || '5552345678'}`}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>

                {!isCancelled && ['placed', 'confirmed'].includes(selectedOrder.status) && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Order Bill Receipt & Order Switcher */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Order Summary Receipt */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Order Receipt
            </h3>

            <div className="divide-y divide-slate-100">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-slate-500">{item.quantity}x</span>
                    <span className="text-slate-800 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${selectedOrder.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${selectedOrder.tax?.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Total Paid</span>
                <span className="text-orange-600">${selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p>
                <strong className="text-slate-700">Delivery to:</strong>{' '}
                {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}
              </p>
              <p>
                <strong className="text-slate-700">Payment:</strong>{' '}
                {selectedOrder.paymentMethod?.toUpperCase()} (
                <span className={selectedOrder.paymentStatus === 'completed' ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  {selectedOrder.paymentStatus}
                </span>
                )
              </p>
            </div>
          </div>

          {/* Past Orders Switcher Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Order History ({orders.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {orders.map((ord) => (
                <div
                  key={ord._id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedOrder._id === ord._id
                      ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>{ord.restaurant?.name || 'Order'}</span>
                    <span className="text-orange-600">${ord.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                    <span className="uppercase font-semibold tracking-wider">{ord.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
