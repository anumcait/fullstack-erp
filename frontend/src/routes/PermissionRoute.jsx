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

  // Super admin / admin bypass (optional - adjust role names as needed)
  const adminRoles = ['admin', 'superadmin', 'administrator', 'IT'];
  const isAdmin = userRole && adminRoles.some(r => userRole.toLowerCase().includes(r.toLowerCase()));
  
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