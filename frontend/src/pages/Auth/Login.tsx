import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { LoginResponse } from 'shared-types';
import { authApi } from '../../api/auth';

const { Title, Text } = Typography;

// Валидация с Zod
const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response: LoginResponse = await authApi.login(data);
      
      // Сохраняем данные пользователя
      login(
        response.user, 
        response.accessToken, 
        response.refreshToken
      );
      
      message.success('Добро пожаловать!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка авторизации';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 120px)',
      padding: '20px',
    }}>
      <Card 
        style={{ width: '100%', maxWidth: '400px' }}
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>Вход</Title>
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
              loading={isSubmitting}
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
};

export default LoginPage;