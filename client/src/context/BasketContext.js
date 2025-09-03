import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export const BasketContext = createContext();

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
};

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState({
    id: null,
    items: [],
    totalItems: 0,
    totalPrice: '0.00'
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Generate session ID for anonymous users
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }, []);

  // Set session ID header for requests
  useEffect(() => {
    if (!user) {
      axios.defaults.headers.common['X-Session-ID'] = getSessionId();
    } else {
      delete axios.defaults.headers.common['X-Session-ID'];
    }
  }, [user, getSessionId]);

  const fetchBasket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/basket');
      setBasket(response.data.data.basket);
    } catch (error) {
      console.error('Error fetching basket:', error);
      setBasket({
        id: null,
        items: [],
        totalItems: 0,
        totalPrice: '0.00'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addToBasket = async (catalogItemId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/v1/basket/items', {
        catalogItemId,
        quantity
      });
      
      setBasket(response.data.data.basket);
      showSuccess('Item added to cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateBasketItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/v1/basket/items/${itemId}`, {
        quantity
      });
      
      setBasket(response.data.data.basket);
      showSuccess('Cart updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromBasket = async (itemId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/v1/basket/items/${itemId}`);
      
      setBasket(response.data.data.basket);
      showSuccess('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearBasket = async () => {
    try {
      setLoading(true);
      const response = await axios.delete('/api/v1/basket');
      
      setBasket(response.data.data.basket);
      showSuccess('Cart cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const transferBasket = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId || !user) return;

    try {
      await axios.post('/api/v1/basket/transfer', { sessionId });
      localStorage.removeItem('sessionId');
      await fetchBasket();
    } catch (error) {
      console.error('Error transferring basket:', error);
    }
  };

  // Transfer anonymous basket when user logs in
  useEffect(() => {
    if (user) {
      transferBasket();
    }
  }, [user]);

  // Fetch basket on mount and when user changes
  useEffect(() => {
    fetchBasket();
  }, [fetchBasket]);

  const value = {
    basket,
    loading,
    addToBasket,
    updateBasketItem,
    removeFromBasket,
    clearBasket,
    fetchBasket
  };

  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
};