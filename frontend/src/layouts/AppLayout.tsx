import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/stores/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasAnyRole, hasPermission } = useAuthStore();
  const { token: themeToken } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
    },
  ];

  if (hasPermission('read:User') || hasAnyRole('admin', 'director', 'manager')) {
    menuItems.push({
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Пользователи',
    });
  }

  if (hasAnyRole('admin', 'director')) {
    menuItems.push({
      key: '/roles',
      icon: <SafetyOutlined />,
      label: 'Роли и права',
    });
  }

  menuItems.push({
    key: '/profile',
    icon: <UserOutlined />,
    label: 'Мой профиль',
  });

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Настройки профиля',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: handleLogout,
    },
  ];

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

  const primaryRole = user?.roles?.[0];
  const roleLabel = primaryRole ? roleDisplayNames[primaryRole] || primaryRole : '';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          borderRight: `1px solid ${themeToken.colorBorderSecondary}`,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <Text strong style={{ fontSize: collapsed ? 16 : 20 }}>
            {collapsed ? 'AD' : 'Admin Panel'}
          </Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div
            style={{ cursor: 'pointer', fontSize: 18 }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: themeToken.colorPrimary }} />
              <div style={{ lineHeight: 1.3 }}>
                <Text strong style={{ display: 'block', fontSize: 13 }}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {roleLabel}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
