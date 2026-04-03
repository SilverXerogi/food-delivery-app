import React, { useMemo, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import type { Product, GetProductsParams } from 'shared-types';
import { useGetProductsQuery } from '../store/api';
import { addItem } from '../store/cartSlice';
import { RootState } from '../store';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const params: GetProductsParams = {
    limit: 24,
    search: search || undefined,
    categoryId: category || undefined,
  };

  const { data, error, isLoading, refetch } = useGetProductsQuery(params);

  const products = data?.items || [];

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) =>
      map.set(product.categoryId, product.categoryName)
    );
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];

    return products.filter((product) => {
      const matchesCategory =
        !category || product.categoryId === category;

      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        `${product.name} ${product.description}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category, data]);

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      message.info('Сначала войдите в аккаунт, чтобы оформить заказ');
      return;
    }

    dispatch(
      addItem({
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        price: product.price,
        quantity: 1,
        weight: product.weight,
      })
    );

    message.success(`${product.name} добавлен в корзину`);
  };

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Text type="danger">Ошибка загрузки каталога</Text>
        <br />
        <Button onClick={() => refetch()}>Попробовать снова</Button>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            allowClear
            placeholder="Категория"
            style={{ width: 220 }}
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
        </Space>
      </Card>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Empty description="Продукты не найдены" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProducts.map((product) => (
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
};

export default HomePage;