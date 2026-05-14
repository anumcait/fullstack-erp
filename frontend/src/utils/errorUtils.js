/**
 * Extracts a user-friendly error message from an axios error object.
 * @param {any} error - The error object from catch block
 * @param {string} fallbackMsg - Default message to show if none found
 * @returns {string} - The formatted error message
 */
export const getErrorMessage = (error, fallbackMsg = "Failed to process request") => {
  if (!error) return fallbackMsg;
  
  // If it's already a string, return it
  if (typeof error === 'string') return error;

  // Handle Axios error structure
  if (error.response) {
    // Server responded with a non-2xx status
    const data = error.response.data;
    
    // Check for message in various common locations
    let msg = data?.message || "";
    let detail = data?.error || data?.details || "";

    if (msg && detail) {
      const detailStr = typeof detail === 'string' ? detail : JSON.stringify(detail);
      // Avoid duplicating the message if detail contains it
      if (detailStr.includes(msg)) return detailStr;
      return `${msg} (${detailStr})`;
    }
    
    if (msg) return msg;
    if (detail) return typeof detail === 'string' ? detail : JSON.stringify(detail);
    if (typeof data === 'string') return data;
    
    // Status-specific fallbacks
    if (error.response.status === 401) return "Unauthorized. Please login again.";
    if (error.response.status === 403) return "You don't have permission to perform this action.";
    if (error.response.status === 404) return "Requested resource not found.";
    if (error.response.status === 500) return "Internal Server Error. Please contact administrator.";
  } else if (error.request) {
    // Request was made but no response (Network issues)
    return "Network error. Please check your connection to the server.";
  } else if (error.message) {
    // Something happened setting up the request
    return error.message;
  }

  return fallbackMsg;
};
