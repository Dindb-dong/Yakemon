import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, removeAccessToken, setAccessToken } from './storage';


// API 기본 URL 설정
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';
console.log(BASE_URL);
// 기본 요청 설정
const defaultRequest = async <T>(
  path: string,
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  const url = `${BASE_URL}/api${path}`;
  const headers = {
    ...config.headers,
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
  };

  try {
    const response = await axios({
      ...config,
      url,
      headers,
    });
    return response;
  } catch (error: any) {
    if (!error.response) {
      // 네트워크 에러
      console.error('Network Error:', error);
      throw new Error('Network Error');
    }

    if (error.response.status === 401) {
      // 토큰 만료 처리
      try {
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (refreshResponse.status === 200) {
          const newAccessToken = refreshResponse.data.accessToken;
          setAccessToken(newAccessToken);

          // 새로운 토큰으로 원래 요청 재시도
          const retryResponse = await axios({
            ...config,
            url,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          });
          return retryResponse;
        }
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우
        removeAccessToken();
        throw new Error('Session expired');
      }
    }

    throw error;
  }
};

// HTTP 메서드별 요청 함수
export const request = {
  get: <T>(path: string, config?: AxiosRequestConfig) =>
    defaultRequest<T>(path, { ...config, method: 'GET' }),

  post: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
    defaultRequest<T>(path, { ...config, method: 'POST', data }),

  put: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
    defaultRequest<T>(path, { ...config, method: 'PUT', data }),

  patch: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
    defaultRequest<T>(path, { ...config, method: 'PATCH', data }),

  delete: <T>(path: string, config?: AxiosRequestConfig) =>
    defaultRequest<T>(path, { ...config, method: 'DELETE' }),
}; 