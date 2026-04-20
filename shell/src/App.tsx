import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const Login = React.lazy(() => import("auth/Login"));
const Register = React.lazy(() => import("auth/Register"));
const HomePage = React.lazy(() => import("catalog/HomePage"));
const CartPage = React.lazy(() => import("catalog/CartPage"));
const OrdersPage = React.lazy(() => import("catalog/OrdersPage"));
const ProfilePage = React.lazy(() => import("catalog/ProfilePage"));

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <>
      <nav style={{ display: "flex", gap: 10 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
      </nav>

      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* публичные */}
          <Route
            path="/login"
            element={
              <Login onSuccess={() => navigate("/")} />
            }
          />

          <Route
            path="/register"
            element={
              <Register onSuccess={() => navigate("/login")} />
            }
          />

          {/* защищённые */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </React.Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}