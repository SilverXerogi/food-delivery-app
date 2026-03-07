import React, { useEffect, useState } from 'react';
import { Card, Collapse, Empty, List, Space, Spin, Tag, Typography, message } from 'antd';
import type { Order } from 'shared-types';
import { cabinetApi } from '../api/cabinet';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  pending: 'gold',
  confirmed: 'blue',
  preparing: 'cyan',
  delivering: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const response = await cabinetApi.getOrders();
        setOrders(response.items);
      } catch (error: any) {
        message.error(error.response?.data?.message || 'Не удалось загрузить заказы');
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  if (orders.length === 0) {
    return <Card style={{ borderRadius: 16 }}><Empty description="У вас пока нет заказов" /></Card>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Мои заказы</Title>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {orders.map((order) => (
          <Card key={order.id} style={{ borderRadius: 16 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                <Title level={4} style={{ margin: 0 }}>Заказ #{order.id.slice(0, 8)}</Title>
                <Tag color={statusColors[order.status] || 'default'}>{order.status}</Tag>
              </Space>
              <Text type="secondary">Создан: {new Date(order.createdAt).toLocaleString()}</Text>
              <Text>Адрес доставки: {order.deliveryAddress}</Text>
              <Text strong>Сумма: {order.totalAmount.toFixed(2)} ₽</Text>
              <Collapse
                items={[
                  {
                    key: 'items',
                    label: 'Состав заказа',
                    children: (
                      <List
                        dataSource={order.items}
                        renderItem={(item) => (
                          <List.Item>
                            <Space direction="vertical" size={0} style={{ width: '100%' }}>
                              <Text strong>{item.productName}</Text>
                              <Text type="secondary">Количество: {item.quantity}</Text>
                            </Space>
                            <Text>{(item.price * item.quantity).toFixed(2)} ₽</Text>
                          </List.Item>
                        )}
                      />
                    ),
                  },
                ]}
              />
            </Space>
          </Card>
        ))}
      </Space>
    </div>
  );
};

export default OrdersPage;
