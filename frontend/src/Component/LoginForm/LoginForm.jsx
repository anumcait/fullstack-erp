import React, { useState, useRef } from 'react';
import { FaFacebookF, FaGoogle, FaLinkedinIn, FaEye, FaEyeSlash } from 'react-icons/fa';
import loginIllustration from "../../assets/images/login_illustration.png";
import axios from 'axios';
import './LoginForm.css'; // ✅ Import your custom CSS
import { useCompany } from '../../context/CompanyContext';

const LoginForm = () => {
  const { companyName, companyShortName, companyConfigured, companySettings, refreshCompanySettings } = useCompany();
  const logoUrl = companySettings?.logo_url;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email/Username, 2: OTP, 3: New Password
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
  const passwordRef = useRef(null);

  // First-run "Create Company" (Tally-style) — shown when no company is configured yet.
  const [companyForm, setCompanyForm] = useState({
    company_name: '', short_name: '', address: '', phone: '', email: '', website: '', gstin: '', cin: '', pan: '', logo_url: ''
  });

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCompanyForm((f) => ({ ...f, logo_url: reader.result }));
    reader.readAsDataURL(file);
  };
  const [companyError, setCompanyError] = useState('');
  const [companySuccess, setCompanySuccess] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.company_name.trim()) {
      setCompanyError('Company name is required.');
      return;
    }
    setCompanyLoading(true);
    setCompanyError('');
    setCompanySuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/company`, companyForm);
      setCompanySuccess('Company created successfully. Please login to continue.');
      await refreshCompanySettings();
    } catch (err) {
      setCompanyError(err.response?.data?.error || err.response?.data?.message || 'Failed to create company.');
    } finally {
      setCompanyLoading(false);
    }
  };

  // SEO and Pre-fill logic
  React.useEffect(() => {
    document.title = `${companyShortName ? companyShortName.trim() + ' ERP' : 'ERP'} - Secure Login`;

    if (rememberMe) {
      const savedUser = localStorage.getItem('rememberedUsername');
      if (savedUser) setUsername(savedUser);
    }
  }, [companyName, rememberMe]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    // Basic Validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        '/api/auth/login',
        {
          username,
          password
        },
        {
          withCredentials: true
        }
      );

      const { user } = response.data;
      localStorage.setItem('userName', user.username);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('empName', user.ename);
      localStorage.setItem('empId', user.empid ? String(user.empid) : '');
      localStorage.setItem('userPermissions', JSON.stringify(user.permissions || []));

      // Handle "Keep me signed in"
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedUsername');
      }

      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('empName', user.ename);
      sessionStorage.setItem('userPermissions', JSON.stringify(user.permissions || []));

      if (user.mustChangePassword) {
        sessionStorage.setItem('mustChangePassword', 'true');
        window.location.href = '/change-password';
      } else {
        sessionStorage.removeItem('mustChangePassword');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/forgot-password', { identifier: recoveryIdentifier });
      setForgotStep(2);
      setSuccessMsg(`A recovery code has been sent to your registered email/mobile.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/reset-password', { identifier: recoveryIdentifier, otp, newPassword });
      setSuccessMsg('Password reset successfully! Please login with your new password.');
      setTimeout(() => {
        setIsForgotMode(false);
        setForgotStep(1);
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eaf2ff] px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* Left Illustration */}
        <div className="hidden md:flex bg-gradient-to-br from-[#eaf2ff] to-[#d0e1ff] items-center justify-center p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#56c7be]/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#56c7be]/20 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#214c94]/10 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-[#214c94]/20 transition-all duration-1000"></div>

          <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-700 ease-out">
            <img
              src={loginIllustration}
              alt="Login"
              className="w-full max-w-[320px] h-auto drop-shadow-[0_20px_50px_rgba(33,76,148,0.15)]"
            />
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="flex flex-col justify-center px-8 py-10 relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#56c7be]/10 blur-[100px] rounded-full"></div>

          {/* Branded Header */}
          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative group">
              {/* Outer Pulsing Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#56c7be] via-[#214c94] to-[#56c7be] rounded-full blur-md opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

              {/* Logo Container */}
              <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-2xl p-2 bg-white flex items-center justify-center transform transition-all duration-700 hover:rotate-[360deg] hover:scale-105 active:scale-95">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${companyShortName || 'Company'} Logo`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black uppercase text-[#214c94]">LOGO</span>
                )}
              </div>
            </div>

            <div className="text-center mt-6">
              <span className="text-[#56c7be] text-[10px] font-black tracking-[0.5em] uppercase mb-1 block opacity-100 drop-shadow-sm">
                Welcome to
              </span>
              <h2 className="font-black leading-none tracking-tighter flex items-baseline justify-center">
                <span className="text-4xl bg-gradient-to-tr from-[#56c7be] via-[#214c94] to-[#1e3a8a] bg-clip-text text-transparent uppercase drop-shadow-sm select-none">
                  {companyShortName ? companyShortName.trim() : 'ERP'}
                </span>
                {companyShortName && (
                  <span className="text-4xl text-orange-500 drop-shadow-[0_2px_10px_rgba(249,115,22,0.3)] uppercase ml-1">
                    ERP
                  </span>
                )}
              </h2>
              {/* <div className="flex items-center justify-center gap-3 mt-1">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#56c7be]/50 to-transparent"></div>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Innovation • Precision • Excellence</p>
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent via-[#214c94]/50 to-transparent"></div>
              </div> */}
            </div>
          </div>

          {!companyConfigured ? (
            <div className="relative z-10 w-full">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-gray-800">Create Company</h3>
                <p className="text-sm text-gray-500 mt-1">No company is configured yet. Set up your company to begin.</p>
              </div>
              <form onSubmit={handleCreateCompany}>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Company Name *</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter your company name"
                  value={companyForm.company_name}
                  onChange={(e) => { setCompanyForm({ ...companyForm, company_name: e.target.value }); setCompanyError(''); }}
                  required
                  className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] bg-white/50"
                />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Short Name (brand)</label>
                    <input
                      type="text"
                      placeholder="e.g. ACME"
                      value={companyForm.short_name}
                      onChange={(e) => setCompanyForm({ ...companyForm, short_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] bg-white/50"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCompanyLogoChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/50 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#56c7be]/10 file:text-[#214c94] file:font-semibold"
                    />
                    {companyForm.logo_url && (
                      <img src={companyForm.logo_url} alt="Logo preview" className="mt-2 h-12 w-auto object-contain" />
                    )}
                  </div>
                </div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Address</label>
                <textarea
                  rows="2"
                  placeholder="Registered address"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 bg-white/50 resize-none"
                />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">GSTIN</label>
                    <input type="text" placeholder="GSTIN" value={companyForm.gstin} onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 bg-white/50" />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">PAN</label>
                    <input type="text" placeholder="PAN" value={companyForm.pan} onChange={(e) => setCompanyForm({ ...companyForm, pan: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 bg-white/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Phone</label>
                    <input type="text" placeholder="Phone" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 bg-white/50" />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
                    <input type="email" placeholder="Email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 bg-white/50" />
                  </div>
                </div>
                {companyError && (
                  <div className="flex items-center justify-center p-3 mb-4 bg-red-50 border-2 border-red-500 rounded-xl">
                    <p className="text-red-700 text-xs font-black uppercase">{companyError}</p>
                  </div>
                )}
                {companySuccess && (
                  <div className="flex items-center justify-center p-3 mb-4 bg-[#f0f9f9] border-2 border-[#56c7be]/50 rounded-xl">
                    <p className="text-[#214c94] text-xs font-black uppercase">{companySuccess}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={companyLoading || !companyForm.company_name.trim()}
                  className={`w-full py-4 px-4 font-black rounded-xl shadow-xl transition-all duration-500 ${(companyLoading || !companyForm.company_name.trim()) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-[#56c7be] via-[#214c94] to-[#1e3a8a] text-white hover:-translate-y-1 active:scale-95'}`}
                >
                  {companyLoading ? 'CREATING...' : 'CREATE COMPANY'}
                </button>
              </form>
            </div>
          ) : !isForgotMode ? (
            <form onSubmit={handleLogin} className="relative z-10">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                User Name:
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordRef.current?.focus();
                  }
                }}
                required
                className="w-full px-4 py-3 mb-5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] transition-all bg-white/50 backdrop-blur-sm"
              />

              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Password:
              </label>
              <div className="relative mb-6">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] transition-all bg-white/50 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#56c7be] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {password && password.length < 4 && (
                <p className="text-[10px] text-orange-500 font-bold uppercase mb-4 animate-pulse">Minimum 4 characters required</p>
              )}

              <div className="flex justify-between items-center mb-6">
                <label className="group flex items-center text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 w-4 h-4 rounded border-gray-300 text-[#56c7be] focus:ring-[#56c7be] transition-all cursor-pointer"
                  />
                  <span className="group-hover:text-gray-900 transition-colors">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setIsForgotMode(true); setForgotStep(1); setError(''); setSuccessMsg(''); }}
                  className="text-sm text-[#56c7be] font-bold hover:text-[#214c94] transition-colors underline-offset-4 hover:underline"
                >
                  Forgot access?
                </button>
              </div>

              {error && (
                <div className="flex items-center justify-center p-3 mb-6 bg-red-50 border-2 border-red-500 rounded-xl animate-shake shadow-inner backdrop-blur-sm">
                  <p className="text-red-700 text-xs font-black uppercase flex items-center gap-2">
                    <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-md">!</span>
                    {error}
                  </p>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center justify-center p-4 mb-6 bg-[#f0f9f9] border-2 border-[#56c7be]/50 rounded-xl animate-bounce shadow-[0_4px_15px_rgba(86,199,190,0.1)] backdrop-blur-sm">
                  <p className="text-[#214c94] text-xs font-black uppercase flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#56c7be] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">✓</span>
                    {successMsg}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username.trim() || password.length < 4}
                className={`w-full py-4 px-4 font-black rounded-xl shadow-xl transition-all duration-500 transform flex items-center justify-center group overflow-hidden relative
                  ${(loading || !username.trim() || password.length < 4)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-br from-[#56c7be] via-[#214c94] to-[#1e3a8a] text-white hover:shadow-[#56c7be]/40 hover:-translate-y-1 active:scale-95 shadow-[0_10px_20px_rgba(33,76,148,0.2)]'
                  }`}
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AUTHENTICATING...
                  </span>
                ) : (
                  <>
                    <span className="tracking-widest">LOGIN</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="relative z-10 w-full">
              <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Account Recovery</h4>

              {forgotStep === 1 && (
                <form onSubmit={handleForgotPassword}>
                  <p className="text-sm text-gray-500 mb-6 text-center">Enter your Employee ID or Registered Email to receive a verification code.</p>
                  <input
                    type="text"
                    required
                    placeholder="Emp ID or Email"
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    className="w-full px-4 py-3 mb-6 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 focus:border-[#56c7be] bg-white/50"
                  />
                  <button type="submit" disabled={loading} className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
                    {loading ? 'VERIFYING...' : 'SEND RECOVERY CODE'}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); setForgotStep(3); }}>
                  <p className="text-sm text-green-600 mb-6 text-center font-semibold">{successMsg}</p>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <input type="text" maxLength="4" placeholder="Code" className="col-span-4 text-center tracking-[1em] text-2xl font-bold py-3 border border-gray-200 rounded-xl bg-white/50" onChange={(e) => setOtp(e.target.value)} />
                  </div>
                  <button type="submit" className="w-full py-4 bg-[#56c7be] text-white font-bold rounded-xl hover:bg-[#214c94] transition-all shadow-lg active:scale-95 text-lg">
                    VERIFY CODE
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  <p className="text-sm text-gray-500 mb-6 text-center text-semibold uppercase italic">Set your new secure password</p>
                  <div className="relative mb-6">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      required
                      placeholder="New Secure Password"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56c7be]/50 transition-all bg-white/50 pr-11 ${newPassword && newPassword.length < 4 ? 'border-orange-500' : 'border-gray-200'}`}
                      onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#56c7be] transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {newPassword && newPassword.length < 4 && (
                    <p className="text-[10px] text-orange-500 font-bold uppercase mb-4 text-center">Security: Min 4 characters</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 4}
                    className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 ${newPassword.length < 4 ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                  >
                    {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                  </button>
                </form>
              )}

              {successMsg && forgotStep !== 2 && (
                <p className="text-sm text-green-600 mt-4 text-center font-bold bg-green-50 py-2 rounded-lg">{successMsg}</p>
              )}
              {error && (
                <p className="text-sm text-red-600 mt-4 text-center font-bold bg-red-50 py-2 rounded-lg">{error}</p>
              )}

              <button
                onClick={() => { setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
                className="w-full mt-6 text-sm text-gray-400 font-bold hover:text-gray-600 flex items-center justify-center gap-2"
              >
                ← Back to Login
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Left Branding */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-1 opacity-70 hover:opacity-100 transition-opacity duration-300">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} {(companyShortName || 'ERP').trim().toUpperCase()}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Powered by</span>
          <span className="px-3 py-1 bg-white/80 backdrop-blur-sm text-[#56c7be] text-[11px] font-black rounded-full shadow-sm border border-white/50">
            {(companyShortName || 'ERP').trim()}{companyShortName && <span className="text-[#214c94]"> ERP</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;




// import React, { useState } from 'react';
// import './LoginForm.css';
// import logo from "../../assets/images/EQIC_Image.jpg";
// import axios from 'axios';

// const LoginForm = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async (e) => {
//   e.preventDefault();

//   try {
//     const response = await axios.post(
//       'http://localhost:5000/api/auth/login',
//       {
//         username,
//         password
//       },
//       {
//         withCredentials: true // ⬅️ VERY IMPORTANT for session to work
//       }
//     );

//     // Save session info to localStorage or state
//     const { user } = response.data;
//     localStorage.setItem('userName', user.username);
//     localStorage.setItem('userRole', user.role); // optional
//     localStorage.setItem('empName', user.ename);
//     window.location.href = '/dashboard';
//   } catch (err) {
//     console.error('Login error:', err.response?.data || err.message);
//     setError('Invalid username or password');
//   }
// };


//   return (
//     <div className="login-page">
//       <div className="login-box">
//         <div className="tab-header">Sign In</div>
//         <div className="login-header">
//           <img src={logo} alt="Logo" className="logo" />
//         </div>

//         <form className="login-form" onSubmit={handleLogin}>
//           <label>User Name:</label>
//           <input
//             type="text"
//             placeholder="Enter username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />

//           <label>Password:</label>
//           <input
//             type="password"
//             placeholder="Enter password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <div className="checkbox-area">
//             <input type="checkbox" id="remember" />
//             <label htmlFor="remember">Remember me next time.</label>
//           </div>

//           {error && <p className="error-message">{error}</p>}

//           <button type="submit" className="login-btn">LOG IN</button>
//         </form>
//       </div>

//       <div className="footer">
//         <span>2025 Auctor Home Appliances. All rights reserved</span>
//         <span className="powered">Powered By: EQICERP</span>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;