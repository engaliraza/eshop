import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './WishlistButton.css';

const WishlistButton = ({ productId }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Check if item is in wishlist
  useEffect(() => {
    if (user && productId) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await axios.get(`/api/v1/wishlist/check/${productId}`);
      setIsInWishlist(response.data.data.inWishlist);
      setWishlistItemId(response.data.data.wishlistItemId);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showError('Please log in to add items to your wishlist');
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`/api/v1/wishlist/${wishlistItemId}`);
        setIsInWishlist(false);
        setWishlistItemId(null);
        showSuccess('Removed from wishlist');
      } else {
        // Add to wishlist
        const response = await axios.post('/api/v1/wishlist', {
          catalogItemId: productId
        });
        setIsInWishlist(true);
        setWishlistItemId(response.data.data.item.id);
        showSuccess('Added to wishlist');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update wishlist';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <button
      className={`wishlist-button ${isInWishlist ? 'in-wishlist' : ''}`}
      onClick={handleWishlistToggle}
      disabled={loading}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <div className="wishlist-spinner"></div>
      ) : (
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill={isInWishlist ? "currentColor" : "none"} 
          stroke="currentColor"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      )}
    </button>
  );
};

export default WishlistButton;
