import { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Row, Col, Typography,
  Avatar, Tag, Divider, message, Descriptions,
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';
import { usersApi } from '@/api/users';

const { Title, Text } = Typography;

export function ProfilePage() {
  const { user, loadUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (values: any) => {
    setProfileLoading(true);
    try {
      await usersApi.updateProfile(values);
      await loadUser();
      message.success('Профиль обновлён');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка обновления');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setPasswordLoading(true);
    try {
      await usersApi.updateProfile({ password: values.password });
      passwordForm.resetFields();
      message.success('Пароль изменён');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка смены пароля');
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleDisplayNames: Record<string, string> = {
    admin: 'Администратор',
    director: 'Директор',
    manager: 'Менеджер',
    support: 'Сотрудник ТП',
    sales: 'Продавец',
    marketer: 'Маркетолог',
    client: 'Клиент',
    partner: 'Партнёр',
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Мой профиль</Title>
        <Text type="secondary">Управление вашими данными</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff', marginBottom: 16 }} />
              <Title level={4} style={{ marginBottom: 4 }}>
                {user?.firstName} {user?.lastName}
              </Title>
              <Text type="secondary">{user?.email}</Text>
              <Divider />
              <div>
                <Text type="secondary">Роли:</Text>
                <div style={{ marginTop: 8 }}>
                  {user?.roles?.map((role) => (
                    <Tag key={role} color="blue" style={{ marginBottom: 4 }}>
                      {roleDisplayNames[role] || role}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Личные данные" style={{ marginBottom: 24 }}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    label="Имя"
                    rules={[{ required: true, message: 'Введите имя' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    label="Фамилия"
                    rules={[{ required: true, message: 'Введите фамилию' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="phone" label="Телефон">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading}>
                  Сохранить изменения
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Смена пароля">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="password"
                label="Новый пароль"
                rules={[
                  { required: true, message: 'Введите новый пароль' },
                  { min: 6, message: 'Минимум 6 символов' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Подтвердите пароль"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Подтвердите пароль' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Пароли не совпадают'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordLoading}>
                  Изменить пароль
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
