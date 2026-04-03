import React from 'react';
import { Layout } from 'antd';
import { FacebookOutlined, InstagramOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center',
      background: '#fff',
      padding: '40px 20px',
      marginTop: 'auto',
    }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <PhoneOutlined />
                <span>+7 (495) 123-45-67</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MailOutlined />
                <span>info@fooddelivery.ru</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '12px', color: '#262626' }}>Мы в соцсетях</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: '#1890ff', fontSize: '20px' }}>
                <FacebookOutlined />
              </a>
              <a href="#" style={{ color: '#1890ff', fontSize: '20px' }}>
                <InstagramOutlined />
              </a>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', color: '#8c8c8c' }}>
          <p>© 2026 Food Delivery. Все права защищены.</p>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;