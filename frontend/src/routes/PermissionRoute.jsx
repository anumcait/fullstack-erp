import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PermissionRoute = ({ children, permission, fallback = '/unauthorized' }) => {
  const location = useLocation();
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  if (!userName) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Only the canonical ADMIN role bypasses permission checks (must match
  // backend middleware/auth.js). A role like "HR_ADMIN" must NOT bypass —
  // it should be granted access via explicit permissions instead.
  const isAdmin = userRole && userRole.toUpperCase() === 'ADMIN';

  if (isAdmin) {
    return children;
  }

  const hasPermission = userPermissions.includes(permission);

  if (!hasPermission) {
    return <Navigate to={fallback} replace state={{ from: location, requiredPermission: permission }} />;
  }

  return children;
};

export default PermissionRoute;