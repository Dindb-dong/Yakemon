import { request } from '../utils/request';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/user';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await request.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await request.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await request.get<User>('/api/auth/profile');
  return response.data;
}; 