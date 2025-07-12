import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  language?: string;
  timezone?: string;
  notifications?: {
    analysis_results: boolean;
    disease_alerts: boolean;
  };
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  location?: string;
  language?: string;
  timezone?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface NotificationSettings {
  analysis_results?: boolean;
  disease_alerts?: boolean;
}

export interface LanguageSettings {
  language: string;
  timezone: string;
}

class UserService {
  private getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        
        // Handle Pydantic validation errors
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join(', ');
          throw new Error(`Validation error: ${validationErrors}`);
        }
        
        // Handle other error types
        if (errorData.detail) {
          throw new Error(errorData.detail);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async updateNotifications(data: NotificationSettings): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/notifications`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }

  async updateLanguage(data: LanguageSettings): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/language`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating language settings:', error);
      throw error;
    }
  }

  async downloadUserData(): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/data`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading user data:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 