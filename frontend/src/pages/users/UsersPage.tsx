import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Modal, Form,
  Select, Switch, message, Popconfirm, Typography, Avatar,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, UserOutlined, CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { usersApi, User, UsersResponse } from '@/api/users';
import { rolesApi, Role } from '@/api/roles';
import { useAuthStore } from '@/stores/auth';

const { Title, Text } = Typography;

export function UsersPage() {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const { data } = await usersApi.getAll({ page, limit: 20, search: searchQuery });
      setUsers(data.data);
      setPagination({
        current: data.meta.page,
        pageSize: data.meta.limit,
        total: data.meta.total,
      });
    } catch {
      message.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const { data } = await rolesApi.getAll();
      setRoles(data);
    } catch {
      // Roles may not be available for non-admin users
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    loadUsers(1, value);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      roleIds: user.roles?.map((r) => r.id),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await usersApi.update(editingUser.id, values);
        message.success('Пользователь обновлён');
      } else {
        await usersApi.create(values);
        message.success('Пользователь создан');
      }
      setModalOpen(false);
      loadUsers(pagination.current);
    } catch (err: any) {
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersApi.delete(id);
      message.success('Пользователь удалён');
      loadUsers(pagination.current);
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const columns = [
    {
      title: 'Пользователь',
      key: 'user',
      render: (_: unknown, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone || '—',
    },
    {
      title: 'Роли',
      key: 'roles',
      render: (_: unknown, record: User) =>
        record.roles?.map((r) => (
          <Tag key={r.id} color="blue">{r.displayName}</Tag>
        )),
    },
    {
      title: 'Статус',
      key: 'isActive',
      render: (_: unknown, record: User) =>
        record.isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Активен</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">Неактивен</Tag>
        ),
    },
    ...(isAdmin
      ? [
          {
            title: 'Действия',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: User) => (
              <Space>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(record)}
                />
                <Popconfirm
                  title="Удалить пользователя?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Пользователи</Title>
        <Text type="secondary">Управление пользователями системы</Text>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Поиск по имени или email..."
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 320 }}
            allowClear
          />
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Добавить пользователя
            </Button>
          )}
        </Space>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `Всего: ${total}`,
            onChange: (page) => loadUsers(page),
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingUser ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: !editingUser, type: 'email', message: 'Введите корректный email' }]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, min: 6, message: 'Минимум 6 символов' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              name="firstName"
              label="Имя"
              rules={[{ required: !editingUser, message: 'Введите имя' }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Фамилия"
              rules={[{ required: !editingUser, message: 'Введите фамилию' }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
          </Space>

          <Form.Item name="phone" label="Телефон">
            <Input />
          </Form.Item>

          <Form.Item name="roleIds" label="Роли">
            <Select
              mode="multiple"
              placeholder="Выберите роли"
              options={roles.map((r) => ({
                label: r.displayName,
                value: r.id,
              }))}
            />
          </Form.Item>

          {editingUser && (
            <Form.Item name="isActive" label="Активен" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
