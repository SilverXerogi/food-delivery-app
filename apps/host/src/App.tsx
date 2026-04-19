import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Компоненты авторизации
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Основной layout
import MainLayout from './components/layout/MainLayout';

// Защищённый маршрут
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // В реальном приложении здесь будет проверка из Redux store
  const isAuthenticated = true; // Заглушка для демонстрации

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Страницы-заглушки для микрофронтендов
const CatalogPage: React.FC = () => (
  <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
    <h2>Каталог товаров (Microfrontend)</h2>
    <p>Здесь будет загружен каталог из catalog-mfe</p>
    <Suspense fallback={<div>Загрузка каталога...</div>}>
      {/* <CatalogMfe /> */}
    </Suspense>
  </div>
);

const CabinetPage: React.FC = () => (
  <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
    <h2>Личный кабинет (Microfrontend)</h2>
    <p>Здесь будет загружен кабинет из cabinet-mfe</p>
    <Suspense fallback={<div>Загрузка кабинета...</div>}>
      {/* <CabinetMfe /> */}
    </Suspense>
  </div>
);

const CartPage: React.FC = () => (
  <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
    <h2>Корзина</h2>
    <p>Страница корзины</p>
  </div>
);

const ProfilePage: React.FC = () => (
  <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
    <h2>Профиль пользователя</h2>
    <p>Страница профиля</p>
  </div>
);

const OrdersPage: React.FC = () => (
  <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
    <h2>Мои заказы</h2>
    <p>Страница заказов</p>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>404</h1>
    <p>Страница не найдена</p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Защищённые маршруты с основным layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/catalog" replace />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="cabinet" element={<CabinetPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="orders" element={<OrdersPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
