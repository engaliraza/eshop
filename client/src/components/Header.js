import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBasket } from '../context/BasketContext';
import SearchBar from './SearchBar';
import BasketIcon from './BasketIcon';
import UserMenu from './UserMenu';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { basket } = useBasket();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={handleLogoClick}>
          <h1>eShop</h1>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <SearchBar />
        </div>

        {/* Navigation */}
        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          
          {user && (
            <>
              <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Orders
              </Link>
              <Link to="/wishlist" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Wishlist
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Actions */}
        <div className="header-actions">
          {/* Basket Icon */}
          <BasketIcon 
            itemCount={basket.totalItems} 
            onClick={() => {
              navigate('/cart');
              setIsMenuOpen(false);
            }}
          />

          {/* User Menu */}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;