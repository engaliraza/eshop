import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { useNotification } from '../context/NotificationContext';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { showError } = useNotification();

  // Get filter parameters from URL
  const filters = {
    search: searchParams.get('search') || '',
    brandId: searchParams.get('brandId') || '',
    typeId: searchParams.get('typeId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'ASC',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12,
    inStock: searchParams.get('inStock') === 'true'
  };

  // Fetch products based on filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== false) {
          params[key] = filters[key];
        }
      });

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

  // Fetch filter options
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

  // Update URL parameters
  const updateFilters = (newFilters) => {
    const updatedParams = new URLSearchParams();
    
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== '' && newFilters[key] !== false && newFilters[key] !== 1) {
        updatedParams.set(key, newFilters[key]);
      }
    });

    setSearchParams(updatedParams);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    updateFilters({
      ...filters,
      [filterName]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  // Handle sort change
  const handleSortChange = (sortBy, sortOrder) => {
    updateFilters({
      ...filters,
      sortBy,
      sortOrder,
      page: 1
    });
  };

  // Handle page change
  const handlePageChange = (page) => {
    updateFilters({
      ...filters,
      page
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        {!filters.search && filters.page === 1 && (
          <section className="hero-section">
            <div className="hero-content">
              <h1>Welcome to eShop</h1>
              <p>Discover amazing products at great prices</p>
            </div>
          </section>
        )}

        {/* Search Results Header */}
        {filters.search && (
          <div className="search-results-header">
            <h2>Search Results for "{filters.search}"</h2>
            <p>{pagination.totalItems || 0} products found</p>
          </div>
        )}

        <div className="home-content">
          {/* Filter Sidebar */}
          <aside className="filter-sidebar">
            <FilterSidebar
              brands={brands}
              types={types}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {/* Sort and View Options */}
            <div className="products-header">
              <div className="products-info">
                <span className="products-count">
                  {pagination.totalItems || 0} Products
                  {filters.search && ` for "${filters.search}"`}
                </span>
              </div>

              <div className="sort-options">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleSortChange(sortBy, sortOrder);
                  }}
                >
                  <option value="name-ASC">Name (A-Z)</option>
                  <option value="name-DESC">Name (Z-A)</option>
                  <option value="price-ASC">Price (Low to High)</option>
                  <option value="price-DESC">Price (High to Low)</option>
                  <option value="averageRating-DESC">Rating (High to Low)</option>
                  <option value="createdAt-DESC">Newest First</option>
                  <option value="createdAt-ASC">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <LoadingSpinner message="Loading products..." />
            ) : products.length > 0 ? (
              <>
                <ProductGrid products={products} />
                
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
              <div className="no-products">
                <div className="no-products-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;