// src/Context/ToastContext.jsx
import React, { createContext, useContext, useState } from 'react';
import Toast from '../Component/Common/Toast';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.message && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          animation: 'toast-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <style>{`
            @keyframes toast-pop {
              from { transform: translateX(-50%) scale(0.8); opacity: 0; }
              to { transform: translateX(-50%) scale(1); opacity: 1; }
            }
          `}</style>
          <Toast message={toast.message} type={toast.type} />
        </div>
      )}
    </ToastContext.Provider>
  );
};
