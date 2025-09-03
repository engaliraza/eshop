import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { useAuth } from '../context/AuthContext';
import WishlistButton from './WishlistButton';
import StarRating from './common/StarRating';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToBasket } = useBasket();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.availableStock <= 0) return;
    
    setIsAddingToCart(true);
    await addToBasket(product.id, 1);
    setIsAddingToCart(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const isOutOfStock = product.availableStock <= 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <Link to={`/product/${product.id}`} className="product-card-link">
        {/* Product Image */}
        <div className="product-image">
          {product.pictureUri ? (
            <img 
              src={product.pictureUri} 
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="product-image-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21,15 16,10 5,21"></polyline>
              </svg>
            </div>
          )}  
          
          {/* Stock Status Badge */}
          {isOutOfStock && (
            <div className="stock-badge out-of-stock-badge">
              Out of Stock
            </div>
          )}
          
          {product.availableStock <= 10 && product.availableStock > 0 && (
            <div className="stock-badge low-stock-badge">
              Only {product.availableStock} left
            </div>
          )}

          {/* Wishlist Button */}
          {user && (
            <div className="wishlist-button-container">
              <WishlistButton productId={product.id} />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-brand">
            {product.catalogBrand?.brand}
          </div>
          
          <h3 className="product-name">{product.name}</h3>
          
          <div className="product-rating">
            <StarRating rating={product.averageRating} />
            <span className="rating-count">({product.reviewCount})</span>
          </div>
          
          <div className="product-price">
            {formatPrice(product.price)}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="product-actions">
        <button
          className={`btn btn-primary add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={isAddingToCart || isOutOfStock}
        >
          {isAddingToCart ? (
            <>
              <div className="btn-spinner"></div>
              Adding...
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;