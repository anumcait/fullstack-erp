export const formatDate = (date) => {
  if (!date || date === "--") return "-";
  
  let d;
  try {
    if (typeof date === 'string' && date.includes('T')) {
      const localString = date.replace("T", " ").split(".")[0].replace("Z", "");
      d = new Date(localString);
    } else if (typeof date === 'string' && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        let yyyy, mm, dd;
        // Smart format detection: Year is usually 4 digits
        if (parts[0].length === 4) { // YYYY-MM-DD
          [yyyy, mm, dd] = parts.map(Number);
        } else if (parts[2].length === 4) { // DD-MM-YYYY
          [dd, mm, yyyy] = parts.map(Number);
        } else { // Fallback to legacy parsing but protect against small years
          [yyyy, mm, dd] = parts.map(Number);
          if (yyyy < 100) yyyy += 2000;
        }
        d = new Date(yyyy, mm - 1, dd);
      } else {
        d = new Date(date);
      }
    } else {
      d = new Date(date);
    }
  } catch (e) {
    return date;
  }
  
  if (!d || isNaN(d.getTime())) return date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

export const formatDateOnly = (date) => {
  if (!date || date === "--") return "-";
  let d;
  
  try {
    if (typeof date === 'string') {
      if (date.includes('T')) {
        d = new Date(date);
      } else if (date.includes('-')) {
        const parts = date.split('-');
        if (parts.length === 3) {
          let yyyy, mm, dd;
          // Smart format detection
          if (parts[0].length === 4) { // YYYY-MM-DD
            [yyyy, mm, dd] = parts.map(Number);
          } else if (parts[2].length === 4) { // DD-MM-YYYY
            [dd, mm, yyyy] = parts.map(Number);
          } else {
            [yyyy, mm, dd] = parts.map(Number);
            if (yyyy < 100) yyyy += 2000;
          }
          d = new Date(yyyy, mm - 1, dd);
        } else {
          d = new Date(date);
        }
      } else {
        return date;
      }
    } else {
      d = new Date(date);
    }
  } catch (e) {
    return date;
  }
  
  if (!d || isNaN(d.getTime())) return date;
  
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

export const formatDateTimeDot = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

export const formatDateTimeForInput = (date) => {
  if (!date) return "";
  if (typeof date === 'string' && date.includes('T')) return date.slice(0, 16);
  if (typeof date === 'string' && date.length === 10) return date;
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
};

export const formatDateTimeAMPM = (dateInput) => {
  if (!dateInput) return "-";
  let d;
  try {
    if (typeof dateInput === "string") {
      if (dateInput.includes("T")) {
        // Treat ISO strings as local time by replacing T with space and removing Z/offsets
        // This prevents the browser from applying timezone offsets to already-local times from DB
        const localString = dateInput.replace("T", " ").split(".")[0].replace("Z", "");
        d = new Date(localString);
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = new Date(dateInput);
    }
  } catch (e) {
    return dateInput;
  }
  if (isNaN(d.getTime())) return dateInput;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}-${month}-${year} ${hours}:${mins} ${ampm}`;
};

export const formatReportDate = (dateInput) => {
  if (!dateInput) return "";
  let d;
  try {
    if (typeof dateInput === "string") {
      if (dateInput.includes("T")) {
        // Treat ISO strings as local time by replacing T with space and removing Z/offsets
        const localString = dateInput.replace("T", " ").split(".")[0].replace("Z", "");
        d = new Date(localString);
      } else if (dateInput.includes("-")) {
        const parts = dateInput.split('-');
        if (parts.length === 3) {
          let yyyy, mm, dd;
          // Smart format detection
          if (parts[0].length === 4) { // YYYY-MM-DD
            [yyyy, mm, dd] = parts.map(Number);
          } else if (parts[2].length === 4) { // DD-MM-YYYY
            [dd, mm, yyyy] = parts.map(Number);
          } else {
            [yyyy, mm, dd] = parts.map(Number);
            if (yyyy < 100) yyyy += 2000;
          }
          d = new Date(yyyy, mm - 1, dd);
        } else {
          d = new Date(dateInput);
        }
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = new Date(dateInput);
    }
  } catch (e) {
    return dateInput;
  }
  
  if (!d || isNaN(d.getTime())) return dateInput;

  // Format: May 25, 2026 14:23 PM
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
};