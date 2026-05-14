// src/Component/Common/Toast.jsx
import React from 'react';

const toastStyles = {
  success: {
    background: 'linear-gradient(135deg, #00b09b, #96c93d)',
    icon: '✅'
  },
  error: {
    background: 'linear-gradient(135deg, #f85032, #e73827)',
    icon: '❌'
  },
  info: {
    background: 'linear-gradient(135deg, #2193b0, #6dd5ed)',
    icon: 'ℹ️'
  },
  warning: {
    background: 'linear-gradient(135deg, #f12711, #f5af19)',
    icon: '⚠️'
  }
};

const Toast = ({ message, type }) => {
  const style = toastStyles[type] || { background: '#333', icon: '🔔' };
  
  return (
    <div style={{
      background: style.background,
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '12px',
      minWidth: '300px',
      maxWidth: '450px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontWeight: '600',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      fontSize: '14px',
      fontFamily: '"Inter", "Roboto", sans-serif'
    }}>
      <span style={{ fontSize: '18px' }}>{style.icon}</span>
      <div style={{ flex: 1 }}>{message}</div>
    </div>
  );
};

export default Toast;
