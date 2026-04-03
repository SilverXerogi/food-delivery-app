import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCartOutlined, UserOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Badge, Space, Layout } from 'antd';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
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
      <div style={{ display: 'flex', alignItems: 'center32px' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
          🛒 Food Delivery
        </Link>
        
        <Space size="large">
          <Link to="/" style={{ color: '#595959', textDecoration: 'none' }}>
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/cart" style={{ color: '#595959', textDecoration: 'none' }}>
                Корзина
              </Link>
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
                />
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