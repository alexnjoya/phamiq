import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Enhanced error handling for API calls
const handleApiError = (error: any, operation: string): never => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.detail || error.response.data?.message || error.message;
    
    if (status === 503) {
      throw new Error(`AI service unavailable: ${message}`);
    } else if (status === 401) {
      throw new Error('AI service authentication failed. Please check API key configuration.');
    } else if (status === 500) {
      throw new Error(`AI service error: ${message}`);
    } else {
      throw new Error(`API error (${status}): ${message}`);
    }
  } else if (error.request) {
    // Network error
    throw new Error(`Network error: Unable to connect to AI service at ${API_BASE}`);
  } else {
    // Other error
    throw new Error(`${operation} failed: ${error.message}`);
  }
};

/**
 * Comprehensive AlleAI service for all AI-related functionality
 */
class AlleAIService {
  /**
   * Generate a title for content
   */
  async generateTitle(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/generate-title`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error generating title:', error);
      handleApiError(error, 'Title generation');
    }
  }

  /**
   * Generate a description for content
   */
  async generateDescription(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/generate-description`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error generating description:', error);
      handleApiError(error, 'Description generation');
    }
  }

  /**
   * Generate an image (placeholder for now)
   */
  async generateImage(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/generate-image`, { prompt, models: modelsArray });
      return res.data.url;
    } catch (error) {
      console.error('Error generating image:', error);
      handleApiError(error, 'Image generation');
    }
  }

  /**
   * Chat with AI
   */
  async chat(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/chat`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error in AI chat:', error);
      handleApiError(error, 'AI chat');
    }
  }

  /**
   * Analyze disease with specialized prompts
   */
  async analyzeDisease(diseaseName: string, confidence: number, cropType: string, models?: string | string[]): Promise<any> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const prompt = `${diseaseName}|${confidence}|${cropType}`;
      const res = await axios.post(`${API_BASE}/ai/disease-analysis`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error in disease analysis:', error);
      handleApiError(error, 'Disease analysis');
    }
  }

  /**
   * Get AI service status
   */
  async getStatus(): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/ai/status`);
      return res.data;
    } catch (error) {
      console.error('Error getting AI status:', error);
      return { status: 'error', error: 'Failed to get AI status' };
    }
  }

  /**
   * Test AI connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.status === 'available';
    } catch (error) {
      console.error('Error testing AI connection:', error);
      return false;
    }
  }

  /**
   * Test backend connectivity
   */
  async testBackendConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      const res = await axios.get(`${API_BASE}/health`);
      return { connected: true };
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const status = await this.getStatus();
      return status.models || [];
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }

  /**
   * Ask AI about a specific disease with context
   */
  async askAboutDisease(diseaseName: string, confidence: number, cropType: string, question: string, models?: string | string[]): Promise<string> {
    try {
      const context = `Disease: ${diseaseName}, Confidence: ${confidence}%, Crop: ${cropType}`;
      const fullPrompt = `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide detailed, practical advice for managing this disease in ${cropType} crops.`;
      
      return await this.chat(fullPrompt, models);
    } catch (error) {
      console.error('Error asking about disease:', error);
      handleApiError(error, 'Disease advice');
    }
  }

  /**
   * Get treatment recommendations for a disease
   */
  async getTreatmentRecommendations(diseaseName: string, confidence: number, cropType: string, models?: string | string[]): Promise<string> {
    try {
      const prompt = `Provide comprehensive treatment recommendations for ${diseaseName} in ${cropType} crops. Include organic and chemical options, application methods, timing, and safety precautions.`;
      
      return await this.chat(prompt, models);
    } catch (error) {
      console.error('Error getting treatment recommendations:', error);
      handleApiError(error, 'Treatment recommendations');
    }
  }

  /**
   * Get prevention strategies for a disease
   */
  async getPreventionStrategies(diseaseName: string, cropType: string, models?: string | string[]): Promise<string> {
    try {
      const prompt = `Provide comprehensive prevention strategies for ${diseaseName} in ${cropType} crops. Include cultural practices, environmental management, and long-term prevention measures.`;
      
      return await this.chat(prompt, models);
    } catch (error) {
      console.error('Error getting prevention strategies:', error);
      handleApiError(error, 'Prevention strategies');
    }
  }
}

// Export singleton instance
export const alleaiService = new AlleAIService();

// Export individual functions for backward compatibility
export const generateTitle = (prompt: string, models?: string | string[]) => alleaiService.generateTitle(prompt, models);
export const generateDescription = (prompt: string, models?: string | string[]) => alleaiService.generateDescription(prompt, models);
export const generateImage = (prompt: string, models?: string | string[]) => alleaiService.generateImage(prompt, models);
export const aiChat = (prompt: string, models?: string | string[]) => alleaiService.chat(prompt, models);
export const diseaseAnalysis = (diseaseName: string, confidence: number, cropType: string, models?: string | string[]) => alleaiService.analyzeDisease(diseaseName, confidence, cropType, models);
export const getAIStatus = () => alleaiService.getStatus(); 