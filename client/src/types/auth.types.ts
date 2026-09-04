export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  username?: string | null;
  avatar: string;
  isOnline: boolean;
  isBlocked: boolean;
  lastSeen: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}