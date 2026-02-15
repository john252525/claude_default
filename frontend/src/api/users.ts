import apiClient from './client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: { id: string; name: string; displayName: string }[];
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<UsersResponse>('/users', { params }),

  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  getProfile: () =>
    apiClient.get<User>('/users/me'),

  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; password?: string }) =>
    apiClient.put<User>('/users/me', data),

  create: (data: CreateUserRequest) =>
    apiClient.post<User>('/users', data),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<User>(`/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
};
