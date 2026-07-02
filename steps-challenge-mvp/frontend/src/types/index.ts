// User types
export interface User {
  id: number;
  full_name: string;
  email: string;
  team_name: string;
  is_admin: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  team_name: string;
  is_admin: boolean;
  is_approved: boolean;
  created_at: string;
  total_steps: number;
}

export interface AdminStats {
  total_users: number;
  total_steps: number;
  total_entries: number;
  teams: string[];
}

export interface UserRegister {
  full_name: string;
  email: string;
  team_name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Step Entry types
export interface StepEntry {
  id: number;
  user_id: number;
  date: string;
  steps: number;
  created_at: string;
}

export interface StepEntryCreate {
  date: string;
  steps: number;
}

// Leaderboard types
export interface UserLeaderboardEntry {
  rank: number;
  user_id: number;
  full_name: string;
  team_name: string;
  total_steps: number;
}

export interface TeamLeaderboardEntry {
  rank: number;
  team_name: string;
  total_steps: number;
  active_members: number;
}

// User Stats
export interface UserStats {
  full_name: string;
  team_name: string;
  total_steps: number;
  user_rank: number;
  team_rank: number;
}

// Photo
export interface PhotoEntry {
  id: number;
  user_id: number;
  image_url: string;
  caption: string | null;
  full_name: string;
  created_at: string;
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegister) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Made with Bob
