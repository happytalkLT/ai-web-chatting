import { ErrorCodes } from '@/constants/errorMessages';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8033';

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: ErrorCodes;
  statusCode?: number;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

class AuthApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<ApiResponse<AuthResponse>> | null = null;

  constructor() {
    // 로컬 스토리지에서 토큰 복구
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // 인증 토큰이 있으면 헤더에 추가
      if (this.accessToken && !endpoint.includes('/login') && !endpoint.includes('/signup')) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        // 401 에러이고 refresh 엔드포인트가 아니며 재시도가 활성화된 경우
        if (response.status === 401 && !endpoint.includes('/refresh') && retry) {
          // 이미 갱신 중이면 갱신 완료를 기다림
          if (this.isRefreshing) {
            await this.refreshPromise;
            return this.makeRequest<T>(endpoint, options, false);
          }

          // 토큰 갱신 시작
          this.isRefreshing = true;
          this.refreshPromise = this.refreshAccessToken();

          try {
            const refreshResult = await this.refreshPromise;
            
            if (refreshResult.success) {
              // 갱신 성공 시 원래 요청 재시도
              return this.makeRequest<T>(endpoint, options, false);
            } else {
              // 갱신 실패
              this.clearTokens();
              throw {
                ...data,
                statusCode: response.status,
              };
            }
          } catch (refreshError) {
            // 갱신 실패
            this.clearTokens();
            throw {
              ...data,
              statusCode: response.status,
            };
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
      if (!error.success && error.errorCode) {
        throw error;
      }

      throw {
        success: false,
        message: '서버와의 연결에 실패했습니다.',
        errorCode: ErrorCodes.ERR0000,
        statusCode: 500,
      };
    }
  }

  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/users/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // 로그인 성공 시 토큰 저장
    if (response.success && response.data?.accessToken && response.data?.refreshToken) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.makeRequest('/users/logout', {
      method: 'POST',
    });

    // 로그아웃 후 토큰 삭제
    this.clearTokens();

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/users/me', {
      method: 'GET',
    });
  }

  async updateProfile(data: Partial<Pick<User, 'name' | 'profileImage'>>): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(email: string): Promise<ApiResponse> {
    return this.makeRequest('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async refreshAccessToken(): Promise<ApiResponse<AuthResponse>> {
    if (!this.refreshToken) {
      throw {
        success: false,
        message: '리프레시 토큰이 없습니다.',
        errorCode: ErrorCodes.ERR1008,
        statusCode: 401,
      };
    }

    const response = await this.makeRequest<AuthResponse>('/users/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    // 토큰 갱신 성공 시 새 토큰 저장
    if (response.success && response.data?.accessToken && response.data?.refreshToken) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }
}

export const authApi = new AuthApiService();