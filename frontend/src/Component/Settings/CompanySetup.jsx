import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCompany } from '../../context/CompanyContext';

const CompanySetup = () => {
  const { refreshCompanySettings } = useCompany();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '', short_name: '', address: '', phone: '', email: '', website: '', gstin: '', cin: '', pan: '', logo_url: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logo_url: reader.result }));
    reader.readAsDataURL(file);
  };

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
      await axios.post(`/api/settings/company`, form);
      setSuccess('Company created successfully.');
      await refreshCompanySettings();
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create company.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] bg-white/50 text-sm";
  const labelCls = "block mb-1 text-xs font-semibold text-gray-700";

  const field = (key, label, type = 'text') => (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={inputCls}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf2ff] px-4 py-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-5 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#56c7be]/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <div className="text-center mb-4">
            <h3 className="text-xl font-black text-gray-800">Create Company</h3>
            <p className="text-xs text-gray-500 mt-1">No company is configured yet. Set up your company to begin.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <label className={labelCls}>Company Name *</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Your company name"
                  value={form.company_name}
                  onChange={(e) => { setForm({ ...form, company_name: e.target.value }); setError(''); }}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Short Name (brand)</label>
                <input
                  type="text"
                  placeholder="e.g. ACME"
                  value={form.short_name}
                  onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Address</label>
                <textarea
                  rows="2"
                  placeholder="Registered address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputCls + " resize-none"}
                />
              </div>
              {field('gstin', 'GSTIN')}
              {field('pan', 'PAN')}
              {field('phone', 'Phone')}
              {field('email', 'Email')}
              {field('cin', 'CIN')}
              {field('website', 'Website')}
              <div className="sm:col-span-2">
                <label className={labelCls}>Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white/50 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#56c7be]/10 file:text-[#214c94] file:font-semibold"
                />
                {form.logo_url && (
                  <img src={form.logo_url} alt="Logo preview" className="mt-2 h-10 w-auto object-contain" />
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center justify-center p-2 mt-3 bg-red-50 border-2 border-red-500 rounded-lg">
                <p className="text-red-700 text-xs font-black uppercase">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-center p-2 mt-3 bg-[#f0f9f9] border-2 border-[#56c7be]/50 rounded-lg">
                <p className="text-[#214c94] text-xs font-black uppercase">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.company_name.trim()}
              className={`w-full py-3 px-4 mt-4 font-black rounded-lg shadow-xl transition-all duration-500 ${(loading || !form.company_name.trim()) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-[#56c7be] via-[#214c94] to-[#1e3a8a] text-white hover:-translate-y-0.5 active:scale-95'}`}
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
