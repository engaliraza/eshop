import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Checkout.css';

const Checkout = () => {
  const { basket, fetchBasket } = useBasket();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipToAddress_Street: '',
    shipToAddress_City: '',
    shipToAddress_State: '',
    shipToAddress_Country: 'United States',
    shipToAddress_ZipCode: '',
    paymentMethod: 'credit_card',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (basket.items.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, basket.items.length, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shipToAddress_Street.trim()) {
      newErrors.shipToAddress_Street = 'Street address is required';
    }

    if (!formData.shipToAddress_City.trim()) {
      newErrors.shipToAddress_City = 'City is required';
    }

    if (!formData.shipToAddress_State.trim()) {
      newErrors.shipToAddress_State = 'State is required';
    }

    if (!formData.shipToAddress_ZipCode.trim()) {
      newErrors.shipToAddress_ZipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.shipToAddress_ZipCode)) {
      newErrors.shipToAddress_ZipCode = 'Invalid ZIP code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/v1/orders', formData);
      
      showSuccess('Order placed successfully!');
      
      // Refresh basket to clear it
      await fetchBasket();
      
      // Navigate to order success page
      navigate('/order-success', { 
        state: { orderId: response.data.data.order.id }
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const subtotal = parseFloat(basket.totalPrice);
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!user || basket.items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Shipping Address */}
              <div className="form-section">
                <h2>Shipping Address</h2>
                
                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    name="shipToAddress_Street"
                    value={formData.shipToAddress_Street}
                    onChange={handleInputChange}
                    className={errors.shipToAddress_Street ? 'error' : ''}
                    placeholder="123 Main Street"
                  />
                  {errors.shipToAddress_Street && (
                    <span className="error-message">{errors.shipToAddress_Street}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="shipToAddress_City"
                      value={formData.shipToAddress_City}
                      onChange={handleInputChange}
                      className={errors.shipToAddress_City ? 'error' : ''}
                      placeholder="New York"
                    />
                    {errors.shipToAddress_City && (
                      <span className="error-message">{errors.shipToAddress_City}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="shipToAddress_State"
                      value={formData.shipToAddress_State}
                      onChange={handleInputChange}
                      className={errors.shipToAddress_State ? 'error' : ''}
                      placeholder="NY"
                    />
                    {errors.shipToAddress_State && (
                      <span className="error-message">{errors.shipToAddress_State}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="shipToAddress_ZipCode"
                      value={formData.shipToAddress_ZipCode}
                      onChange={handleInputChange}
                      className={errors.shipToAddress_ZipCode ? 'error' : ''}
                      placeholder="12345"
                    />
                    {errors.shipToAddress_ZipCode && (
                      <span className="error-message">{errors.shipToAddress_ZipCode}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      name="shipToAddress_Country"
                      value={formData.shipToAddress_Country}
                      onChange={handleInputChange}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h2>Payment Method</h2>
                
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-method-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                      Credit Card
                    </span>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit_card"
                      checked={formData.paymentMethod === 'debit_card'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-method-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                      Debit Card
                    </span>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-method-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                      </svg>
                      PayPal
                    </span>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-method-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      Cash on Delivery
                    </span>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="form-section">
                <h2>Order Notes (Optional)</h2>
                <div className="form-group">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for your order..."
                    rows="3"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary place-order-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ${formatPrice(total)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {basket.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-image">
                    {item.catalogItem.pictureUri ? (
                      <img src={item.catalogItem.pictureUri} alt={item.catalogItem.name} />
                    ) : (
                      <div className="order-item-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21,15 16,10 5,21"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="order-item-details">
                    <div className="order-item-name">{item.catalogItem.name}</div>
                    <div className="order-item-quantity">Qty: {item.quantity}</div>
                  </div>
                  <div className="order-item-price">
                    {formatPrice(parseFloat(item.unitPrice) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;