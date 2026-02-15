import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Регистрация успешна!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <h1>Регистрация</h1>
          <p>Создайте новый аккаунт</p>
        </div>

        <Form name="register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя" />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Введите фамилию' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Фамилия" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="Телефон (необязательно)" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Минимум 6 символов' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
