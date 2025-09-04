import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductGrid from './ProductGrid';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProductId, categoryId, brandId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, categoryId, brandId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 4,
        exclude: currentProductId
      };

      if (categoryId) {
        params.typeId = categoryId;
      } else if (brandId) {
        params.brandId = brandId;
      }

      const response = await axios.get('/api/v1/catalog/items', { params });
      setRelatedProducts(response.data.data.items.filter(p => p.id !== currentProductId));
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <h2>You Might Also Like</h2>
      <ProductGrid products={relatedProducts} />
    </div>
  );
};

export default RelatedProducts;

/* Updated: 2025-09-04 16:51:36 */
