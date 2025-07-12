const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface HistoryItem {
  id: string;
  user_id: string;
  filename: string;
  disease: string;
  confidence: number;
  severity: string;
  crop_type: string;
  image_url?: string;
  created_at: string;
  is_multispectral?: boolean;
}

export interface MultispectralHistoryItem {
  id: string;
  user_id: string;
  filename: string;
  best_crop: string;
  prediction: string;
  confidence: number;
  created_at: string;
  is_multispectral: true;
  // Add more fields as needed
}

class HistoryService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get prediction history for the current user
  async getPredictionHistory(limit: number = 50): Promise<HistoryItem[]> {
    try {
      console.log('Fetching history from:', `${API_BASE_URL}/history/user?limit=${limit}`);
      
      const response = await fetch(`${API_BASE_URL}/history/user?limit=${limit}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      console.log('History response status:', response.status);
      console.log('History response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // If authentication fails, try the public endpoint
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed, trying public endpoint...');
          const publicResponse = await fetch(`${API_BASE_URL}/history/public?limit=${limit}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            console.log('Public history data received:', publicData);
            return publicData.map((item: any) => ({
              ...item,
              type: 'image',
            } as HistoryItem));
          }
        }
        
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('History response error:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch history');
      }

      const data = await response.json();
      console.log('History data received:', data);
      // Parse and tag items
      return data.map((item: any) => {
        if (item.is_multispectral) {
          return {
            ...item,
            type: 'multispectral',
          } as MultispectralHistoryItem;
        } else {
          return {
            ...item,
            type: 'image',
          } as HistoryItem;
        }
      });
    } catch (error) {
      console.error('History fetch error:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to the server. Please check if the backend is running on ${API_BASE_URL}`);
      }
      
      throw error;
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get severity color for display
  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'text-red-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'mild':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  // Get severity badge color
  getSeverityBadgeColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Delete a history entry
  async deleteHistoryEntry(historyId: string): Promise<boolean> {
    try {
      console.log('Deleting history entry:', historyId);
      
      const response = await fetch(`${API_BASE_URL}/history/${historyId}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Delete response error:', errorData);
        throw new Error(errorData.detail || 'Failed to delete history entry');
      }

      const data = await response.json();
      console.log('Delete response data:', data);
      return true;
    } catch (error) {
      console.error('Delete history error:', error);
      throw error;
    }
  }

  // Test backend connection
  async testBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/history/public`, {
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

export const historyService = new HistoryService(); 