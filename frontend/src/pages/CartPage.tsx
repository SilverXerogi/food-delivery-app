import React, { useMemo, useState } from 'react';
import { Button, Card, Empty, Form, Input, InputNumber, List, Space, Typography, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { cabinetApi } from '../api/cabinet';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateOrder = async () => {
    if (items.length === 0) {
      message.info('Корзина пуста');
      return;
    }
    if (deliveryAddress.trim().length < 5) {
      message.error('Укажите адрес доставки');
      return;
    }

    setSubmitting(true);
    try {
      await cabinetApi.createOrder({
        deliveryAddress,
        comment,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      clearCart();
      message.success('Заказ успешно создан');
      navigate('/orders');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Не удалось создать заказ');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card style={{ maxWidth: 900, margin: '0 auto', borderRadius: 16 }}>
        <Empty description="Корзина пока пуста">
          <Button type="primary" onClick={() => navigate('/')}>Перейти в каталог</Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Корзина</Title>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card style={{ borderRadius: 16 }}>
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <InputNumber
                    key="quantity"
                    min={1}
                    value={item.quantity}
                    onChange={(value) => updateItemQuantity(item.id, Number(value ?? 1))}
                  />,
                  <Button key="remove" icon={<DeleteOutlined />} danger onClick={() => removeItem(item.id)} />,
                ]}
              >
                <List.Item.Meta
                  avatar={item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12 }} /> : undefined}
                  title={item.productName}
                  description={
                    <Space direction="vertical" size={0}>
                      {item.weight && <Text type="secondary">{item.weight}</Text>}
                      <Text>{item.price.toFixed(2)} ₽ за единицу</Text>
                    </Space>
                  }
                />
                <div style={{ minWidth: 120, textAlign: 'right' }}>
                  <Text strong>{(item.price * item.quantity).toFixed(2)} ₽</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card title="Оформление заказа" style={{ borderRadius: 16 }}>
          <Form layout="vertical">
            <Form.Item label="Адрес доставки" required>
              <Input
                placeholder="Например, г. Калуга, ул. Ленина, д. 10, кв. 5"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
              />
            </Form.Item>
            <Form.Item label="Комментарий к заказу">
              <Input.TextArea
                rows={4}
                placeholder="Код домофона, пожелания по звонку и т.п."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </Form.Item>
            <Paragraph>
              <Text strong>Итого к оплате: {totalAmount.toFixed(2)} ₽</Text>
            </Paragraph>
            <Button type="primary" size="large" loading={submitting} onClick={handleCreateOrder}>
              Оформить заказ
            </Button>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default CartPage;
