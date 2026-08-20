import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChangePasswordForm.css';

const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/change-password', { oldPassword, newPassword });
      sessionStorage.removeItem('mustChangePassword');
      setSuccess("Password changed successfully! Redirecting...");
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-wrapper">
      <div className="cp-card">
        <div className="cp-head">
          <span className="cp-badge">SECURE</span>
          <h2 className="cp-title">Change Password</h2>
          <p className="cp-subtitle">Set a new secure password to continue.</p>
        </div>

        {error && <div className="cp-msg cp-error">{error}</div>}
        {success && <div className="cp-msg cp-success">{success}</div>}

        <form onSubmit={handleChangePassword} className="cp-form">
          <div className="cp-group">
            <label>Current Password<span>*</span></label>
            <input
              type="password"
              required
              autoFocus
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="cp-group">
            <label>New Password<span>*</span></label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="cp-group">
            <label>Confirm New Password<span>*</span></label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="cp-button" disabled={loading}>
            {loading ? 'CHANGING...' : 'CHANGE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
