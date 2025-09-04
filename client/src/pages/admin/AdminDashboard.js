import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminDashboard.css';

const StatCard = ({ title, value, icon, color, change }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
      {change && (
        <div className={`stat-change ${change.type}`}>
          {change.type === 'increase' ? '↗' : '↘'} {change.value}
        </div>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/v1/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="admin-error">
        <h2>Failed to load dashboard</h2>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const { statistics, recentOrders, lowStockItems } = dashboardData;

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Users"
            value={statistics.totalUsers.toLocaleString()}
            color="blue"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            }
          />
          
          <StatCard
            title="Total Products"
            value={statistics.totalProducts.toLocaleString()}
            color="green"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            }
          />
          
          <StatCard
            title="Total Orders"
            value={statistics.totalOrders.toLocaleString()}
            color="purple"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            }
          />
          
          <StatCard
            title="Total Revenue"
            value={formatPrice(statistics.totalRevenue)}
            color="orange"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/products" className="action-card">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div className="action-content">
                <h3>Manage Products</h3>
                <p>Add, edit, or remove products from your catalog</p>
              </div>
            </Link>

            <Link to="/admin/orders" className="action-card">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </div>
              <div className="action-content">
                <h3>Manage Orders</h3>
                <p>View and update order status and details</p>
              </div>
            </Link>

            <Link to="/admin/users" className="action-card">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="action-content">
                <h3>Manage Users</h3>
                <p>View and manage user accounts and permissions</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Orders */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all-link">View All</Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="recent-orders">
                {recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <div className="order-id">#{order.id.slice(-8).toUpperCase()}</div>
                      <div className="order-customer">
                        {order.user.firstName} {order.user.lastName}
                      </div>
                      <div className="order-date">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge status-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="order-total">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No recent orders</p>
              </div>
            )}
          </div>

          {/* Low Stock Items */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Low Stock Alert</h2>
              <Link to="/admin/products?filter=low-stock" className="view-all-link">View All</Link>
            </div>
            
            {lowStockItems.length > 0 ? (
              <div className="low-stock-items">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="stock-item">
                    <div className="item-image">
                      {item.pictureUri ? (
                        <img src={item.pictureUri} alt={item.name} />
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
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-brand">{item.catalogBrand?.brand}</div>
                    </div>
                    <div className="item-stock">
                      <span className="stock-count">{item.availableStock}</span>
                      <span className="stock-label">in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>All products are well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
/* Updated: 2025-09-04 16:51:36 */
