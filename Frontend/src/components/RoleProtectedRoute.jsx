import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RoleProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/",
}) => {
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific roles required, just check authentication
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in allowed roles
  const userRole = user?.role || "user";
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
