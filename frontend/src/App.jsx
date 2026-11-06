import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ChangeAddressModal from './components/ChangeAddressModal';
import ProfilePictureModal from './components/ProfilePictureModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

import HomePage from './pages/HomePage';
import RestaurantListPage from './pages/RestaurantListPage';
import FoodMenuPage from './pages/FoodMenuPage';
import CartPage from './pages/CartPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [restaurantFilters, setRestaurantFilters] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [profilePicModalOpen, setProfilePicModalOpen] = useState(false);
  const { isAdmin, authNotice, dismissAuthNotice } = useAuth();

  const handleNavigate = (page, params = {}) => {
    if (params.search || params.cuisine) {
      setRestaurantFilters(params);
    }
    if (params.newOrderId) {
      setActiveOrderId(params.newOrderId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentPage('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      
      {/* Global Authentication Toast Notification */}
      {authNotice && (
        <div 
          role="alert"
          aria-live="assertive"
          className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-96 shadow-2xl rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          style={{
            backgroundColor: 
              authNotice.type === 'success' ? '#f0fdf4' : 
              authNotice.type === 'error' ? '#fff1f2' : '#f8fafc',
            borderColor: 
              authNotice.type === 'success' ? '#86efac' : 
              authNotice.type === 'error' ? '#fda4af' : '#cbd5e1',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {authNotice.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {authNotice.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {authNotice.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  authNotice.type === 'success' ? 'bg-emerald-200/80 text-emerald-900' :
                  authNotice.type === 'error' ? 'bg-rose-200/80 text-rose-900' : 'bg-slate-200 text-slate-800'
                }`}>
                  {authNotice.type === 'success' ? 'AUTHENTICATION SUCCESSFUL' :
                   authNotice.type === 'error' ? 'AUTHENTICATION FAILED (UNSUCCESSFUL)' : 'AUTH STATUS'}
                </span>
              </div>
              <h4 className={`text-sm font-bold mt-1 ${
                authNotice.type === 'success' ? 'text-emerald-950' :
                authNotice.type === 'error' ? 'text-rose-950' : 'text-slate-900'
              }`}>
                {authNotice.title}
              </h4>
              <p className={`text-xs mt-0.5 font-medium ${
                authNotice.type === 'success' ? 'text-emerald-800' :
                authNotice.type === 'error' ? 'text-rose-800' : 'text-slate-600'
              }`}>
                {authNotice.message}
              </p>
            </div>

            <button
              onClick={dismissAuthNotice}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAddress={() => setAddressModalOpen(true)}
        onOpenProfilePic={() => setProfilePicModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <HomePage
            onSelectRestaurant={handleSelectRestaurant}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'restaurants' && (
          <RestaurantListPage
            initialFilters={restaurantFilters}
            onSelectRestaurant={handleSelectRestaurant}
          />
        )}

        {currentPage === 'menu' && (
          <FoodMenuPage
            restaurantId={selectedRestaurantId}
            onBack={() => handleNavigate('restaurants')}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            onNavigate={handleNavigate}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenAddress={() => setAddressModalOpen(true)}
          />
        )}

        {currentPage === 'orders' && (
          <OrderTrackingPage
            activeOrderId={activeOrderId}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'admin' && (
          isAdmin ? (
            <AdminDashboardPage />
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Admin Privileges Required</h2>
              <p className="text-xs text-slate-500">
                Please log in with the administrator account to access restaurant management and order dispatching.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
              >
                Log In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Change Address & Live Map Modal */}
      <ChangeAddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={profilePicModalOpen}
        onClose={() => setProfilePicModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
