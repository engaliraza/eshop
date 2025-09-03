import React from 'react';
import { useBasket } from '../context/BasketContext';
import './CatalogItem.css';

const CatalogItem = ({ item }) => {
  const { addItemToBasket } = useBasket();

  const handleAddToCart = () => {
    addItemToBasket(item.id, 1);
  };

  return (
    <div className="catalog-item">
      <div className="item-image">
        <img 
          src={/images/products/} 
          alt={item.name}
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
      </div>
      
      <div className="item-details">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
        
        <div className="item-meta">
          <span className="item-brand">{item.catalogBrand.brand}</span>
          <span className="item-type">{item.catalogType.type}</span>
        </div>
        
        <div className="item-footer">
          <span className="item-price"></span>
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogItem;
