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

export const formatCellValue = (val) => {
  if (val == null || val === '') return '';
  if (typeof val === 'string') {
    const s = val.trim();
    if (/^\d{2}-\d{2}-\d{4}/.test(s)) return s;
    const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/);
    if (m) {
      const dd = String(m[3]).padStart(2, '0');
      const mm = String(m[2]).padStart(2, '0');
      const yyyy = m[1];
      if (m[4] !== undefined && m[5] !== undefined) {
        let hh = parseInt(m[4], 10);
        const min = m[5];
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12 || 12;
        return `${dd}-${mm}-${yyyy} ${hh}:${min} ${ampm}`;
      }
      return `${dd}-${mm}-${yyyy}`;
    }
  }
  return val;
};

export const formatDate = (value) => {
  if (!value || value === '-' || value === '—' || value === '--') return '—';
  if (typeof value === 'string') {
    const s = value.trim();
    if (/^\d{2}-\d{2}-\d{4}/.test(s)) return s;
    const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) {
      const yyyy = m[1];
      const mm = String(m[2]).padStart(2, '0');
      const dd = String(m[3]).padStart(2, '0');
      return `${dd}-${mm}-${yyyy}`;
    }
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return typeof value === 'string' ? value : '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export const formatDateTime = (value) => {
  if (!value || value === '-' || value === '—') return '—';
  if (typeof value === 'string') {
    const s = value.trim();
    const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[T\s](\d{1,2}):(\d{2})/);
    if (m) {
      const yyyy = m[1];
      const mm = String(m[2]).padStart(2, '0');
      const dd = String(m[3]).padStart(2, '0');
      let hh = parseInt(m[4], 10);
      const min = m[5];
      const ampm = hh >= 12 ? 'PM' : 'AM';
      hh = hh % 12 || 12;
      return `${dd}-${mm}-${yyyy} ${hh}:${min} ${ampm}`;
    }
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${dd}-${mm}-${yyyy} ${hours}:${minutes} ${ampm}`;
};

// Shows time only when the value carries a time component (date-only stays date-only).
export const formatSmartDateTime = (value) => {
  if (!value || value === '-' || value === '—') return '—';
  const raw = String(value).trim();
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw.slice(0, 10)) && raw.length === 10;
  return isDateOnly ? formatDate(value) : formatDateTime(value);
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
