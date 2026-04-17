import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Collapse, Empty, List, Space, Spin, Tag, Typography } from 'antd';
import { useStore } from '../store'; // Импорт MobX store

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  pending: 'gold',
  confirmed: 'blue',
  preparing: 'cyan',
  delivering: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const OrdersPage: React.FC = observer(() => { // Обернули компонент в observer
  const { authStore, orderStore } = useStore(); // Получаем MobX stores (предполагаем, что есть orderStore)

  useEffect(() => {
    // Загрузка заказов при монтировании компонента, если пользователь авторизован
    if (authStore.isAuthenticated && orderStore.orders.length === 0) {
      orderStore.loadOrders();
    }
  }, []);

  // Данные из orderStore
  const orders = orderStore.orders; // или orderStore.filteredOrders, в зависимости от логики
  const isLoading = orderStore.loading;
  const error = orderStore.error;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Text type="danger">Ошибка загрузки заказов: {error}</Text>
        <br />
        <button onClick={() => orderStore.loadOrders()}>Попробовать снова</button> {/* Вызов метода из store */}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card style={{ borderRadius: 16 }}>
        <Empty description="У вас пока нет заказов" />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Мои заказы</Title>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {orders.map((order) => (
          <Card key={order.id} style={{ borderRadius: 16 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                <Title level={4} style={{ margin: 0 }}>
                  Заказ #{order.id.slice(0, 8)}
                </Title>
                <Tag color={statusColors[order.status] || 'default'}>
                  {order.status}
                </Tag>
              </Space>

              <Text type="secondary">
                Создан: {new Date(order.createdAt).toLocaleString()}
              </Text>

              <Text>Адрес доставки: {order.deliveryAddress}</Text>

              <Text strong>
                Сумма: {order.totalAmount.toFixed(2)} ₽
              </Text>

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
                              <Text type="secondary">
                                Количество: {item.quantity}
                              </Text>
                            </Space>
                            <Text>
                              {(item.price * item.quantity).toFixed(2)} ₽
                            </Text>
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
});

export default OrdersPage;