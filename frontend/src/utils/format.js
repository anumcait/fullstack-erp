// Shared formatting helpers for corporate ERP UI

export const formatNumber = (value, decimals = 2) => {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (value, currency = 'INR', decimals = 2) => {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return '—';
  const symbol = currency === 'INR' ? '₹' : '';
  return `${symbol}${formatNumber(n, decimals)}`;
};

export const formatQty = (value) => {
  if (value == null || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toString();
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Compact currency for KPI cards (e.g. ₹12.4L, ₹1.2Cr)
export const formatCompactCurrency = (value, currency = 'INR') => {
  const n = Number(value || 0);
  const symbol = currency === 'INR' ? '₹' : '';
  if (Math.abs(n) >= 1e7) return `${symbol}${(n / 1e7).toFixed(2)}Cr`;
  if (Math.abs(n) >= 1e5) return `${symbol}${(n / 1e5).toFixed(2)}L`;
  if (Math.abs(n) >= 1e3) return `${symbol}${(n / 1e3).toFixed(1)}K`;
  return `${symbol}${formatNumber(n, 0)}`;
};
