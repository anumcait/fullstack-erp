import React from 'react';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Shown when the company settings request fails (DB error, backend down, or
// network/latency issue). We deliberately do NOT redirect to /company-setup,
// because that screen is only for a genuine first-time installation.
const CompanyErrorScreen = ({ message, onRetry }) => {
  const navigate = useNavigate();
  const retry = () => {
    if (typeof onRetry === 'function') onRetry();
    else window.location.reload();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf2ff]">
      <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
        <ErrorOutlineIcon sx={{ fontSize: 56, color: '#d32f2f' }} />
        <h2 className="text-xl font-bold text-gray-800">Unable to reach the server</h2>
        <p className="text-sm text-gray-600">
          {message || 'The backend or database is not responding. This is not a first-time setup — your company data is likely intact. Check the server/DB connection and retry.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={retry}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#214c94] text-white font-semibold hover:bg-[#1e3a8a]"
          >
            <RefreshIcon fontSize="small" /> Retry
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyErrorScreen;
