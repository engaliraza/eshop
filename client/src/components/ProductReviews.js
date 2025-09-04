import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import StarRating from './common/StarRating';
import Pagination from './common/Pagination';
import './ProductReviews.css';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!comment.trim()) newErrors.comment = 'Comment is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/v1/reviews', {
        catalogItemId: productId,
        rating,
        title,
        comment
      });
      
      showSuccess('Review submitted successfully!');
      onReviewSubmitted();
      setRating(0);
      setTitle('');
      setComment('');
      setErrors({});
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Write a Review</h3>
      
      <div className="form-group">
        <label>Your Rating *</label>
        <div className="star-rating-input">
          {[1, 2, 3, 4, 5].map(star => (
            <svg
              key={star}
              className={`star ${rating >= star ? 'selected' : ''}`}
              onClick={() => setRating(star)}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>
          ))}
        </div>
        {errors.rating && <span className="error-message">{errors.rating}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="title">Review Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="comment">Your Review *</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          className={errors.comment ? 'error' : ''}
        />
        {errors.comment && <span className="error-message">{errors.comment}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const { showError } = useNotification();

  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/reviews/products/${productId}`, {
        params: {
          page: currentPage,
          limit: 5
        }
      });
      
      setReviews(response.data.data.reviews);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setCurrentPage(1);
    fetchReviews();
  };

  return (
    <div className="product-reviews">
      <h2>Customer Reviews</h2>
      
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <>
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-author">
                    {review.user.firstName} {review.user.lastName.charAt(0)}.
                  </div>
                  <div className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="review-rating">
                  <StarRating rating={review.rating} />
                </div>
                <h4 className="review-title">{review.title}</h4>
                <p className="review-comment">{review.comment}</p>
                {review.isVerifiedPurchase && (
                  <div className="verified-purchase">
                    Verified Purchase
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <p>No reviews yet. Be the first to review this product!</p>
      )}

      {user && (
        <div className="review-form-container">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}
    </div>
  );
};

export default ProductReviews;

/* Updated: 2025-09-04 16:51:36 */
