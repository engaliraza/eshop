import React from 'react';
import './BasketIcon.css';

const BasketIcon = ({ itemCount = 0, onClick }) => {
  return (
    <button className="basket-icon" onClick={onClick} aria-label={`Shopping cart with ${itemCount} items`}>
      <div className="basket-icon-container">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        
        {itemCount > 0 && (
          <span className="basket-badge">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      
      <span className="basket-text">Cart</span>
    </button>
  );
};

export default BasketIcon;