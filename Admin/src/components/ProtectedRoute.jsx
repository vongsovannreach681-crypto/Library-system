import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("auth_token");
  const user = JSON.parse(localStorage.getItem("auth_user") || "null");

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
