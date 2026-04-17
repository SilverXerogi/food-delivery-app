import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import type { Product } from 'shared-types';
import { useStore } from '../store'; // Импорт MobX store

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = observer(() => { // Обернули компонент в observer
  const { productStore, authStore, cartStore } = useStore(); // Получаем MobX stores

  // Данные из productStore
  const products = productStore.filteredProducts; // или productStore.products, в зависимости от логики
  const isLoading = productStore.loading;
  const error = productStore.error;

  // Данные из authStore
  const isAuthenticated = authStore.isAuthenticated;

  const categoryOptions = productStore.categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  React.useEffect(() => {
    if (productStore.products.length === 0) {
      productStore.loadProducts({ limit: 24 });
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      message.info('Сначала войдите в аккаунт, чтобы оформить заказ');
      return;
    }

    cartStore.addItem(product, 1); // Вызываем метод из MobX store

    message.success(`${product.name} добавлен в корзину`);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Text type="danger">Ошибка загрузки каталога: {error}</Text>
        <br />
        <Button onClick={() => productStore.loadProducts({ limit: 24 })}>Попробовать снова</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24, borderRadius: 16 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Личный кабинет системы доставки продуктов питания
        </Title>
        <Paragraph style={{ fontSize: 16, marginBottom: 0 }}>
          Каталог, корзина, оформление заказа и личный кабинет теперь работают через отдельные backend-сервисы.
        </Paragraph>
      </Card>

      {!isAuthenticated && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          message="Для оформления заказа нужна авторизация"
          description="Каталог доступен всем, но корзина и создание заказа требуют авторизации."
        />
      )}

      <Card style={{ marginBottom: 24, borderRadius: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            allowClear
            placeholder="Поиск по названию или описанию"
            style={{ width: 320 }}
            value={productStore.search}
            onChange={(e) => productStore.setSearch(e.target.value)} // Устанавливаем в store
          />
          <Select
            allowClear
            placeholder="Категория"
            style={{ width: 220 }}
            value={productStore.category || undefined}
            onChange={(value) => productStore.setCategory(value || null)} // Устанавливаем в store
            options={categoryOptions}
          />
        </Space>
      </Card>

      {products.length === 0 ? (
        <Empty description="Продукты не найдены" />
      ) : (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
              <Card
                hoverable
                style={{ height: '100%', borderRadius: 16 }}
                cover={
                  product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ height: 180, objectFit: 'cover' }}
                    />
                  ) : undefined
                }
                actions={[
                  <Button
                    type="primary"
                    key="add"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    В корзину
                  </Button>,
                ]}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Tag color="blue">{product.categoryName}</Tag>
                    {product.weight && (
                      <Tag>{product.weight} г</Tag>
                    )}
                  </Space>

                  <Title level={4} style={{ margin: 0 }}>
                    {product.name}
                  </Title>

                  <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                    {product.description}
                  </Paragraph>

                  <Text strong style={{ fontSize: 18 }}>
                    {product.price.toFixed(2)} ₽
                  </Text>

                  {!product.inStock && (
                    <Tag color="red">Нет в наличии</Tag>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
});

export default HomePage;