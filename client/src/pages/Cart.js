import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Cart.css';

const CartItem = ({ item, onUpdateQuantity, onRemove, loading }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item.catalogItem.availableStock) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const itemTotal = parseFloat(item.unitPrice) * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.catalogItem.pictureUri ? (
          <img src={item.catalogItem.pictureUri} alt={item.catalogItem.name} />
        ) : (
          <div className="cart-item-placeholder">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
          </div>
        )}
      </div>

      <div className="cart-item-details">
        <Link to={`/product/${item.catalogItem.id}`} className="cart-item-name">
          {item.catalogItem.name}
        </Link>
        <div className="cart-item-price">{formatPrice(item.unitPrice)}</div>
        
        {item.catalogItem.availableStock <= 10 && (
          <div className="stock-warning">
            Only {item.catalogItem.availableStock} left in stock
          </div>
        )}
      </div>

      <div className="cart-item-quantity">
        <div className="quantity-controls">
          <button
            className="quantity-btn"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || loading}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              setQuantity(newQuantity);
            }}
            onBlur={() => onUpdateQuantity(item.id, quantity)}
            min="1"
            max={item.catalogItem.availableStock}
            className="quantity-input"
            disabled={loading}
          />
          <button
            className="quantity-btn"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= item.catalogItem.availableStock || loading}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        {formatPrice(itemTotal)}
      </div>

      <div className="cart-item-actions">
        <button
          className="remove-btn"
          onClick={() => onRemove(item.id)}
          disabled={loading}
          aria-label="Remove item"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { basket, updateBasketItem, removeFromBasket, clearBasket, loading } = useBasket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);

  const handleUpdateQuantity = async (itemId, quantity) => {
    await updateBasketItem(itemId, quantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromBasket(itemId);
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    await clearBasket();
    setIsClearing(false);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading && basket.items.length === 0) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {basket.items.length > 0 && (
            <button
              className="clear-cart-btn"
              onClick={handleClearCart}
              disabled={isClearing}
            >
              {isClearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          )}
        </div>

        {basket.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <div className="cart-items-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
                <span></span>
              </div>

              {basket.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  loading={loading}
                />
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-content">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Items ({basket.totalItems}):</span>
                  <span>{formatPrice(basket.totalPrice)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>
                    {parseFloat(basket.totalPrice) >= 100 ? 'FREE' : formatPrice(10)}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Tax (8%):</span>
                  <span>{formatPrice(parseFloat(basket.totalPrice) * 0.08)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total:</span>
                  <span>
                    {formatPrice(
                      parseFloat(basket.totalPrice) + 
                      (parseFloat(basket.totalPrice) >= 100 ? 0 : 10) + 
                      (parseFloat(basket.totalPrice) * 0.08)
                    )}
                  </span>
                </div>

                {parseFloat(basket.totalPrice) < 100 && (
                  <div className="free-shipping-notice">
                    Add {formatPrice(100 - parseFloat(basket.totalPrice))} more for free shipping
                  </div>
                )}

                <button
                  className="btn btn-primary checkout-btn"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>

                <Link to="/" className="continue-shopping-link">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;