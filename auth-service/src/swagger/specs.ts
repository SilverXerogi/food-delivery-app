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

const authResponseSchema = {
  type: 'object',
  required: ['user', 'accessToken', 'refreshToken'],
  properties: {
    user: userSchema,
    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
  },
};

const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'Invalid credentials' },
  },
};

const authSwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description: 'Микросервис авторизации пользователей для Food Delivery App. Отвечает за регистрацию, вход, обновление токена, выход из системы и получение текущего пользователя.',
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local auth service' },
  ],
  tags: [
    { name: 'System', description: 'Служебные методы сервиса' },
    { name: 'Auth', description: 'Регистрация, вход, обновление токена и профиль текущего пользователя' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Проверка состояния сервиса',
        tags: ['System'],
        responses: {
          200: {
            description: 'Сервис доступен',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    service: { type: 'string', example: 'auth-service' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Регистрация пользователя',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Пользователь зарегистрирован',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: errorSchema,
              },
            },
          },
          409: {
            description: 'Пользователь уже существует',
            content: {
              'application/json': {
                schema: errorSchema,
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Вход пользователя',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Успешный вход',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Ошибка валидации',
            content: { 'application/json': { schema: errorSchema } },
          },
          401: {
            description: 'Неверные учётные данные',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Получить текущего пользователя',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Текущий пользователь',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: {
            description: 'Нет токена доступа',
            content: { 'application/json': { schema: errorSchema } },
          },
          403: {
            description: 'Недействительный access token',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Обновить access и refresh токены',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Токены обновлены',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Ошибка валидации',
            content: { 'application/json': { schema: errorSchema } },
          },
          403: {
            description: 'Refresh token недействителен или истёк',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Выйти из системы',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Пользователь вышел из системы',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Нет токена доступа',
            content: { 'application/json': { schema: errorSchema } },
          },
          403: {
            description: 'Недействительный access token',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: userSchema,
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ivan@example.com' },
          password: { type: 'string', minLength: 6, example: 'qwerty123' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ivan@example.com' },
          password: { type: 'string', minLength: 6, example: 'qwerty123' },
          firstName: { type: 'string', minLength: 2, example: 'Иван' },
          lastName: { type: 'string', minLength: 2, example: 'Иванов' },
          phone: { type: 'string', nullable: true, example: '+79991234567' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      AuthResponse: authResponseSchema,
      ErrorResponse: errorSchema,
    },
  },
};

export default authSwaggerSpec;
