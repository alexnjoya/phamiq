import { alleaiService } from './alleaiService';
import { askAiChat } from './aiChatService';

/**
 * AI Integration Service - High-level functions for common AI operations
 */
class AIIntegrationService {
  /**
   * Get AI recommendations for a detected disease
   */
  async getDiseaseRecommendations(diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<any> {
    try {
      console.log(`Getting recommendations for ${diseaseName} (${confidence}% confidence) in ${cropType}`);
      
      const result = await alleaiService.analyzeDisease(diseaseName, confidence, cropType, models);
      
      // If the result is a string, try to parse it as JSON
      if (typeof result === 'string') {
        try {
          return JSON.parse(result);
        } catch {
          // If it's not JSON, return as a simple response
          return {
            disease_overview: result,
            immediate_actions: "Please consult the AI response above for immediate actions.",
            treatment_protocols: {
              organic: "See AI response for organic treatment options.",
              chemical: "See AI response for chemical treatment options.",
              application: "Follow the AI recommendations for application."
            },
            prevention: "See AI response for prevention strategies.",
            monitoring: "Monitor plant health and follow AI recommendations.",
            cost_effective: "See AI response for cost-effective solutions.",
            severity_level: confidence > 80 ? "High" : confidence > 60 ? "Moderate" : "Low",
            professional_help: "Consider consulting agricultural experts for severe cases."
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting disease recommendations:', error);
      throw error;
    }
  }

  /**
   * Ask AI about a specific disease with context
   */
  async askAboutDisease(diseaseName: string, confidence: number, cropType: string, question: string, models?: string[]): Promise<string> {
    try {
      console.log(`Asking AI about ${diseaseName} in ${cropType}: ${question}`);
      
      const context = `The plant was diagnosed with ${diseaseName} (${confidence}% confidence) in ${cropType} crops.`;
      const fullQuestion = `${context}\n\nQuestion: ${question}`;
      
      return await askAiChat(fullQuestion, context, models);
    } catch (error) {
      console.error('Error asking about disease:', error);
      throw error;
    }
  }

  /**
   * Get treatment recommendations for a disease
   */
  async getTreatmentRecommendations(diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<string> {
    try {
      console.log(`Getting treatment recommendations for ${diseaseName} in ${cropType}`);
      
      const prompt = `Provide comprehensive treatment recommendations for ${diseaseName} in ${cropType} crops. Include:
1. Organic treatment methods
2. Chemical treatment options (if applicable)
3. Application timing and frequency
4. Safety precautions
5. Cost-effective solutions
6. Step-by-step instructions

Focus on practical, actionable advice that farmers can implement immediately.`;
      
      return await alleaiService.chat(prompt, models);
    } catch (error) {
      console.error('Error getting treatment recommendations:', error);
      throw error;
    }
  }

  /**
   * Get prevention strategies for a disease
   */
  async getPreventionStrategies(diseaseName: string, cropType: string, models?: string[]): Promise<string> {
    try {
      console.log(`Getting prevention strategies for ${diseaseName} in ${cropType}`);
      
      const prompt = `Provide comprehensive prevention strategies for ${diseaseName} in ${cropType} crops. Include:
1. Cultural practices to prevent recurrence
2. Environmental management
3. Crop rotation recommendations
4. Resistant variety suggestions
5. Monitoring and early detection methods
6. Long-term prevention measures

Focus on sustainable, long-term solutions.`;
      
      return await alleaiService.chat(prompt, models);
    } catch (error) {
      console.error('Error getting prevention strategies:', error);
      throw error;
    }
  }

  /**
   * Generate content for discovery posts
   */
  async generateDiscoveryContent(topic: string, models?: string[]): Promise<{ title: string; description: string; imageUrl?: string }> {
    try {
      console.log(`Generating discovery content for: ${topic}`);
      
      // Generate title
      const title = await alleaiService.generateTitle(topic, models);
      
      // Generate description
      const description = await alleaiService.generateDescription(topic, models);
      
      // Generate image (placeholder for now)
      let imageUrl: string | undefined;
      try {
        imageUrl = await alleaiService.generateImage(topic, models);
      } catch (error) {
        console.warn('Image generation failed, using placeholder');
        imageUrl = undefined;
      }
      
      return { title, description, imageUrl };
    } catch (error) {
      console.error('Error generating discovery content:', error);
      throw error;
    }
  }

  /**
   * Chat with AI about agricultural topics
   */
  async chatAboutAgriculture(topic: string, models?: string[]): Promise<string> {
    try {
      console.log(`Chatting about agriculture: ${topic}`);
      
      const prompt = `As an agricultural expert, provide helpful advice about: ${topic}. 
Focus on practical, actionable information that farmers and agricultural professionals can use. 
Include both traditional and modern approaches when applicable.`;
      
      return await alleaiService.chat(prompt, models);
    } catch (error) {
      console.error('Error chatting about agriculture:', error);
      throw error;
    }
  }

  /**
   * Get AI status and test connection
   */
  async testAIConnection(): Promise<{ available: boolean; models: string[]; error?: string }> {
    try {
      console.log('Testing AI connection...');
      
      const status = await alleaiService.getStatus();
      const models = await alleaiService.getAvailableModels();
      
      return {
        available: status.status === 'available',
        models: models,
        error: status.error
      };
    } catch (error) {
      console.error('Error testing AI connection:', error);
      return {
        available: false,
        models: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get comprehensive disease analysis
   */
  async getComprehensiveDiseaseAnalysis(diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<{
    overview: string;
    treatment: string;
    prevention: string;
    recommendations: any;
  }> {
    try {
      console.log(`Getting comprehensive analysis for ${diseaseName} in ${cropType}`);
      
      // Get structured recommendations
      const recommendations = await this.getDiseaseRecommendations(diseaseName, confidence, cropType, models);
      
      // Get detailed treatment recommendations
      const treatment = await this.getTreatmentRecommendations(diseaseName, confidence, cropType, models);
      
      // Get prevention strategies
      const prevention = await this.getPreventionStrategies(diseaseName, cropType, models);
      
      // Get overview from recommendations or generate one
      let overview = '';
      if (recommendations.disease_overview) {
        overview = recommendations.disease_overview;
      } else {
        overview = await alleaiService.chat(
          `Provide a brief overview of ${diseaseName} in ${cropType} crops, including symptoms and identification.`,
          models
        );
      }
      
      return {
        overview,
        treatment,
        prevention,
        recommendations
      };
    } catch (error) {
      console.error('Error getting comprehensive disease analysis:', error);
      throw error;
    }
  }

  /**
   * Generate a summary of analysis results
   */
  async generateAnalysisSummary(diseaseName: string, confidence: number, cropType: string, models?: string[]): Promise<string> {
    try {
      console.log(`Generating analysis summary for ${diseaseName} in ${cropType}`);
      
      const prompt = `Create a concise summary of the analysis results for ${diseaseName} (${confidence}% confidence) in ${cropType} crops. 
Include:
- Key findings
- Immediate actions needed
- Treatment options
- Prevention measures
- Severity assessment

Keep it brief but informative for quick reference.`;
      
      return await alleaiService.chat(prompt, models);
    } catch (error) {
      console.error('Error generating analysis summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiIntegrationService = new AIIntegrationService();

// Export individual functions for easy access
export const getDiseaseRecommendations = (diseaseName: string, confidence: number, cropType: string, models?: string[]) => 
  aiIntegrationService.getDiseaseRecommendations(diseaseName, confidence, cropType, models);

export const askAboutDisease = (diseaseName: string, confidence: number, cropType: string, question: string, models?: string[]) => 
  aiIntegrationService.askAboutDisease(diseaseName, confidence, cropType, question, models);

export const getTreatmentRecommendations = (diseaseName: string, confidence: number, cropType: string, models?: string[]) => 
  aiIntegrationService.getTreatmentRecommendations(diseaseName, confidence, cropType, models);

export const getPreventionStrategies = (diseaseName: string, cropType: string, models?: string[]) => 
  aiIntegrationService.getPreventionStrategies(diseaseName, cropType, models);

export const generateDiscoveryContent = (topic: string, models?: string[]) => 
  aiIntegrationService.generateDiscoveryContent(topic, models);

export const chatAboutAgriculture = (topic: string, models?: string[]) => 
  aiIntegrationService.chatAboutAgriculture(topic, models);

export const testAIConnection = () => aiIntegrationService.testAIConnection();

export const getComprehensiveDiseaseAnalysis = (diseaseName: string, confidence: number, cropType: string, models?: string[]) => 
  aiIntegrationService.getComprehensiveDiseaseAnalysis(diseaseName, confidence, cropType, models);

export const generateAnalysisSummary = (diseaseName: string, confidence: number, cropType: string, models?: string[]) => 
  aiIntegrationService.generateAnalysisSummary(diseaseName, confidence, cropType, models); 