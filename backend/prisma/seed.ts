import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create permissions
  const permissions = [
    // Users
    { action: 'create', subject: 'User', description: 'Создание пользователей' },
    { action: 'read', subject: 'User', description: 'Просмотр пользователей' },
    { action: 'update', subject: 'User', description: 'Редактирование пользователей' },
    { action: 'delete', subject: 'User', description: 'Удаление пользователей' },
    // Roles
    { action: 'create', subject: 'Role', description: 'Создание ролей' },
    { action: 'read', subject: 'Role', description: 'Просмотр ролей' },
    { action: 'update', subject: 'Role', description: 'Редактирование ролей' },
    { action: 'delete', subject: 'Role', description: 'Удаление ролей' },
    // Dashboard
    { action: 'read', subject: 'Dashboard', description: 'Просмотр дашборда' },
    { action: 'read', subject: 'AdminDashboard', description: 'Просмотр админ-дашборда' },
    // Profile
    { action: 'read', subject: 'Profile', description: 'Просмотр своего профиля' },
    { action: 'update', subject: 'Profile', description: 'Редактирование своего профиля' },
    // Settings
    { action: 'read', subject: 'Settings', description: 'Просмотр настроек системы' },
    { action: 'update', subject: 'Settings', description: 'Редактирование настроек системы' },
  ];

  const createdPermissions: Record<string, string> = {};

  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { action_subject: { action: perm.action, subject: perm.subject } },
      update: {},
      create: perm,
    });
    createdPermissions[`${perm.action}:${perm.subject}`] = created.id;
  }

  // Create roles
  const roles = [
    {
      name: 'admin',
      displayName: 'Администратор',
      description: 'Полный доступ ко всем разделам системы',
      isSystem: true,
      permissions: Object.keys(createdPermissions),
    },
    {
      name: 'director',
      displayName: 'Директор',
      description: 'Доступ к управлению и аналитике',
      isSystem: true,
      permissions: [
        'read:User', 'read:Role', 'read:Dashboard', 'read:AdminDashboard',
        'read:Profile', 'update:Profile', 'read:Settings',
      ],
    },
    {
      name: 'manager',
      displayName: 'Менеджер',
      description: 'Управление клиентами и заказами',
      isSystem: true,
      permissions: [
        'read:User', 'read:Dashboard',
        'read:Profile', 'update:Profile',
      ],
    },
    {
      name: 'support',
      displayName: 'Сотрудник ТП',
      description: 'Техническая поддержка пользователей',
      isSystem: true,
      permissions: [
        'read:User', 'read:Dashboard',
        'read:Profile', 'update:Profile',
      ],
    },
    {
      name: 'sales',
      displayName: 'Продавец',
      description: 'Работа с продажами и клиентами',
      isSystem: true,
      permissions: [
        'read:User', 'read:Dashboard',
        'read:Profile', 'update:Profile',
      ],
    },
    {
      name: 'marketer',
      displayName: 'Маркетолог',
      description: 'Управление маркетинговыми кампаниями',
      isSystem: true,
      permissions: [
        'read:Dashboard',
        'read:Profile', 'update:Profile',
      ],
    },
    {
      name: 'client',
      displayName: 'Клиент',
      description: 'Доступ к личному кабинету',
      isSystem: true,
      permissions: [
        'read:Profile', 'update:Profile',
      ],
    },
    {
      name: 'partner',
      displayName: 'Партнёр',
      description: 'Партнёрский доступ',
      isSystem: true,
      permissions: [
        'read:Dashboard',
        'read:Profile', 'update:Profile',
      ],
    },
  ];

  for (const roleData of roles) {
    const { permissions: permKeys, ...data } = roleData;
    const role = await prisma.role.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });

    for (const key of permKeys) {
      const permId = createdPermissions[key];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }

  // Create admin user
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (!adminRole) throw new Error('Admin role not found');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log('Seed completed successfully');
  console.log('Admin user: admin@example.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
