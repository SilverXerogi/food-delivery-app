import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Space,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
  updateItemQuantity,
  removeItem,
  clearCart,
} from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.cart.items);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [items]
  );

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    dispatch(updateItemQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
    message.success('Товар удален из корзины');
  };

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
      dispatch(clearCart());
      message.success('Заказ успешно создан');
      navigate('/orders');
    } catch (error: any) {
      message.error(error.message || 'Не удалось создать заказ');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card style={{ maxWidth: 900, margin: '0 auto', borderRadius: 16 }}>
        <Empty description="Корзина пока пуста">
          <Button type="primary" onClick={() => navigate('/')}>
            Перейти в каталог
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Корзина</Title>

      {/* ✅ FIX */}
      <Space direction="vertical" style={{ width: '100%' }}>
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
                    onChange={(value) =>
                      handleUpdateQuantity(
                        item.id,
                        Number(value ?? 1)
                      )
                    }
                  />,
                  <Button
                    key="remove"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleRemoveItem(item.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: 'cover',
                          borderRadius: 12,
                        }}
                      />
                    ) : undefined
                  }
                  title={item.productName}
                  description={
                    <Space direction="vertical" size={0}>
                      {item.weight && (
                        <Text type="secondary">
                          {item.weight}
                        </Text>
                      )}
                      <Text>
                        {item.price.toFixed(2)} ₽ за единицу
                      </Text>
                    </Space>
                  }
                />
                <div style={{ minWidth: 120, textAlign: 'right' }}>
                  <Text strong>
                    {(item.price * item.quantity).toFixed(2)} ₽
                  </Text>
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
                onChange={(e) =>
                  setDeliveryAddress(e.target.value)
                }
              />
            </Form.Item>

            <Form.Item label="Комментарий к заказу">
              <Input.TextArea
                rows={4}
                placeholder="Код домофона, пожелания по звонку и т.п."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Item>

            <Paragraph>
              <Text strong>
                Итого к оплате: {totalAmount.toFixed(2)} ₽
              </Text>
            </Paragraph>

            <Button
              type="primary"
              size="large"
              loading={submitting}
              onClick={handleCreateOrder}
            >
              Оформить заказ
            </Button>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default CartPage;