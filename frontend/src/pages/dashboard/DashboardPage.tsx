import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag } from 'antd';
import {
  TeamOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/auth';
import { usersApi, User } from '@/api/users';
import { rolesApi, Role } from '@/api/roles';

const { Title, Text } = Typography;

export function DashboardPage() {
  const { user, hasAnyRole } = useAuthStore();
  const [stats, setStats] = useState({ users: 0, roles: 0, activeUsers: 0 });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const isAdmin = hasAnyRole('admin', 'director');

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.getAll({ limit: 5 }),
        rolesApi.getAll(),
      ]);

      setRecentUsers(usersRes.data.data);
      setRoles(rolesRes.data);
      setStats({
        users: usersRes.data.meta.total,
        roles: rolesRes.data.length,
        activeUsers: usersRes.data.data.filter((u: User) => u.isActive).length,
      });
    } catch {
      // API not available yet
    }
  };

  const recentUsersColumns = [
    {
      title: 'Имя',
      key: 'name',
      render: (_: unknown, record: User) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
      key: 'status',
      render: (_: unknown, record: User) =>
        record.isActive ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Активен</Tag>
        ) : (
          <Tag color="default">Неактивен</Tag>
        ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>
          {isAdmin ? 'Админ-панель' : 'Личный кабинет'}
        </Title>
        <Text type="secondary">
          Добро пожаловать, {user?.firstName} {user?.lastName}
        </Text>
      </div>

      {isAdmin ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card className="dashboard-stat-card">
                <Statistic
                  title="Всего пользователей"
                  value={stats.users}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="dashboard-stat-card">
                <Statistic
                  title="Ролей в системе"
                  value={stats.roles}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="dashboard-stat-card">
                <Statistic
                  title="Активных пользователей"
                  value={stats.activeUsers}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Последние пользователи">
                <Table
                  dataSource={recentUsers}
                  columns={recentUsersColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Роли">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Text>{role.displayName}</Text>
                    <Tag>{role.usersCount} польз.</Tag>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card className="dashboard-stat-card">
              <Statistic
                title="Ваш статус"
                value="Активен"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="dashboard-stat-card">
              <Statistic
                title="В системе"
                value={user?.roles?.length || 0}
                suffix="ролей"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="Ваши роли">
              {user?.roles?.map((role) => (
                <Tag key={role} color="blue" style={{ marginBottom: 8 }}>
                  {role}
                </Tag>
              ))}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
