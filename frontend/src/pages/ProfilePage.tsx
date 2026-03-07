import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Spin, Typography, message } from 'antd';
import { cabinetApi } from '../api/cabinet';
import { useAuthStore } from '../store/authStore';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const storedUser = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await cabinetApi.getProfile();
        setUser(profile);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setPhone(profile.phone || '');
        setEmail(profile.email);
        setCreatedAt(profile.createdAt);
      } catch (error: any) {
        if (storedUser) {
          setFirstName(storedUser.firstName);
          setLastName(storedUser.lastName);
          setPhone(storedUser.phone || '');
          setEmail(storedUser.email);
          setCreatedAt(storedUser.createdAt);
        } else {
          message.error(error.response?.data?.message || 'Не удалось загрузить профиль');
        }
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [setUser, storedUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProfile = await cabinetApi.updateProfile({ firstName, lastName, phone });
      setUser(updatedProfile);
      setEmail(updatedProfile.email);
      setCreatedAt(updatedProfile.createdAt);
      message.success('Профиль обновлён');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Title level={2}>Профиль</Title>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Email">{email}</Descriptions.Item>
          <Descriptions.Item label="Дата регистрации">{new Date(createdAt).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Редактирование профиля" style={{ borderRadius: 16 }}>
        <Form layout="vertical">
          <Form.Item label="Имя" required>
            <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </Form.Item>
          <Form.Item label="Фамилия" required>
            <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </Form.Item>
          <Form.Item label="Телефон">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </Form.Item>
          <Button type="primary" loading={saving} onClick={handleSave}>Сохранить изменения</Button>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
