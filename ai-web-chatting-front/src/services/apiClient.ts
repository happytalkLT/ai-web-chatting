import { authApi } from './authApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8033';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  statusCode?: number;
}

export class ApiClient {
  private static instance: ApiClient;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<any> | null = null;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        ...options.headers,
      };

      // FormData가 아닌 경우에만 Content-Type 설정
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // 인증 토큰이 있으면 헤더에 추가
      const accessToken = authApi.getAccessToken();
      if (accessToken && !endpoint.includes('/login') && !endpoint.includes('/signup')) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // 401 에러이고 refresh 엔드포인트가 아니며 재시도가 활성화된 경우
        if (response.status === 401 && !endpoint.includes('/refresh') && retry && accessToken) {
          // 이미 갱신 중이면 갱신 완료를 기다림
          if (this.isRefreshing) {
            await this.refreshPromise;
            return this.request<T>(endpoint, options, false);
          }

          // 토큰 갱신 시작
          this.isRefreshing = true;
          this.refreshPromise = authApi.refreshAccessToken();

          try {
            const refreshResult = await this.refreshPromise;
            
            if (refreshResult.success) {
              // 갱신 성공 시 원래 요청 재시도
              return this.request<T>(endpoint, options, false);
            } else {
              // 갱신 실패 - 로그인 페이지로 리다이렉트
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              throw new Error('Authentication failed');
            }
          } catch (refreshError) {
            // 갱신 실패 - 로그인 페이지로 리다이렉트
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Authentication failed');
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        throw {
          ...data,
          statusCode: response.status,
        };
      }

      return data;
    } catch (error: any) {
      // 네트워크 에러나 JSON 파싱 에러 처리
      if (error.statusCode || error.errorCode) {
        throw error;
      }

      throw {
        success: false,
        message: '서버와의 연결에 실패했습니다.',
        errorCode: 'ERR0000',
        statusCode: 500,
      };
    }
  }
}

export const apiClient = ApiClient.getInstance();