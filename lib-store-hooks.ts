// ============================================================
// FILE: frontend/src/lib/api.ts
// API client with interceptors and error handling
// ============================================================
import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('portfolio_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('portfolio_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;


// ============================================================
// FILE: frontend/src/store/authStore.ts
// Zustand auth store
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('portfolio_token', data.token);
          set({ user: data.data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await api.post('/auth/logout').catch(() => {});
        localStorage.removeItem('portfolio_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ token: state.token, user: state.user }) }
  )
);


// ============================================================
// FILE: frontend/src/hooks/usePortfolio.ts
// Custom hooks for all data fetching
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// --- Site Settings ---
export const useSiteSettings = () =>
  useQuery({ queryKey: ['site'], queryFn: () => api.get('/site').then(r => r.data.data) });

export const useUpdateSite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch('/site', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site'] }),
  });
};

// --- Projects ---
export const useProjects = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.get('/projects', { params }).then(r => r.data),
  });

export const useProject = (slug: string) =>
  useQuery({ queryKey: ['project', slug], queryFn: () => api.get(`/projects/${slug}`).then(r => r.data.data), enabled: !!slug });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/projects', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/projects/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

// --- Skills ---
export const useSkills = () =>
  useQuery({ queryKey: ['skills'], queryFn: () => api.get('/skills').then(r => r.data.data) });

export const useCreateSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/skills', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
};

export const useUpdateSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/skills/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
};

export const useDeleteSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/skills/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
};

// --- Experience ---
export const useExperience = () =>
  useQuery({ queryKey: ['experience'], queryFn: () => api.get('/experience').then(r => r.data.data) });

export const useCreateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/experience', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experience'] }),
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/experience/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experience'] }),
  });
};

// --- Blogs ---
export const useBlogs = (params?: Record<string, any>) =>
  useQuery({ queryKey: ['blogs', params], queryFn: () => api.get('/blogs', { params }).then(r => r.data) });

export const useBlog = (slug: string) =>
  useQuery({ queryKey: ['blog', slug], queryFn: () => api.get(`/blogs/${slug}`).then(r => r.data.data), enabled: !!slug });

export const useCreateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/blogs', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blogs'] }),
  });
};

export const useDeleteBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blogs'] }),
  });
};

// --- Testimonials ---
export const useTestimonials = () =>
  useQuery({ queryKey: ['testimonials'], queryFn: () => api.get('/testimonials').then(r => r.data.data) });

// --- Contacts ---
export const useContacts = (params?: Record<string, any>) =>
  useQuery({ queryKey: ['contacts', params], queryFn: () => api.get('/contact', { params }).then(r => r.data) });

// --- File Upload ---
export const useUploadFile = () =>
  useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.post('/upload/single', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.url);
    },
  });

// --- Contact Form ---
export const useSubmitContact = () =>
  useMutation({
    mutationFn: (data: any) => api.post('/contact', data).then(r => r.data),
  });
