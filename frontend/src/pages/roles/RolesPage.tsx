import { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Badge, Collapse, message } from 'antd';
import { SafetyOutlined, TeamOutlined } from '@ant-design/icons';
import { rolesApi, Role } from '@/api/roles';

const { Title, Text } = Typography;

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const { data } = await rolesApi.getAll();
      setRoles(data);
    } catch {
      message.error('Ошибка загрузки ролей');
    } finally {
      setLoading(false);
    }
  };

  const subjectLabels: Record<string, string> = {
    User: 'Пользователи',
    Role: 'Роли',
    Dashboard: 'Дашборд',
    AdminDashboard: 'Админ-дашборд',
    Profile: 'Профиль',
    Settings: 'Настройки',
  };

  const actionLabels: Record<string, string> = {
    create: 'Создание',
    read: 'Просмотр',
    update: 'Редактирование',
    delete: 'Удаление',
  };

  const columns = [
    {
      title: 'Роль',
      key: 'role',
      render: (_: unknown, record: Role) => (
        <div>
          <Text strong>{record.displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.name}</Text>
        </div>
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Пользователей',
      key: 'usersCount',
      render: (_: unknown, record: Role) => (
        <Badge count={record.usersCount} showZero style={{ backgroundColor: '#1677ff' }}>
          <TeamOutlined style={{ fontSize: 20, padding: 4 }} />
        </Badge>
      ),
    },
    {
      title: 'Тип',
      key: 'isSystem',
      render: (_: unknown, record: Role) =>
        record.isSystem ? (
          <Tag color="gold">Системная</Tag>
        ) : (
          <Tag>Пользовательская</Tag>
        ),
    },
    {
      title: 'Разрешений',
      key: 'permissions',
      render: (_: unknown, record: Role) => (
        <Tag color="purple" icon={<SafetyOutlined />}>
          {record.permissions.length}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Роли и права доступа</Title>
        <Text type="secondary">Управление ролями и разрешениями в системе</Text>
      </div>

      <Card>
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 0' }}>
                <Text strong style={{ marginBottom: 12, display: 'block' }}>
                  Разрешения:
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {record.permissions.map((p) => (
                    <Tag key={p.key} color="blue">
                      {actionLabels[p.action] || p.action}: {subjectLabels[p.subject] || p.subject}
                    </Tag>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}
