import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useBasket } from '../context/BasketContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';
import WishlistButton from '../components/WishlistButton';
import ProductReviews from '../components/ProductReviews';
import RelatedProducts from '../components/RelatedProducts';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToBasket } = useBasket();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/catalog/items/${id}`);
      setProduct(response.data.data.item);
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        showError('Product not found');
        navigate('/');
      } else {
        showError('Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.availableStock < quantity) {
      showError('Not enough stock available');
      return;
    }

    setIsAddingToCart(true);
    const result = await addToBasket(product.id, quantity);
    
    if (result.success) {
      setQuantity(1);
    }
    
    setIsAddingToCart(false);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.availableStock) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock <= 10 && product.availableStock > 0;

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Home
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="product-details">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              {product.pictureUri ? (
                <img
                  src={product.pictureUri}
                  alt={product.name}
                />
              ) : (
                <div className="image-placeholder">
                  <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <div className="product-brand">{product.catalogBrand?.brand}</div>
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-rating-section">
                <StarRating rating={product.averageRating} showValue />
                <span className="review-count">
                  ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            <div className="product-price-section">
              <div className="product-price">{formatPrice(product.price)}</div>
              
              {/* Stock Status */}
              <div className="stock-status">
                {isOutOfStock ? (
                  <span className="stock-badge out-of-stock">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="stock-badge low-stock">
                    Only {product.availableStock} left in stock
                  </span>
                ) : (
                  <span className="stock-badge in-stock">In Stock</span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="product-specifications">
              <h3>Product Details</h3>
              <ul>
                <li><strong>Category:</strong> {product.catalogType?.type}</li>
                <li><strong>Brand:</strong> {product.catalogBrand?.brand}</li>
                {product.averageRating > 0 && (
                  <li><strong>Rating:</strong> {product.averageRating.toFixed(1)}/5.0</li>
                )}
              </ul>
            </div>

            {/* Add to Cart Section */}
            {!isOutOfStock && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.availableStock}
                      className="quantity-input"
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.availableStock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="btn-spinner"></div>
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>

                  {user && (
                    <WishlistButton productId={product.id} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        <RelatedProducts
          currentProductId={product.id}
          categoryId={product.catalogTypeId}
          brandId={product.catalogBrandId}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
/* Updated: 2025-09-04 16:51:36 */
