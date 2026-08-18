import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCompany } from '../../context/CompanyContext';

const CompanySetup = () => {
  const { refreshCompanySettings } = useCompany();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '', address: '', phone: '', email: '', website: '', gstin: '', cin: '', pan: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim()) {
      setError('Company name is required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/company`, form);
      setSuccess('Company created successfully.');
      await refreshCompanySettings();
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create company.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text') => (
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] bg-white/50"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf2ff] px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#56c7be]/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-gray-800">Create Company</h3>
            <p className="text-sm text-gray-500 mt-1">No company is configured yet. Set up your company (like Tally) to begin.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Company Name *</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. AUCTOR HOME APPLIANCES LLP"
              value={form.company_name}
              onChange={(e) => { setForm({ ...form, company_name: e.target.value }); setError(''); }}
              required
              className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] bg-white/50"
            />
            <label className="block mb-2 text-sm font-semibold text-gray-700">Address</label>
            <textarea
              rows="2"
              placeholder="Registered address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 bg-white/50 resize-none"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {field('gstin', 'GSTIN')}
              {field('pan', 'PAN')}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {field('phone', 'Phone')}
              {field('email', 'Email')}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {field('cin', 'CIN')}
              {field('website', 'Website')}
            </div>

            {error && (
              <div className="flex items-center justify-center p-3 mb-4 bg-red-50 border-2 border-red-500 rounded-xl">
                <p className="text-red-700 text-xs font-black uppercase">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-center p-3 mb-4 bg-[#f0f9f9] border-2 border-[#56c7be]/50 rounded-xl">
                <p className="text-[#214c94] text-xs font-black uppercase">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.company_name.trim()}
              className={`w-full py-4 px-4 font-black rounded-xl shadow-xl transition-all duration-500 ${(loading || !form.company_name.trim()) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-[#56c7be] via-[#214c94] to-[#1e3a8a] text-white hover:-translate-y-1 active:scale-95'}`}
            >
              {loading ? 'CREATING...' : 'CREATE COMPANY'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
