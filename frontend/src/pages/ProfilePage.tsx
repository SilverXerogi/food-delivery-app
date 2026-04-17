import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Card, Descriptions, Form, Input, Spin, Typography, message } from 'antd';
import { useStore } from '../store'; // Импорт MobX store

const { Title } = Typography;

const ProfilePage: React.FC = observer(() => { // Обернули компонент в observer
  const { authStore } = useStore(); // Получаем MobX store

  // Данные из authStore
  const { user, loading: authLoading } = authStore;

  const [localFirstName, setLocalFirstName] = useState('');
  const [localLastName, setLocalLastName] = useState('');
  const [localPhone, setLocalPhone] = useState('');

  // Состояние сохранения
  const [saving, setSaving] = useState(false);

  // Загружаем профиль при монтировании
  useEffect(() => {
    if (authStore.isAuthenticated && !authStore.user) {
      authStore.loadProfile(); // Предполагаем, что такой метод есть в authStore
    }
  }, []);

  // Обновляем локальные состояния при изменении данных в store
  useEffect(() => {
    if (user) {
      setLocalFirstName(user.firstName || '');
      setLocalLastName(user.lastName || '');
      setLocalPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Вызываем метод из store для обновления профиля
      await authStore.updateProfile({
        firstName: localFirstName,
        lastName: localLastName,
        phone: localPhone,
      });
      message.success('Профиль обновлён');
    } catch (error: any) {
      message.error(error.message || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  // Состояние загрузки из store
  const loading = authLoading || (!user && authStore.isAuthenticated);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div>Профиль недоступен</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Title level={2}>Профиль</Title>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Дата регистрации">
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Редактирование профиля" style={{ borderRadius: 16 }}>
        <Form layout="vertical">
          <Form.Item label="Имя" required>
            <Input
              value={localFirstName}
              onChange={(event) => setLocalFirstName(event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Фамилия" required>
            <Input
              value={localLastName}
              onChange={(event) => setLocalLastName(event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Телефон">
            <Input
              value={localPhone}
              onChange={(event) => setLocalPhone(event.target.value)}
            />
          </Form.Item>
          <Button type="primary" loading={saving} onClick={handleSave}>
            Сохранить изменения
          </Button>
        </Form>
      </Card>
    </div>
  );
});

export default ProfilePage;