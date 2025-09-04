import React from 'react';
import { useBasket } from '../context/BasketContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = ({ isOpen, onClose, onCheckout }) => {
  const { basket, loading, error, updateItemQuantity, removeItem } = useBasket();
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const calculateTotal = () => {
    if (!basket || !basket.items) return 0;
    return basket.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with checkout');
      return;
    }
    onCheckout();
  };

  return (
    <div className="cart-modal">
      <div className="cart-modal-content">
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-body">
          {loading && <div className="loading">Loading cart...</div>}
          {error && <div className="error-message">{error}</div>}
          
          {basket && basket.items && basket.items.length > 0 ? (
            <>
              <div className="cart-items">
                {basket.items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={/images/products/} 
                        alt={item.catalogItem.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                    </div>
                    
                    <div className="item-details">
                      <h4>{item.catalogItem.name}</h4>
                      <p className="item-price"></p>
                    </div>
                    
                    <div className="item-quantity">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      ???
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total: </strong>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button onClick={onClose}>Continue Shopping</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

/* Updated: 2025-09-04 16:51:36 */
