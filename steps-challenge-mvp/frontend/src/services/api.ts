import axios from 'axios';
import type {
  User,
  UserRegister,
  UserLogin,
  AuthResponse,
  StepEntryCreate,
  StepEntry,
  UserLeaderboardEntry,
  TeamLeaderboardEntry,
  UserStats,
  AdminUser,
  AdminStats,
  PhotoEntry,
} from '../types';

const API_URL = 'https://steps-production.up.railway.app';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (userData: UserRegister): Promise<User> => {
    const response = await api.post<User>('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials: UserLogin): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
};

// Steps API
export const stepsAPI = {
  createEntry: async (stepData: StepEntryCreate): Promise<StepEntry> => {
    const response = await api.post<StepEntry>('/api/steps', stepData);
    return response.data;
  },

  getMySteps: async (): Promise<StepEntry[]> => {
    const response = await api.get<StepEntry[]>('/api/steps/me');
    return response.data;
  },

  updateEntry: async (entryId: number, stepData: StepEntryCreate): Promise<StepEntry> => {
    const response = await api.put<StepEntry>(`/api/steps/${entryId}`, stepData);
    return response.data;
  },

  deleteEntry: async (entryId: number): Promise<void> => {
    await api.delete(`/api/steps/${entryId}`);
  },
};

// Leaderboards API
export const leaderboardsAPI = {
  getUserLeaderboard: async (): Promise<UserLeaderboardEntry[]> => {
    const response = await api.get<UserLeaderboardEntry[]>('/api/leaderboards/users');
    return response.data;
  },

  getTeamLeaderboard: async (): Promise<TeamLeaderboardEntry[]> => {
    const response = await api.get<TeamLeaderboardEntry[]>('/api/leaderboards/teams');
    return response.data;
  },
};

// User Stats API
export const userAPI = {
  getMyStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/api/users/me/stats');
    return response.data;
  },
};

// Teams API
export const teamsAPI = {
  getAvailableTeams: async (): Promise<string[]> => {
    const response = await api.get<{ teams: string[] }>('/api/teams');
    return response.data.teams;
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>('/api/admin/users');
    return response.data;
  },

  approveUser: async (userId: number): Promise<void> => {
    await api.post(`/api/admin/users/${userId}/approve`);
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/api/admin/users/${userId}`);
  },

  getAllSteps: async (): Promise<StepEntry[]> => {
    const response = await api.get<StepEntry[]>('/api/admin/steps');
    return response.data;
  },

  getUserSteps: async (userId: number): Promise<StepEntry[]> => {
    const response = await api.get<StepEntry[]>(`/api/admin/users/${userId}/steps`);
    return response.data;
  },

  deleteStepEntry: async (entryId: number): Promise<void> => {
    await api.delete(`/api/admin/steps/${entryId}`);
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/api/admin/stats');
    return response.data;
  },
};

// Photo API
export const photoAPI = {
  uploadPhoto: async (file: File, caption: string): Promise<PhotoEntry> => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    const response = await api.post<PhotoEntry>('/api/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPhotos: async (): Promise<PhotoEntry[]> => {
    const response = await api.get<PhotoEntry[]>('/api/photos');
    return response.data;
  },

  deletePhoto: async (photoId: number): Promise<void> => {
    await api.delete(`/api/photos/${photoId}`);
  },
};

export default api;

// Made with Bob
