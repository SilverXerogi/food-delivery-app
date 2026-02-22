import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Badge, Space, Layout } from 'antd';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AntHeader style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
          🛒 Food Delivery
        </Link>
        
        <Space size="large">
          <Link to="/" style={{ color: '#595959', textDecoration: 'none' }}>
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/orders" style={{ color: '#595959', textDecoration: 'none' }}>
                Мои заказы
              </Link>
              <Link to="/profile" style={{ color: '#595959', textDecoration: 'none' }}>
                Профиль
              </Link>
            </>
          )}
        </Space>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <Badge count={totalItems} size="small">
              <Link to="/cart">
                <Button 
                  icon={<ShoppingCartOutlined />} 
                  type="text"
                  size="large"
                >
                  Корзина
                </Button>
              </Link>
            </Badge>
            
            <Space>
              <Button 
                icon={<UserOutlined />} 
                type="text"
                size="large"
              >
                {user?.firstName || 'Профиль'}
              </Button>
              
              <Button 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                type="text"
                size="large"
              >
                Выйти
              </Button>
            </Space>
          </>
        ) : (
          <Space>
            <Button 
              icon={<LoginOutlined />} 
              onClick={() => navigate('/login')}
            >
              Войти
            </Button>
            
            <Button 
              type="primary" 
              onClick={() => navigate('/register')}
            >
              Регистрация
            </Button>
          </Space>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;