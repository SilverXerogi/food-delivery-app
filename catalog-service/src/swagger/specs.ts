const productSchema = {
  type: 'object',
  required: ['id', 'name', 'description', 'price', 'categoryId', 'categoryName', 'categoryKey', 'inStock'],
  properties: {
    id: { type: 'string', format: 'uuid', example: '0fcb2f2c-43d7-4c8b-a0d0-9b5f743d8c37' },
    name: { type: 'string', example: 'Молоко 2.5%' },
    description: { type: 'string', example: 'Свежайшее пастеризованное молоко' },
    price: { type: 'number', format: 'float', example: 99.9 },
    imageUrl: { type: 'string', nullable: true, example: 'https://example.com/images/milk.jpg' },
    categoryId: { type: 'string', format: 'uuid', example: 'c6af3f0c-18f4-4c1a-b524-24a9b7a71ce1' },
    categoryName: { type: 'string', example: 'Молочные продукты' },
    categoryKey: {
      type: 'string',
      enum: ['vegetables', 'fruits', 'dairy', 'meat', 'bakery', 'beverages', 'snacks', 'other'],
      example: 'dairy',
    },
    inStock: { type: 'boolean', example: true },
    weight: { type: 'string', nullable: true, example: '930 мл' },
  },
};

const catalogSwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Catalog Service API',
    version: '1.0.0',
    description: 'Микросервис каталога продуктов. Возвращает список товаров и карточку товара по идентификатору.',
  },
  servers: [{ url: 'http://localhost:3002', description: 'Local catalog service' }],
  tags: [
    { name: 'System', description: 'Служебные методы сервиса' },
    { name: 'Products', description: 'Каталог продуктов' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Проверка состояния сервиса',
        responses: {
          200: {
            description: 'Сервис доступен',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    service: { type: 'string', example: 'catalog-service' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Получить список продуктов',
        parameters: [
          { in: 'query', name: 'search', description: 'Поиск по названию и описанию', schema: { type: 'string' } },
          { in: 'query', name: 'categoryId', description: 'UUID категории', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', description: 'Номер страницы', schema: { type: 'integer', default: 1, minimum: 1 } },
          { in: 'query', name: 'limit', description: 'Размер страницы', schema: { type: 'integer', default: 12, minimum: 1, maximum: 50 } },
        ],
        responses: {
          200: {
            description: 'Список продуктов',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GetProductsResponse' },
              },
            },
          },
          500: {
            description: 'Внутренняя ошибка сервера',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Получить продукт по идентификатору',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Продукт найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          404: {
            description: 'Продукт не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Внутренняя ошибка сервера',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: productSchema,
      GetProductsResponse: {
        type: 'object',
        required: ['items', 'total', 'page', 'limit'],
        properties: {
          items: {
            type: 'array',
            items: productSchema,
          },
          total: { type: 'integer', example: 24 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 12 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    },
  },
};

export default catalogSwaggerSpec;
