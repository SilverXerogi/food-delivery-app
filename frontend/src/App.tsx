import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import CatalogPage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import { RootState } from './store';

// Защищённый маршрут
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Защищённые маршруты */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <CatalogPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Другие защищённые страницы */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Корзина (в разработке)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Мои заказы (в разработке)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Профиль (в разработке)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;