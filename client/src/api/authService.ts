const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class AuthService {
  private token: string | null = null;

  // Get token from localStorage
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Set token in localStorage
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Remove token from localStorage
  removeToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Check if backend is reachable
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Login user
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      console.log('Attempting to login with:', { email: credentials.email });
      console.log('API URL:', `${API_BASE_URL}/auth/login`);
      
      // Check if backend is reachable first
      const isBackendHealthy = await this.checkBackendHealth();
      if (!isBackendHealthy) {
        throw new Error(`Backend server is not reachable. Please ensure the server is running on ${API_BASE_URL}`);
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Login response error:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      console.log('Login successful, token received');
      this.setToken(data.access_token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to the server. Please check if the backend is running on ${API_BASE_URL}`);
      }
      
      throw error;
    }
  }

  // Register user
  async register(userData: SignupData): Promise<AuthResponse> {
    try {
      console.log('Attempting to register user:', { email: userData.email });
      
      // Check if backend is reachable first
      const isBackendHealthy = await this.checkBackendHealth();
      if (!isBackendHealthy) {
        throw new Error(`Backend server is not reachable. Please ensure the server is running on ${API_BASE_URL}`);
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          password: userData.password,
          confirm_password: userData.confirmPassword,
        }),
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Registration response error:', errorData);
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      console.log('Registration successful, token received');
      this.setToken(data.access_token);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to the server. Please check if the backend is running on ${API_BASE_URL}`);
      }
      
      throw error;
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Verify token
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  // Logout user
  logout(): void {
    this.removeToken();
  }
}

export const authService = new AuthService(); 