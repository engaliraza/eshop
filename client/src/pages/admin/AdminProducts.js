import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import './AdminProducts.css';

const ProductModal = ({ product, brands, types, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    catalogBrandId: product?.catalogBrandId || '',
    catalogTypeId: product?.catalogTypeId || '',
    availableStock: product?.availableStock || 0,
    restockThreshold: product?.restockThreshold || 0,
    maxStockThreshold: product?.maxStockThreshold || 0
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.catalogBrandId) newErrors.catalogBrandId = 'Brand is required';
    if (!formData.catalogTypeId) newErrors.catalogTypeId = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (image) {
        formDataToSend.append('image', image);
      }

      if (product) {
        await axios.put(`/api/v1/catalog/items/${product.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/v1/catalog/items', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="catalogBrandId">Brand *</label>
              <select
                id="catalogBrandId"
                name="catalogBrandId"
                value={formData.catalogBrandId}
                onChange={handleInputChange}
                className={errors.catalogBrandId ? 'error' : ''}
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.brand}</option>
                ))}
              </select>
              {errors.catalogBrandId && <span className="error-message">{errors.catalogBrandId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="catalogTypeId">Category *</label>
              <select
                id="catalogTypeId"
                name="catalogTypeId"
                value={formData.catalogTypeId}
                onChange={handleInputChange}
                className={errors.catalogTypeId ? 'error' : ''}
              >
                <option value="">Select Category</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.type}</option>
                ))}
              </select>
              {errors.catalogTypeId && <span className="error-message">{errors.catalogTypeId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="availableStock">Available Stock</label>
              <input
                type="number"
                id="availableStock"
                name="availableStock"
                value={formData.availableStock}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Product Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [currentPage, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get('/api/v1/catalog/items', { params });
      setProducts(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [brandsResponse, typesResponse] = await Promise.all([
        axios.get('/api/v1/catalog/brands'),
        axios.get('/api/v1/catalog/types')
      ]);

      setBrands(brandsResponse.data.data.brands);
      setTypes(typesResponse.data.data.types);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/catalog/items/${productId}`);
      showSuccess('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete product';
      showError(message);
    }
  };

  const handleSaveProduct = () => {
    setShowModal(false);
    setSelectedProduct(null);
    showSuccess(selectedProduct ? 'Product updated successfully' : 'Product added successfully');
    fetchProducts();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="admin-products">
      <div className="admin-container">
        <div className="products-header">
          <h1>Product Management</h1>
          <button className="btn btn-primary" onClick={handleAddProduct}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Product
          </button>
        </div>

        <div className="products-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading products..." />
        ) : (
          <>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-info">
                          <div className="product-image">
                            {product.pictureUri ? (
                              <img src={product.pictureUri} alt={product.name} />
                            ) : (
                              <div className="product-placeholder">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                  <polyline points="21,15 16,10 5,21"></polyline>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="product-details">
                            <div className="product-name">{product.name}</div>
                            <div className="product-id">ID: {product.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>{product.catalogBrand?.brand}</td>
                      <td>{product.catalogType?.type}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <span className={`stock-badge ${product.availableStock <= 10 ? 'low' : 'normal'}`}>
                          {product.availableStock}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {showModal && (
          <ProductModal
            product={selectedProduct}
            brands={brands}
            types={types}
            onSave={handleSaveProduct}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
/* Updated: 2025-09-04 16:51:36 */
