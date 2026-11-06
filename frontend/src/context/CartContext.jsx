import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('foodie_cart');
    return saved ? JSON.parse(saved) : { items: [], restaurant: null };
  });
  const [loading, setLoading] = useState(false);

  // Sync cart with backend when authenticated
  const fetchBackendCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data?.data) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch backend cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendCart();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('foodie_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (food, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart/items', {
          foodId: food._id,
          quantity,
        });
        setCart(res.data.data);
        return;
      } catch (err) {
        console.warn('Backend cart add failed, updating locally:', err.message);
      }
    }

    // Local fallback for guest users
    setCart((prev) => {
      const items = [...(prev.items || [])];
      const existingIdx = items.findIndex((it) => {
        const id = it.food?._id || it.food;
        return id === food._id;
      });

      if (existingIdx > -1) {
        items[existingIdx].quantity += quantity;
      } else {
        items.push({
          _id: 'local_' + Date.now(),
          food: food,
          price: food.price,
          quantity,
        });
      }

      return {
        ...prev,
        restaurant: food.restaurant?._id || food.restaurant,
        items,
      };
    });
  };

  const updateQuantity = async (foodId, newQty) => {
    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/items/${foodId}`, { quantity: newQty });
        setCart(res.data.data);
        return;
      } catch (err) {
        console.warn('Backend cart update failed, updating locally:', err.message);
      }
    }

    setCart((prev) => {
      let items = [...(prev.items || [])];
      const idx = items.findIndex((it) => {
        const id = it.food?._id || it.food;
        return id === foodId || it._id === foodId;
      });

      if (idx > -1) {
        if (newQty <= 0) {
          items.splice(idx, 1);
        } else {
          items[idx].quantity = newQty;
        }
      }

      return {
        ...prev,
        restaurant: items.length > 0 ? prev.restaurant : null,
        items,
      };
    });
  };

  const removeFromCart = async (foodId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/items/${foodId}`);
        setCart(res.data.data);
        return;
      } catch (err) {
        console.warn('Backend cart item delete failed, updating locally:', err.message);
      }
    }

    setCart((prev) => ({
      ...prev,
      items: (prev.items || []).filter((it) => {
        const id = it.food?._id || it.food;
        return id !== foodId && it._id !== foodId;
      }),
    }));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart/items/clear');
      } catch (err) {
        console.warn('Backend cart clear failed:', err.message);
      }
    }
    setCart({ items: [], restaurant: null });
  };

  const itemCount = (cart.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
  const subtotal = +(cart.items || []).reduce(
    (acc, it) => acc + (it.price || it.food?.price || 0) * (it.quantity || 1),
    0
  ).toFixed(2);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
