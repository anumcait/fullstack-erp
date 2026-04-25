export const formatDate = (date) => {
  if (!date) return "-";
  let d, day, month, year, hours, minutes;
  
  if (typeof date === 'string') {
    if (date.includes('T')) {
      d = new Date(date);
    } else if (date.includes('-') && date.length === 10) {
      const [yyyy, mm, dd] = date.split('-');
      d = new Date(yyyy, mm - 1, dd);
    } else {
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }
  
  if (isNaN(d.getTime())) return date;
  
  day = String(d.getDate()).padStart(2, '0');
  month = String(d.getMonth() + 1).padStart(2, '0');
  year = d.getFullYear();
  hours = String(d.getHours()).padStart(2, '0');
  minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}.${minutes}`;
};

export const formatDateOnly = (date) => {
  if (!date) return "-";
  let d;
  
  if (typeof date === 'string') {
    if (date.includes('T')) {
      d = new Date(date);
    } else if (date.includes('-') && date.length === 10) {
      const [yyyy, mm, dd] = date.split('-');
      d = new Date(yyyy, mm - 1, dd);
    } else {
      return date;
    }
  } else {
    d = new Date(date);
  }
  
  if (isNaN(d.getTime())) return date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
};

export const formatTimeOnly = (time) => {
  if (!time) return "-";
  if (typeof time === 'string' && time.length === 5) return time;
  
  const d = new Date(time);
  if (isNaN(d.getTime())) return time;
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}.${minutes}`;
};

export const formatDateTimeForInput = (date) => {
  if (!date) return "";
  if (typeof date === 'string' && date.includes('T')) return date.slice(0, 16);
  if (typeof date === 'string' && date.length === 10) return date;
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
};