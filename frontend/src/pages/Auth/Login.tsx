import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { LoginRequest, LoginResponse } from 'shared-types';
import { useStore } from '../../store'; // Импорт MobX store
import { authApi } from '../../api/auth'; // Импорт API для вызова

const { Title, Text } = Typography;

const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = observer(() => { // Обернули компонент в observer
  const navigate = useNavigate();
  const { authStore } = useStore(); // Получаем MobX store

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Вызываем метод из MobX store, передав ему данные
    await authStore.login(data as LoginRequest);

    // Проверяем, успешен ли логин (проверяем наличие пользователя или токена)
    if (authStore.user) {
      message.success('Добро пожаловать!');
      navigate('/');
    } else {
      // Ошибка уже установлена в store, можно показать её
      message.error(authStore.error || 'Ошибка авторизации');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '20px',
      }}
    >
      <Card
        style={{ width: '100%', maxWidth: '400px' }}
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Вход
            </Title>
            <Text type="secondary">Войдите в свой аккаунт</Text>
          </div>
        }
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Email"
            required
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<MailOutlined />}
                  placeholder="Введите ваш email"
                  size="large"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Пароль"
            required
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Введите пароль"
                  size="large"
                />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={authStore.loading} // Используем состояние загрузки из MobX store
            >
              Войти
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              Нет аккаунта?{' '}
              <Link to="/register" style={{ color: '#1890ff' }}>
                Зарегистрироваться
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
});

export default LoginPage;