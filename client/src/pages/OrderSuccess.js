import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    fetchOrder();
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/v1/orders/${orderId}`);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/orders');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Order not found</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        <div className="success-header">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order has been received and is being processed.</p>
        </div>

        <div className="order-details-card">
          <div className="order-header">
            <h2>Order Details</h2>
            <div className="order-number">Order #{order.id.slice(-8).toUpperCase()}</div>
          </div>

          <div className="order-info">
            <div className="order-info-section">
              <h3>Order Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">{formatDate(order.orderDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge status-${order.status}`} >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment Method:</span>
                  <span className="info-value">
                    {order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value total-amount">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="order-info-section">
              <h3>Shipping Address</h3>
              <div className="address">
                <p>{order.shipToAddress_Street}</p>
                <p>
                  {order.shipToAddress_City}, {order.shipToAddress_State} {order.shipToAddress_ZipCode}
                </p>
                <p>{order.shipToAddress_Country}</p>
              </div>
            </div>
          </div>

          <div className="order-items">
            <h3>Order Items</h3>
            <div className="items-list">
              {order.orderItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    {item.pictureUri ? (
                      <img src={item.pictureUri} alt={item.productName} />
                    ) : (
                      <div className="item-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21,15 16,10 5,21"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.productName}</div>
                    <div className="item-quantity">Quantity: {item.quantity}</div>
                  </div>
                  <div className="item-price">
                    {formatPrice(parseFloat(item.unitPrice) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              <div className="step-content">
                <h4>Order Confirmation</h4>
                <p>You'll receive an email confirmation shortly with your order details.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div className="step-content">
                <h4>Processing & Shipping</h4>
                <p>We'll process your order and send you tracking information once it ships.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9,22 9,12 15,12 15,22"></polyline>
                </svg>
              </div>
              <div className="step-content">
                <h4>Delivery</h4>
                <p>Your order will be delivered to the address you provided.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/orders" className="btn btn-outline">
            View All Orders
          </Link>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
/* Updated: 2025-09-04 16:51:36 */
