// 토큰 관련 키 상수
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ROLE_KEY = 'userRole';
const USER_ID_KEY = 'userId';

// 로컬 스토리지에서 토큰 가져오기
export async function getAccessToken(): Promise<string | null> {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function getUserRole(): Promise<string | null> {
  return localStorage.getItem(USER_ROLE_KEY);
}

export function setUserRole(role: string): void {
  localStorage.setItem(USER_ROLE_KEY, role);
}

export function removeUserRole(): void {
  localStorage.removeItem(USER_ROLE_KEY);
}

export async function getUserId(): Promise<string | null> {
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export function removeUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}

// 모든 인증 관련 데이터 제거
export function clearAuthData(): void {
  removeAccessToken();
  removeRefreshToken();
  removeUserRole();
  removeUserId();
} 