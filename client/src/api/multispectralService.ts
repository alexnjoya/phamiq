const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface MultispectralAnalysisResult {
  status: string;
  filename?: string;
  analysis_type: string;
  results: {
    environmental_statistics: Array<{
      name: string;
      min: number;
      max: number;
      mean: number;
      percentile_25: number;
      percentile_75: number;
    }>;
    crop_suitability_statistics: Array<{
      crop: string;
      min: number;
      max: number;
      mean: number;
      percentile_25: number;
      percentile_75: number;
    }>;
    suitability_images: Record<string, string>; // base64 images
    soil_type_image: string; // base64 image
    prediction: string;
    best_crop: string;
    analysis_summary: {
      total_pixels: number;
      valid_pixels: number;
      bands_processed: string[];
    };
  };
}

export interface MultispectralDetectionResult {
  bestCrop: string;
  prediction: string;
  environmentalStats: Array<{
    name: string;
    min: number;
    max: number;
    mean: number;
    percentile_25: number;
    percentile_75: number;
  }>;
  cropSuitabilityStats: Array<{
    crop: string;
    min: number;
    max: number;
    mean: number;
    percentile_25: number;
    percentile_75: number;
  }>;
  suitabilityImages: Record<string, string>;
  soilTypeImage: string;
  analysisSummary: {
    totalPixels: number;
    validPixels: number;
    bandsProcessed: string[];
  };
}

class MultispectralService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Upload multispectral data and get analysis
  async analyzeMultispectral(files: File | File[]): Promise<MultispectralAnalysisResult> {
    try {
      const formData = new FormData();
      
      // Handle both single file and multiple files for backward compatibility
      const fileArray = Array.isArray(files) ? files : [files];
      
      // Append all files to FormData
      fileArray.forEach((file, index) => {
        formData.append('files', file);
      });

      console.log('Sending multispectral analysis request for files:', fileArray.map(f => f.name));

      const response = await fetch(`${API_BASE_URL}/predict/multispectral`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Response error:', errorData);
        throw new Error(errorData.detail || 'Multispectral analysis failed');
      }

      const responseData = await response.json();
      console.log('Raw multispectral response:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('Multispectral analysis error:', error);
      throw error;
    }
  }

  // Submit multispectral analysis as an async job
  async submitMultispectralJob(files: File | File[]): Promise<{ job_id: string; status: string }> {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach((file) => {
      formData.append('files', file);
    });
    const response = await fetch(`${API_BASE_URL}/predict/multispectral/async`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || 'Failed to submit analysis job');
    }
    return await response.json();
  }

  // Poll job status/result
  async pollJobStatus(jobId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/predict/multispectral/status/${jobId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || 'Failed to get job status');
    }
    return await response.json();
  }

  // Convert backend multispectral response to frontend format
  convertMultispectralToDetectionResult(
    analysis: MultispectralAnalysisResult
  ): MultispectralDetectionResult | { limited: true; message: string; metadata: any; rawMetadata: any } {
    console.log('Multispectral analysis response:', analysis);
    
    if (!analysis.results) {
      console.error('No results in response:', analysis);
      throw new Error('No analysis results received');
    }

    const results = analysis.results;

    // Handle limited result (no bands, only metadata)
    if (analysis.status === 'limited' || !results.analysis_summary) {
      return {
        limited: true,
        message: (results as any)?.message || 'Only metadata extracted. Full analysis requires band files.',
        metadata: (results as any)?.metadata || {},
        rawMetadata: (results as any)?.raw_metadata || {},
      };
    }

    return {
      bestCrop: results.best_crop,
      prediction: results.prediction,
      environmentalStats: results.environmental_statistics,
      cropSuitabilityStats: results.crop_suitability_statistics,
      suitabilityImages: results.suitability_images,
      soilTypeImage: results.soil_type_image,
      analysisSummary: {
        totalPixels: results.analysis_summary.total_pixels,
        validPixels: results.analysis_summary.valid_pixels,
        bandsProcessed: results.analysis_summary.bands_processed
      }
    };
  }

  // Get crop suitability information
  getCropSuitabilityInfo(
    cropSuitabilityStats: Array<{
      crop: string;
      min: number;
      max: number;
      mean: number;
      percentile_25: number;
      percentile_75: number;
    }>
  ): {
    bestCrop: string;
    suitabilityScores: Record<string, number>;
    recommendations: string[];
  } {
    if (!cropSuitabilityStats || cropSuitabilityStats.length === 0) {
      return {
        bestCrop: 'Unknown',
        suitabilityScores: {},
        recommendations: ['No crop suitability data available']
      };
    }

    // Find best crop
    const bestCrop = cropSuitabilityStats.reduce((prev, current) => 
      prev.mean > current.mean ? prev : current
    );

    // Create suitability scores object
    const suitabilityScores: Record<string, number> = {};
    cropSuitabilityStats.forEach(stat => {
      suitabilityScores[stat.crop] = stat.mean;
    });

    // Generate recommendations based on best crop
    const recommendations = this.getCropRecommendations(bestCrop.crop, bestCrop.mean);

    return {
      bestCrop: bestCrop.crop,
      suitabilityScores,
      recommendations
    };
  }

  private getCropRecommendations(crop: string, suitabilityScore: number): string[] {
    const recommendations: string[] = [];
    
    if (suitabilityScore >= 0.8) {
      recommendations.push(`Excellent suitability for ${crop} cultivation`);
    } else if (suitabilityScore >= 0.6) {
      recommendations.push(`Good suitability for ${crop} cultivation`);
    } else if (suitabilityScore >= 0.4) {
      recommendations.push(`Moderate suitability for ${crop} cultivation`);
    } else {
      recommendations.push(`Low suitability for ${crop} cultivation - consider alternatives`);
    }

    // Add crop-specific recommendations
    switch (crop.toLowerCase()) {
      case 'cashew':
        recommendations.push('Ensure proper spacing (7-9m between trees) for optimal growth');
        recommendations.push('Cashew trees thrive in warm climates with well-drained soils');
        break;
      case 'cassava':
        recommendations.push('Plant cuttings at 1m spacing for optimal yield');
        recommendations.push('Cassava grows well in various soil types but prefers sandy loams');
        break;
      case 'tomatoes':
        recommendations.push('Consider drip irrigation for optimal water management');
        recommendations.push('Tomatoes require consistent moisture and fertile soil');
        break;
      case 'maize':
        recommendations.push('Plant in rows with 75cm spacing for optimal growth');
        recommendations.push('Maize performs best in deep, well-drained soils with good organic matter');
        break;
    }

    // Add general recommendations
    recommendations.push('Conduct soil tests to verify nutrient levels before planting');
    recommendations.push('Consider crop rotation to maintain soil health');
    recommendations.push('Monitor weather forecasts for optimal planting and harvesting times');

    return recommendations;
  }
}

export const multispectralService = new MultispectralService(); 