// api/chatService.ts

// Types
export interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  chat_id?: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ChatService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Test the API connection
   * @returns Promise with connection status
   */
  async testConnection(): Promise<boolean> {
    try {
      // First try the simple test endpoint that doesn't require auth
      const response = await fetch(`${API_BASE_URL}/chat/test-simple`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return true;
      }
      
      // If simple test fails, try the authenticated endpoint
      const authResponse = await fetch(`${API_BASE_URL}/chat/test`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => ({}));
        console.error('Chat test failed:', errorData);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Send a message to the AI and get a response
   * @param userMessage - The user's message
   * @param conversationHistory - Previous messages for context
   * @param chatId - Optional chat ID for continuing existing conversations
   * @returns Promise with AI response and chat ID
   */
  async getAIResponse(
    userMessage: string
  ): Promise<{ message: string }> {
    try {
      console.log('Sending AI chat request:', { message: userMessage });

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage
        }),
      });

      console.log('AI chat response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('AI chat API error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI chat response data:', data);
      
      if (!data.result) {
        throw new Error('No response content received from AI');
      }

      return {
        message: data.result
      };
    } catch (error) {
      console.error('Error getting AI chat response:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Get user's chat history
   * @param limit - Number of chats to retrieve
   * @returns Promise with chat history
   */
  async getChatHistory(limit: number = 20): Promise<ChatHistory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Chat history error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatHistory[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Get specific chat by ID
   * @param chatId - Chat ID to retrieve
   * @returns Promise with chat data
   */
  async getChatById(chatId: string): Promise<ChatHistory> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${chatId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Get chat error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatHistory = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      throw error;
    }
  }

  /**
   * Delete a chat
   * @param chatId - Chat ID to delete
   * @returns Promise with deletion result
   */
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${chatId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Delete chat error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  /**
   * Update chat title
   * @param chatId - Chat ID to update
   * @param title - New title
   * @returns Promise with update result
   */
  async updateChatTitle(chatId: string, title: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${chatId}/title`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Update chat title error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating chat title:', error);
      throw error;
    }
  }

  /**
   * Check if the chat service is available
   * @returns Promise with availability status
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.testConnection();
    } catch (error) {
      console.error('Chat service availability check failed:', error);
      return false;
    }
  }

  /**
   * Test if backend is reachable
   * @returns Promise with connection status
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      // Test the health endpoint
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!healthResponse.ok) {
        return false;
      }
      
      // Test the chat service status using the status endpoint
      const chatResponse = await fetch(`${API_BASE_URL}/chat/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return chatResponse.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export const chatService = new ChatService(); 