import React from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, maxRating = 5, size = 'small', showValue = false }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 1; i <= maxRating; i++) {
    if (i <= fullStars) {
      // Full star
      stars.push(
        <svg key={i} className="star star-full" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
        </svg>
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Half star
      stars.push(
        <div key={i} className="star star-half">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
          </svg>
          <svg className="star-fill" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <defs>
              <clipPath id={`half-star-${i}`}>
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
            </defs>
            <polygon 
              clipPath={`url(#half-star-${i})`}
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            ></polygon>
          </svg>
        </div>
      );
    } else {
      // Empty star
      stars.push(
        <svg key={i} className="star star-empty" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
        </svg>
      );
    }
  }

  return (
    <div className={`star-rating ${size}`}>
      <div className="stars">
        {stars}
      </div>
      {showValue && (
        <span className="rating-value">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
/* Updated: 2025-09-04 16:51:36 */
