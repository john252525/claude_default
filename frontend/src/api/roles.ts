import apiClient from './client';

export interface Permission {
  id: string;
  action: string;
  subject: string;
  key: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  usersCount: number;
  permissions: Permission[];
}

export const rolesApi = {
  getAll: () =>
    apiClient.get<Role[]>('/roles'),

  getById: (id: string) =>
    apiClient.get<Role>(`/roles/${id}`),

  getPermissions: () =>
    apiClient.get<Permission[]>('/roles/permissions'),
};
