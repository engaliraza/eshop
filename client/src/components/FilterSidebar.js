import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ brands, types, filters, onFilterChange, onClearFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice,
    max: filters.maxPrice
  });

  const handlePriceChange = (field, value) => {
    const newRange = { ...priceRange, [field]: value };
    setPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    onFilterChange('minPrice', priceRange.min);
    onFilterChange('maxPrice', priceRange.max);
  };

  const hasActiveFilters = () => {
    return filters.brandId || filters.typeId || filters.minPrice || filters.maxPrice || filters.inStock;
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button 
        className="filter-toggle mobile-only"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
        </svg>
        Filters
        {hasActiveFilters() && <span className="filter-badge"></span>}
      </button>

      {/* Filter Sidebar */}
      <div className={`filter-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="filter-header">
          <h3>Filters</h3>
          {hasActiveFilters() && (
            <button className="clear-filters-btn" onClick={onClearFilters}>
              Clear All
            </button>
          )}
          <button 
            className="filter-close mobile-only"
            onClick={() => setIsOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="filter-content">
          {/* Brand Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Brand</h4>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="brand"
                  value=""
                  checked={!filters.brandId}
                  onChange={(e) => onFilterChange('brandId', e.target.value)}
                />
                <span className="filter-label">All Brands</span>
              </label>
              {brands.map((brand) => (
                <label key={brand.id} className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value={brand.id}
                    checked={filters.brandId === brand.id}
                    onChange={(e) => onFilterChange('brandId', e.target.value)}
                  />
                  <span className="filter-label">{brand.brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Category</h4>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="type"
                  value=""
                  checked={!filters.typeId}
                  onChange={(e) => onFilterChange('typeId', e.target.value)}
                />
                <span className="filter-label">All Categories</span>
              </label>
              {types.map((type) => (
                <label key={type.id} className="filter-option">
                  <input
                    type="radio"
                    name="type"
                    value={type.id}
                    checked={filters.typeId === type.id}
                    onChange={(e) => onFilterChange('typeId', e.target.value)}
                  />
                  <span className="filter-label">{type.type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Price Range</h4>
            <div className="price-filter">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label>Min</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="price-input-group">
                  <label>Max</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              <button 
                className="btn btn-outline apply-price-btn"
                onClick={applyPriceFilter}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Stock Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Availability</h4>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => onFilterChange('inStock', e.target.checked)}
                />
                <span className="filter-label">In Stock Only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="filter-overlay mobile-only" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default FilterSidebar;
/* Updated: 2025-09-04 16:51:36 */
