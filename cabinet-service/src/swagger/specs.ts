const userSchema = {
  type: 'object',
  required: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid', example: 'a3f2d8f0-0b22-47bf-ae94-91f7e80ad4c7' },
    email: { type: 'string', format: 'email', example: 'ivan@example.com' },
    firstName: { type: 'string', example: 'Иван' },
    lastName: { type: 'string', example: 'Иванов' },
    phone: { type: 'string', nullable: true, example: '+79991234567' },
    role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
    createdAt: { type: 'string', format: 'date-time', example: '2026-03-07T08:00:00.000Z' },
  },
};

const orderItemSchema = {
  type: 'object',
  required: ['productId', 'productName', 'price', 'quantity'],
  properties: {
    productId: { type: 'string', format: 'uuid', example: 'c0bd8f8d-f8f1-434f-9a69-62fcbf26cf2e' },
    productName: { type: 'string', example: 'Бананы' },
    price: { type: 'number', format: 'float', example: 129.9 },
    quantity: { type: 'integer', example: 2 },
    weight: { type: 'string', nullable: true, example: '1 кг' },
  },
};

const orderSchema = {
  type: 'object',
  required: ['id', 'userId', 'items', 'totalAmount', 'deliveryAddress', 'status', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string', format: 'uuid', example: 'd59acb73-c8da-4f2f-825b-c4a77cc13f01' },
    userId: { type: 'string', format: 'uuid', example: 'a3f2d8f0-0b22-47bf-ae94-91f7e80ad4c7' },
    items: { type: 'array', items: orderItemSchema },
    totalAmount: { type: 'number', format: 'float', example: 389.7 },
    deliveryAddress: { type: 'string', example: 'г. Москва, ул. Пушкина, д. 10, кв. 5' },
    status: {
      type: 'string',
      enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
      example: 'pending',
    },
    comment: { type: 'string', nullable: true, example: 'Позвонить за 10 минут до доставки' },
    createdAt: { type: 'string', format: 'date-time', example: '2026-03-07T10:15:00.000Z' },
    updatedAt: { type: 'string', format: 'date-time', example: '2026-03-07T10:15:00.000Z' },
  },
};

const cabinetSwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Cabinet Service API',
    version: '1.0.0',
    description: 'Микросервис личного кабинета пользователя и заказов. Возвращает профиль пользователя, историю заказов, детали заказа и позволяет создать новый заказ.',
  },
  servers: [{ url: 'http://localhost:3003', description: 'Local cabinet service' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: userSchema,
      OrderItem: orderItemSchema,
      Order: orderSchema,
      UpdateProfileRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          firstName: { type: 'string', minLength: 2, example: 'Иван' },
          lastName: { type: 'string', minLength: 2, example: 'Иванов' },
          phone: { type: 'string', nullable: true, example: '+79991234567' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['deliveryAddress', 'items'],
        properties: {
          deliveryAddress: { type: 'string', minLength: 5, example: 'г. Москва, ул. Ленина, д. 1' },
          comment: { type: 'string', nullable: true, example: 'Оставить у двери' },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'string', format: 'uuid', example: 'c0bd8f8d-f8f1-434f-9a69-62fcbf26cf2e' },
                quantity: { type: 'integer', minimum: 1, example: 2 },
              },
            },
          },
        },
      },
      CreateOrderResponse: {
        type: 'object',
        required: ['order'],
        properties: {
          order: orderSchema,
        },
      },
      GetOrdersResponse: {
        type: 'object',
        required: ['items', 'total', 'page', 'limit'],
        properties: {
          items: { type: 'array', items: orderSchema },
          total: { type: 'integer', example: 2 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Order not found' },
        },
      },
    },
  },
  tags: [
    { name: 'System', description: 'Служебные методы сервиса' },
    { name: 'Cabinet', description: 'Профиль пользователя и его заказы' },
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
                    service: { type: 'string', example: 'cabinet-service' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/cabinet/profile': {
      get: {
        summary: 'Получить профиль пользователя',
        tags: ['Cabinet'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Профиль пользователя',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: { description: 'Нет токена доступа', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Недействительный access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Пользователь не найден', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      patch: {
        summary: 'Обновить профиль пользователя',
        tags: ['Cabinet'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Профиль обновлён',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          400: { description: 'Ошибка валидации', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Нет токена доступа', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Недействительный access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/cabinet/orders': {
      get: {
        summary: 'Получить список заказов пользователя',
        tags: ['Cabinet'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Список заказов',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GetOrdersResponse' } } },
          },
          401: { description: 'Нет токена доступа', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Недействительный access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      post: {
        summary: 'Создать заказ',
        tags: ['Cabinet'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrderRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Заказ создан',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderResponse' } } },
          },
          400: { description: 'Ошибка валидации или проблема с товарами', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Нет токена доступа', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Недействительный access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/cabinet/orders/{id}': {
      get: {
        summary: 'Получить заказ пользователя по идентификатору',
        tags: ['Cabinet'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Информация о заказе',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
          },
          401: { description: 'Нет токена доступа', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Недействительный access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Заказ не найден', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

export default cabinetSwaggerSpec;
