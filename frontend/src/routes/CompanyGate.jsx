import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';

const CompanyGate = () => {
  const { companyConfigured, companyLoading } = useCompany();

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf2ff]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#56c7be]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-gray-500 font-semibold">Loading company settings…</p>
        </div>
      </div>
    );
  }

  if (!companyConfigured) {
    return <Navigate to="/company-setup" replace />;
  }

  return <Outlet />;
};

export default CompanyGate;
