export interface User {
  _id: string;
  username: string;
  email: string;
  winCount: number;
  loseCount: number;
  winStreak: number;
  playHistory: Array<{
    date: string;
    result: 'win' | 'lose';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
} 