/**
 * AI-related types and constants
 */

export interface AIRecommendations {
  disease_overview: string;
  immediate_actions: string;
  treatment_protocols: {
    organic: string;
    chemical: string;
    application: string;
  };
  prevention: string;
  monitoring: string;
  cost_effective: string;
  severity_level: 'Low' | 'Moderate' | 'High';
  professional_help: string;
}

export interface DiseaseAnalysis {
  overview: string;
  treatment: string;
  prevention: string;
  recommendations: AIRecommendations;
}

export interface DiscoveryContent {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIState {
  loading: boolean;
  error: string | null;
  available: boolean;
  models: string[];
}

export interface AIConnectionStatus {
  available: boolean;
  models: string[];
  error?: string;
}

export interface DiseaseContext {
  diseaseName: string;
  confidence: number;
  cropType: string;
  severity: 'Low' | 'Moderate' | 'High';
}

export interface TreatmentRecommendation {
  type: 'organic' | 'chemical' | 'cultural';
  method: string;
  application: string;
  timing: string;
  safety: string;
  cost: string;
}

export interface PreventionStrategy {
  category: string;
  description: string;
  implementation: string;
  timeline: string;
}

// AI Model constants
export const AI_MODELS = {
  GPT4O: 'gpt-4o',
  YI_LARGE: 'yi-large',
  CLAUDE: 'claude-3-sonnet',
  GEMINI: 'gemini-pro'
} as const;

export const DEFAULT_MODELS = [AI_MODELS.GPT4O, AI_MODELS.YI_LARGE];

// AI Service endpoints
export const AI_ENDPOINTS = {
  CHAT: '/ai/chat',
  DISEASE_ANALYSIS: '/ai/disease-analysis',
  GENERATE_TITLE: '/ai/generate-title',
  GENERATE_DESCRIPTION: '/ai/generate-description',
  GENERATE_IMAGE: '/ai/generate-image',
  STATUS: '/ai/status'
} as const;

// Disease severity levels
export const SEVERITY_LEVELS = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  HIGH: 'High'
} as const;

// AI Response types
export const AI_RESPONSE_TYPES = {
  CHAT: 'chat',
  DISEASE_ANALYSIS: 'disease_analysis',
  TREATMENT: 'treatment',
  PREVENTION: 'prevention',
  SUMMARY: 'summary'
} as const;

// Error messages
export const AI_ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to AI service',
  API_KEY_MISSING: 'AI API key not configured',
  SERVICE_UNAVAILABLE: 'AI service is currently unavailable',
  REQUEST_FAILED: 'AI request failed',
  INVALID_RESPONSE: 'Invalid response from AI service',
  TIMEOUT: 'AI request timed out',
  RATE_LIMIT: 'AI service rate limit exceeded'
} as const;

// AI Prompt templates
export const AI_PROMPTS = {
  DISEASE_ANALYSIS: (disease: string, confidence: number, crop: string) => 
    `Analyze ${disease} (${confidence}% confidence) in ${crop} crops. Provide comprehensive treatment and prevention recommendations.`,
  
  TREATMENT_RECOMMENDATIONS: (disease: string, crop: string) =>
    `Provide detailed treatment recommendations for ${disease} in ${crop} crops, including organic and chemical options.`,
  
  PREVENTION_STRATEGIES: (disease: string, crop: string) =>
    `Provide comprehensive prevention strategies for ${disease} in ${crop} crops, focusing on sustainable long-term solutions.`,
  
  AGRICULTURAL_ADVICE: (topic: string) =>
    `As an agricultural expert, provide practical advice about: ${topic}. Focus on actionable information for farmers.`,
  
  DISCOVERY_CONTENT: (topic: string) =>
    `Create engaging content about ${topic} for agricultural professionals. Include practical insights and modern approaches.`
} as const;

// AI Configuration
export const AI_CONFIG = {
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
} as const;

// AI Model capabilities
export const MODEL_CAPABILITIES = {
  [AI_MODELS.GPT4O]: {
    maxTokens: 4096,
    supportsImages: false,
    supportsStreaming: true,
    agriculturalExpertise: 'high'
  },
  [AI_MODELS.YI_LARGE]: {
    maxTokens: 4096,
    supportsImages: false,
    supportsStreaming: true,
    agriculturalExpertise: 'medium'
  },
  [AI_MODELS.CLAUDE]: {
    maxTokens: 4096,
    supportsImages: false,
    supportsStreaming: true,
    agriculturalExpertise: 'high'
  },
  [AI_MODELS.GEMINI]: {
    maxTokens: 4096,
    supportsImages: true,
    supportsStreaming: true,
    agriculturalExpertise: 'medium'
  }
} as const;

// AI Response validation
export const validateAIResponse = (response: any): boolean => {
  return response && typeof response === 'object' && response !== null;
};

export const validateDiseaseAnalysis = (analysis: any): analysis is DiseaseAnalysis => {
  return (
    analysis &&
    typeof analysis.overview === 'string' &&
    typeof analysis.treatment === 'string' &&
    typeof analysis.prevention === 'string' &&
    analysis.recommendations
  );
};

export const validateAIRecommendations = (recommendations: any): recommendations is AIRecommendations => {
  return (
    recommendations &&
    typeof recommendations.disease_overview === 'string' &&
    typeof recommendations.immediate_actions === 'string' &&
    recommendations.treatment_protocols &&
    typeof recommendations.treatment_protocols.organic === 'string' &&
    typeof recommendations.treatment_protocols.chemical === 'string' &&
    typeof recommendations.treatment_protocols.application === 'string' &&
    typeof recommendations.prevention === 'string' &&
    typeof recommendations.monitoring === 'string' &&
    typeof recommendations.cost_effective === 'string' &&
    typeof recommendations.severity_level === 'string' &&
    typeof recommendations.professional_help === 'string'
  );
}; 