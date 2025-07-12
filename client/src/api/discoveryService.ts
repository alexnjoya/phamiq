import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TrendingDisease {
  id: string;
  disease_name: string;
  crop_type: string;
  trend: string;
  cases_count: number;
  description: string;
  severity: string;
  region: string;
  last_updated: string;
  image_url?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  author: string;
  published_date: string;
  read_time: number;
  image_url?: string;
  tags: string[];
}

export interface DiseaseAlert {
  id: string;
  disease_name: string;
  crop_type: string;
  region: string;
  alert_level: string;
  description: string;
  recommendations: string[];
  issued_date: string;
}

class DiscoveryService {
  private getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getTrendingDiseases(limit: number = 10, region?: string): Promise<TrendingDisease[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (region) params.append('region', region);

      const response = await fetch(`${API_BASE_URL}/discovery/trending?${params}`, {
        method: 'GET',
        
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trending diseases:', error);
      throw error;
    }
  }

  async getInsights(category?: string, limit: number = 10): Promise<Insight[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (category) params.append('category', category);

      const response = await fetch(`${API_BASE_URL}/discovery/insights?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

  async getDiseaseAlerts(alertLevel?: string, region?: string): Promise<DiseaseAlert[]> {
    try {
      const params = new URLSearchParams();
      if (alertLevel) params.append('alert_level', alertLevel);
      if (region) params.append('region', region);

      const response = await fetch(`${API_BASE_URL}/discovery/alerts?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching disease alerts:', error);
      throw error;
    }
  }

  async getInsightDetail(insightId: string): Promise<Insight> {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/insights/${insightId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching insight detail:', error);
      throw error;
    }
  }

  async getDiseaseDetail(diseaseId: string): Promise<TrendingDisease> {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/diseases/${diseaseId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching disease detail:', error);
      throw error;
    }
  }

  async createInsight(data: {
    title: string;
    description: string;
    category: string;
    content?: string;
    author: string;
    image_url?: string;
    tags?: string[];
  }): Promise<Insight> {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/insights`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating insight:', error);
      throw error;
    }
  }

  async deleteInsight(insightId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/insights/${insightId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting insight:', error);
      throw error;
    }
  }

  /**
   * Test if backend is reachable
   * @returns Promise with connection status
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export const discoveryService = new DiscoveryService(); 