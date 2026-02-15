import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      usersCount: role._count.users,
      permissions: role.permissions.map((rp: any) => ({
        id: rp.permission.id,
        action: rp.permission.action,
        subject: rp.permission.subject,
        key: `${rp.permission.action}:${rp.permission.subject}`,
      })),
    }));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }

    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      usersCount: role._count.users,
      permissions: role.permissions.map((rp: any) => ({
        id: rp.permission.id,
        action: rp.permission.action,
        subject: rp.permission.subject,
        key: `${rp.permission.action}:${rp.permission.subject}`,
      })),
    };
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ subject: 'asc' }, { action: 'asc' }],
    });
  }
}
