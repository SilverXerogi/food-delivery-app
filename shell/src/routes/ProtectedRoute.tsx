import React from "react";
import { useAppSelector } from "../store/hooks";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const isAuth = Boolean(accessToken);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};