import React from "react";

import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {

  const admin = localStorage.getItem("admin");
  if (admin) {
    return true;
  } else {
    return false;
  }
};

const AdminAccess = (props) => {
  const auth = useAuth();

  return auth ? <Outlet /> : <Navigate to="/" />;
};

export default AdminAccess;
