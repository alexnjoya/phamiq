import { useState, useCallback } from 'react';
import { aiIntegrationService } from '../api/aiIntegrationService';
import { alleaiService } from '../api/alleaiService';

interface AIState {
  loading: boolean;
  error: string | null;
  available: boolean;
  models: string[];
}

interface AIActions {
  chat: (message: string, models?: string[]) => Promise<string>;
  getDiseaseRecommendations: (diseaseName: string, confidence: number, cropType: string, models?: string[]) => Promise<any>;
  askAboutDisease: (diseaseName: string, confidence: number, cropType: string, question: string, models?: string[]) => Promise<string>;
  getTreatmentRecommendations: (diseaseName: string, confidence: number, cropType: string, models?: string[]) => Promise<string>;
  getPreventionStrategies: (diseaseName: string, cropType: string, models?: string[]) => Promise<string>;
  generateDiscoveryContent: (topic: string, models?: string[]) => Promise<{ title: string; description: string; imageUrl?: string }>;
  chatAboutAgriculture: (topic: string, models?: string[]) => Promise<string>;
  getComprehensiveDiseaseAnalysis: (diseaseName: string, confidence: number, cropType: string, models?: string[]) => Promise<{
    overview: string;
    treatment: string;
    prevention: string;
    recommendations: any;
  }>;
  generateAnalysisSummary: (diseaseName: string, confidence: number, cropType: string, models?: string[]) => Promise<string>;
  testConnection: () => Promise<void>;
}

/**
 * React hook for AI functionality
 */
export const useAI = (): AIState & AIActions => {
  const [state, setState] = useState<AIState>({
    loading: false,
    error: null,
    available: false,
    models: []
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const chat = useCallback(async (message: string, models?: string[]): Promise<string> => {
    setLoading(true);
    try {
      const result = await alleaiService.chat(message, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getDiseaseRecommendations = useCallback(async (diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<any> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.getDiseaseRecommendations(diseaseName, confidence, cropType, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get disease recommendations';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const askAboutDisease = useCallback(async (diseaseName: string, confidence: number, cropType: string, question: string, models?: string[]): Promise<string> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.askAboutDisease(diseaseName, confidence, cropType, question, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get disease advice';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getTreatmentRecommendations = useCallback(async (diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<string> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.getTreatmentRecommendations(diseaseName, confidence, cropType, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get treatment recommendations';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getPreventionStrategies = useCallback(async (diseaseName: string, cropType: string, models?: string[]): Promise<string> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.getPreventionStrategies(diseaseName, cropType, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get prevention strategies';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const generateDiscoveryContent = useCallback(async (topic: string, models?: string[]): Promise<{ title: string; description: string; imageUrl?: string }> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.generateDiscoveryContent(topic, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate discovery content';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const chatAboutAgriculture = useCallback(async (topic: string, models?: string[]): Promise<string> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.chatAboutAgriculture(topic, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get agricultural advice';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getComprehensiveDiseaseAnalysis = useCallback(async (diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<{
    overview: string;
    treatment: string;
    prevention: string;
    recommendations: any;
  }> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.getComprehensiveDiseaseAnalysis(diseaseName, confidence, cropType, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get comprehensive analysis';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const generateAnalysisSummary = useCallback(async (diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<string> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.generateAnalysisSummary(diseaseName, confidence, cropType, models);
      setError(null);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate analysis summary';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const testConnection = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await aiIntegrationService.testAIConnection();
      setState(prev => ({
        ...prev,
        available: result.available,
        models: result.models,
        error: result.error || null,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to test AI connection';
      setState(prev => ({
        ...prev,
        available: false,
        models: [],
        error: errorMessage,
        loading: false
      }));
    }
  }, []);

  return {
    ...state,
    chat,
    getDiseaseRecommendations,
    askAboutDisease,
    getTreatmentRecommendations,
    getPreventionStrategies,
    generateDiscoveryContent,
    chatAboutAgriculture,
    getComprehensiveDiseaseAnalysis,
    generateAnalysisSummary,
    testConnection
  };
};

/**
 * Hook for AI chat functionality
 */
export const useAIChat = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string, models?: string[]) => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    // Add user message
    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await alleaiService.chat(message, models);
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      setError(errorMessage);
      const errorResponse = { role: 'assistant' as const, content: `Error: ${errorMessage}` };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
};

/**
 * Hook for disease analysis
 */
export const useDiseaseAnalysis = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDisease = useCallback(async (diseaseName: string, confidence: number, cropType: string, models?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiIntegrationService.getComprehensiveDiseaseAnalysis(diseaseName, confidence, cropType, models);
      setAnalysis(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze disease';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    loading,
    error,
    analyzeDisease,
    clearAnalysis
  };
}; 