// src/Context/ToastContext.jsx
import React, { createContext, useContext, useState } from 'react';
import Toast from '../Component/Common/Toast';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 10000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.message && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          animation: 'toast-slide-in 0.4s cubic-bezier(0.075, 0.82, 0.165, 1)'
        }}>
          <style>{`
            @keyframes toast-slide-in {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          <Toast message={toast.message} type={toast.type} />
        </div>
      )}
    </ToastContext.Provider>
  );
};
