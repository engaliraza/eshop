import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import './Orders.css';

const OrderCard = ({ order, onCancelOrder }) => {
  const [cancelling, setCancelling] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    await onCancelOrder(order.id);
    setCancelling(false);
  };

  const canCancelOrder = order.status === 'pending';

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-info">
          <h3 className="order-number">Order #{order.id.slice(-8).toUpperCase()}</h3>
          <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <div className="order-status">
          <span className={`status-badge status-${order.status}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="order-items">
        {order.orderItems.slice(0, 3).map((item) => (
          <div key={item.id} className="order-item">
            <div className="item-image">
              {item.pictureUri ? (
                <img src={item.pictureUri} alt={item.productName} />
              ) : (
                <div className="item-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                </div>
              )}
            </div>
            <div className="item-details">
              <div className="item-name">{item.productName}</div>
              <div className="item-quantity">Qty: {item.quantity}</div>
            </div>
          </div>
        ))}
        {order.orderItems.length > 3 && (
          <div className="more-items">
            +{order.orderItems.length - 3} more items
          </div>
        )}
      </div>

      <div className="order-footer">
        <div className="order-total">
          <span className="total-label">Total: </span>
          <span className="total-amount">{formatPrice(order.total)}</span>
        </div>
        <div className="order-actions">
          <Link to={`/orders/${order.id}`} className="btn btn-outline">
            View Details
          </Link>
          {canCancelOrder && (
            <button
              className="btn btn-danger"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {order.trackingNumber && (
        <div className="tracking-info">
          <span className="tracking-label">Tracking: </span>
          <span className="tracking-number">{order.trackingNumber}</span>
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await axios.get('/api/v1/orders/my-orders', { params });
      setOrders(response.data.data.orders);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`/api/v1/orders/${orderId}/cancel`);
      showSuccess('Order cancelled successfully');
      fetchOrders(); // Refresh orders
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      showError(message);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner message="Loading your orders..." />;
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        {/* Status Filter */}
        <div className="orders-filters">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('')}
            >
              All Orders
            </button>
            <button
              className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${statusFilter === 'processing' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('processing')}
            >
              Processing
            </button>
            <button
              className={`filter-btn ${statusFilter === 'shipped' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('shipped')}
            >
              Shipped
            </button>
            <button
              className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('delivered')}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : orders.length > 0 ? (
          <>
            <div className="orders-list">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancelOrder={handleCancelOrder}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="no-orders">
            <div className="no-orders-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </div>
            <h2>No orders found</h2>
            <p>
              {statusFilter
                ? `You don't have any ${statusFilter} orders.`
                : "You haven't placed any orders yet."
              }
            </p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;