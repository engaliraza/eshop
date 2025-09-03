import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, maxVisiblePages = 5 }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination">
      {/* Previous Button */}
      <button
        className="pagination-btn pagination-prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
        Previous
      </button>

      {/* Page Numbers */}
      <div className="pagination-pages">
        {/* First page if not visible */}
        {visiblePages[0] > 1 && (
          <span className="pagination-ellipsis">...</span>
        )}

        {/* Visible pages */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`pagination-page ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* Last page if not visible */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <span className="pagination-ellipsis">...</span>
        )}
      </div>

      {/* Next Button */}
      <button
        className="pagination-btn pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>

      {/* Page Info */}
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;