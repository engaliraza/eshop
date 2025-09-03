import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Profile.css';

const ProfileSection = ({ title, children, isOpen, onToggle }) => (
  <div className="profile-section">
    <div className="section-header" onClick={onToggle}>
      <h3>{title}</h3>
      <svg 
        className={`section-arrow ${isOpen ? 'open' : ''}`}
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
    {isOpen && <div className="section-content">{children}</div>}
  </div>
);

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));

    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    setLoading(true);
    const result = await updateProfile(profileData);
    setLoading(false);

    if (result.success) {
      // Profile updated successfully (handled by context)
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setLoading(true);
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setLoading(false);

    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  if (!user) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user.firstName} {user.lastName}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-role">
              {user.role === 'admin' ? 'Administrator' : 'Customer'}
            </p>
          </div>
        </div>

        <div className="profile-content">
          {/* Profile Information */}
          <ProfileSection
            title="Profile Information"
            isOpen={activeSection === 'profile'}
            onToggle={() => toggleSection('profile')}
          >
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileInputChange}
                    className={profileErrors.firstName ? 'error' : ''}
                  />
                  {profileErrors.firstName && (
                    <span className="error-message">{profileErrors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileInputChange}
                    className={profileErrors.lastName ? 'error' : ''}
                  />
                  {profileErrors.lastName && (
                    <span className="error-message">{profileErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="disabled"
                />
                <small className="form-help">Email cannot be changed</small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </ProfileSection>

          {/* Change Password */}
          <ProfileSection
            title="Change Password"
            isOpen={activeSection === 'password'}
            onToggle={() => toggleSection('password')}
          >
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  className={passwordErrors.currentPassword ? 'error' : ''}
                />
                {passwordErrors.currentPassword && (
                  <span className="error-message">{passwordErrors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  className={passwordErrors.newPassword ? 'error' : ''}
                />
                {passwordErrors.newPassword && (
                  <span className="error-message">{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className={passwordErrors.confirmPassword ? 'error' : ''}
                />
                {passwordErrors.confirmPassword && (
                  <span className="error-message">{passwordErrors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </ProfileSection>

          {/* Account Settings */}
          <ProfileSection
            title="Account Settings"
            isOpen={activeSection === 'settings'}
            onToggle={() => toggleSection('settings')}
          >
            <div className="account-settings">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Account Status</h4>
                  <p>Your account is currently active</p>
                </div>
                <div className="setting-status">
                  <span className="status-badge active">Active</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Member Since</h4>
                  <p>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {user.lastLoginAt && (
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Last Login</h4>
                    <p>
                      {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
};

export default Profile;