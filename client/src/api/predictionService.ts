const API_BASE_URL = import.meta.env.VITE_API_URL;

import { toast } from "@/components/ui/use-toast";

export interface PredictionItem {
  class: string; // Backend schema uses alias "class" for class_name field
  confidence: number;
  confidence_percentage: string;
}

export interface DiseaseRecommendations {
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
  severity_level: string;
  professional_help: string;
}

export interface PredictionResponse {
  status: string;
  filename?: string;
  predictions: PredictionItem[];
  total_classes: number;
  recommendations?: DiseaseRecommendations;
  llm_available: boolean;
}

export interface DetectionResult {
  disease: string;
  confidence: number;
  severity: string;
  cropType: string;
  imageUrl: string;
  recommendations?: DiseaseRecommendations;
  llm_available?: boolean;
}

export class PredictionService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Upload image and get prediction
  async predictDisease(file: File, topK: number = 3): Promise<PredictionResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending prediction request for file:', file.name);

      const response = await fetch(`${API_BASE_URL}/predict/?top_k=${topK}`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.detail || errorData.message || "Prediction failed. Please try again.";
        toast({
          title: "Prediction Error",
          description: message,
          variant: "destructive",
        });
        throw new Error(message);
      }

      const responseData = await response.json();
      console.log('Raw prediction response:', responseData);
      
      return responseData;
    } catch (error: any) {
      toast({
        title: "Prediction Error",
        description: error.message || "Prediction failed. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Convert backend prediction response to frontend format
  convertPredictionToDetectionResult(
    prediction: PredictionResponse, 
    imageUrl: string,
    multiSpectralMode: boolean = false
  ): DetectionResult {
    console.log('Prediction response:', prediction);
    
    if (!prediction.predictions || prediction.predictions.length === 0) {
      console.error('No predictions in response:', prediction);
      throw new Error('No predictions received');
    }

    const topPrediction = prediction.predictions[0];
    console.log('Top prediction:', topPrediction);
    
    // Backend schema uses alias "class" for class_name field
    const diseaseName = topPrediction.class;
    
    if (!diseaseName) {
      console.error('Invalid top prediction - no class name:', topPrediction);
      throw new Error('Invalid prediction data');
    }

    const confidence = topPrediction.confidence * 100;

    console.log('Disease name:', diseaseName, 'Confidence:', confidence);

    // Determine severity based on confidence
    let severity = 'Mild';
    if (confidence > 80) {
      severity = 'Severe';
    } else if (confidence > 60) {
      severity = 'Moderate';
    }

    // Extract crop type from disease name
    const cropType = this.extractCropType(diseaseName);

    return {
      disease: diseaseName,
      confidence: Math.round(confidence * 10) / 10, // Round to 1 decimal place
      severity,
      cropType,
      imageUrl,
      recommendations: prediction.recommendations,
      llm_available: prediction.llm_available
    };
  }

  // Extract crop type from disease name
  private extractCropType(diseaseName: string): string {
    if (!diseaseName || typeof diseaseName !== 'string') {
      return 'Unknown Crop';
    }

    const lowerDisease = diseaseName.toLowerCase();
    
    if (lowerDisease.includes('cashew')) return 'Cashew';
    if (lowerDisease.includes('cassava')) return 'Cassava';
    if (lowerDisease.includes('maize')) return 'Maize';
    if (lowerDisease.includes('tomato')) return 'Tomato';
    
    return 'Unknown Crop';
  }

  // Get LLM recommendations for a disease (for history items)
  async getDiseaseRecommendations(diseaseName: string, confidence: number, cropType: string): Promise<DiseaseRecommendations> {
    try {
      // Make a request to get LLM recommendations
      const response = await fetch(`${API_BASE_URL}/predict/recommendations/${encodeURIComponent(diseaseName)}?confidence=${confidence}&crop_type=${encodeURIComponent(cropType)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to get LLM recommendations');
      }

      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error getting disease recommendations:', error);
      throw error;
    }
  }

  // Get treatment information based on disease
  getTreatmentInfo(diseaseName: string, multiSpectralMode: boolean = false, recommendations?: DiseaseRecommendations): {
    about: string;
    immediateAction: string[];
    treatmentOptions: string[];
    prevention: string[];
    severity?: string;
    monitoring?: string;
    llmGenerated: boolean;
  } {
    // Use LLM recommendations if available, otherwise provide basic fallback
    if (!recommendations) {
      // Provide basic fallback information
      return {
        about: `This is ${diseaseName}, a common crop disease. For detailed treatment recommendations, please ensure the AlleAI API is properly configured.`,
        immediateAction: [
          "Isolate affected plants",
          "Remove severely infected leaves",
          "Improve air circulation"
        ],
        treatmentOptions: [
          "Apply appropriate fungicide",
          "Use organic treatments if available"
        ],
        prevention: [
          "Maintain proper spacing between plants",
          "Avoid overhead watering",
          "Monitor plants regularly"
        ],
        severity: "Moderate",
        monitoring: "Check for new infections weekly",
        llmGenerated: false
      };
    }

    return {
      about: recommendations.disease_overview,
      immediateAction: recommendations.immediate_actions.split('. ').filter(action => action.trim()),
      treatmentOptions: [
        recommendations.treatment_protocols.organic,
        recommendations.treatment_protocols.chemical,
        recommendations.treatment_protocols.application
      ].filter(option => option.trim()),
      prevention: recommendations.prevention.split('. ').filter(prevention => prevention.trim()),
      severity: recommendations.severity_level,
      monitoring: recommendations.monitoring,
      llmGenerated: true
    };
  }


}

export const predictionService = new PredictionService(); 