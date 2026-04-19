import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { LoginResponse, RegisterRequest } from 'shared-types';
import { login } from '../../store/authSlice';
import { useRegisterMutation } from '../../store/api';

const { Title, Text } = Typography;

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
    lastName: z.string().min(2, 'Фамилия должна быть не менее 2 символов'),
    email: z.string().email('Неверный формат email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [registerMutation, { isLoading }] = useRegisterMutation();

  // ✅ FIX
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...userData } = data;

      const response: LoginResponse = await registerMutation(
        userData as RegisterRequest
      ).unwrap();

      dispatch(
        login({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        })
      );

      message.success('Регистрация успешна!');
      navigate('/');
    } catch (error: unknown) {
      const err = error as any;
      const errorMessage = err?.data?.message || 'Ошибка регистрации';
      message.error(errorMessage);
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
        style={{ width: '100%', maxWidth: '450px' }}
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Регистрация
            </Title>
            <Text type="secondary">Создайте новый аккаунт</Text>
          </div>
        }
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Имя"
            required
            validateStatus={errors.firstName ? 'error' : ''}
            help={errors.firstName?.message}
          >
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="Введите ваше имя"
                  size="large"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Фамилия"
            required
            validateStatus={errors.lastName ? 'error' : ''}
            help={errors.lastName?.message}
          >
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="Введите вашу фамилию"
                  size="large"
                />
              )}
            />
          </Form.Item>

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
            label="Телефон"
            validateStatus={errors.phone ? 'error' : ''}
            help={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<PhoneOutlined />}
                  placeholder="+7 (999) 123-45-67"
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

          <Form.Item
            label="Подтверждение пароля"
            required
            validateStatus={errors.confirmPassword ? 'error' : ''}
            help={errors.confirmPassword?.message}
          >
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Повторите пароль"
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
              loading={isLoading}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              Уже есть аккаунт?{' '}
              <Link to="/login" style={{ color: '#1890ff' }}>
                Войти
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;