import { create } from 'zustand';
import { authApi, UserData } from '@/api/auth';

interface AuthState {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({
      user: data.user,
      token: data.accessToken,
      isAuthenticated: true,
    });
  },

  register: async (registerData) => {
    const { data } = await authApi.register(registerData);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({
      user: data.user,
      token: data.accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const { data } = await authApi.getProfile();
      set({
        user: data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  hasRole: (role) => {
    const { user } = get();
    return user?.roles?.includes(role) ?? false;
  },

  hasPermission: (permission) => {
    const { user } = get();
    return user?.permissions?.includes(permission) ?? false;
  },

  hasAnyRole: (...roles) => {
    const { user } = get();
    return roles.some((role) => user?.roles?.includes(role)) ?? false;
  },
}));
