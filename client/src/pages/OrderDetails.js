import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/v1/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return <h2>Order not found</h2>;
  }

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <Link to="/orders" className="back-link">← Back to Orders</Link>
        <h1>Order Details</h1>
        {/* ... content for order details ... */}
      </div>
    </div>
  );
};

export default OrderDetails;
