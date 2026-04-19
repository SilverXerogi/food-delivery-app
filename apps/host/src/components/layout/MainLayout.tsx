import React, { Suspense, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Space, Dropdown, Avatar, Badge } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShopOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);

  const [currentRoute, setCurrentRoute] = useState<string>('catalog');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/catalog')) {
      setCurrentRoute('catalog');
    } else if (path.includes('/cabinet')) {
      setCurrentRoute('cabinet');
    } else if (path.includes('/profile')) {
      setCurrentRoute('profile');
    } else if (path.includes('/orders')) {
      setCurrentRoute('orders');
    }
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'catalog',
      icon: <ShopOutlined />,
      label: 'Каталог',
      onClick: () => navigate('/catalog'),
    },
    {
      key: 'cabinet',
      icon: <HomeOutlined />,
      label: 'Личный кабинет',
      onClick: () => navigate('/cabinet'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Заказы',
      onClick: () => navigate('/orders'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выход',
      onClick: handleLogout,
    },
  ];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', textDecoration: 'none' }}>
            🛒 Food Delivery
          </Link>

          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[currentRoute]}
            items={menuItems}
            style={{ border: 'none', flex: 1 }}
          />
        </div>

        <Space size="large">
          <Badge count={totalItems}>
            <Button type="text" icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')} />
          </Badge>

          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<Avatar icon={<UserOutlined />} />}>
                {user.name || user.email}
              </Button>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              Войти
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 128px)' }}>
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>}>
          <Outlet />
        </Suspense>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: '#fff',
          padding: '40px 20px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ marginBottom: '12px', color: '#262626' }}>О компании</h3>
              <p style={{ color: '#595959', lineHeight: '1.8' }}>
                Food Delivery — сервис доставки свежих продуктов питания прямо к вашему столу.
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '12px', color: '#262626' }}>Контакты</h3>
              <div style={{ color: '#595959', lineHeight: '1.8' }}>
                <div>📞 +7 (495) 123-45-67</div>
                <div>✉️ info@fooddelivery.ru</div>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '12px', color: '#262626' }}>Мы в соцсетях</h3>
              <div style={{ display: 'flex', gap: '16px', fontSize: '20px' }}>
                <a href="#" style={{ color: '#1890ff' }}>Facebook</a>
                <a href="#" style={{ color: '#1890ff' }}>Instagram</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', color: '#8c8c8c' }}>
            <p>© 2026 Food Delivery. Все права защищены.</p>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
