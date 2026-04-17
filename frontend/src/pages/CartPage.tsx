import React, { useState } from 'react'; // ✅ Импортирован useState
import { observer } from 'mobx-react-lite'; // ✅ Импортирован observer
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
import { useStore } from '../store'; // 
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const CartPage = observer(() => { // 
  const navigate = useNavigate();
  const { cartStore } = useStore(); // 

  const [deliveryAddress, setDeliveryAddress] = useState(''); 
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Данные теперь из MobX store
  const items = cartStore.items;
  const totalAmount = cartStore.totalAmount; // @computed значение из store

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    cartStore.updateItemQuantity(id, quantity); // Вызываем метод из MobX store
  };

  const handleRemoveItem = (id: string) => {
    cartStore.removeItem(id); // Вызываем метод из MobX store
    message.success('Товар удален из корзины');
  };

  const handleCreateOrder = async () => {
    if (cartStore.isEmpty) { // Используем @computed значение из store
      message.info('Корзина пуста');
      return;
    }

    if (deliveryAddress.trim().length < 5) {
      message.error('Укажите адрес доставки');
      return;
    }

    setSubmitting(true);
    try {
      await cartStore.createOrder(deliveryAddress, comment); // Вызываем асинхронный метод из store
      message.success('Заказ успешно создан');
      navigate('/orders');
    } catch (error: any) {
      message.error(error.message || 'Не удалось создать заказ');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartStore.isEmpty) { // Используем @computed значение из store
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
                Итого к оплате: {totalAmount.toFixed(2)} ₽ {/* Из MobX store */}
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
});

export default CartPage;