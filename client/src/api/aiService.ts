import axios from 'axios';

// Use the Vite proxy for development
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function generateTitle(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    console.log('Sending title generation request:', { prompt, models: modelsArray, url: `${API_BASE}/ai/generate-title` });
    
    const res = await axios.post(`${API_BASE}/ai/generate-title`, { prompt, models: modelsArray });
    
    console.log('Full response from title generation:', res);
    
    // Validate response
    if (!res.data || !res.data.result) {
      console.error('Invalid response format:', res.data);
      throw new Error('Invalid response format from title generation');
    }
    
    console.log('Title generation response:', res.data.result);
    return res.data.result;
  } catch (error: any) {
    console.error('Error generating title:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Failed to generate title: ${error.response?.data?.detail || error.message}`);
  }
}

export async function generateDescription(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    console.log('Sending description generation request:', { prompt, models: modelsArray, url: `${API_BASE}/ai/generate-description` });
    
    const res = await axios.post(`${API_BASE}/ai/generate-description`, { prompt, models: modelsArray });
    
    console.log('Full response from description generation:', res);
    
    // Validate response
    if (!res.data || !res.data.result) {
      console.error('Invalid response format:', res.data);
      throw new Error('Invalid response format from description generation');
    }
    
    console.log('Description generation response:', res.data.result);
    return res.data.result;
  } catch (error: any) {
    console.error('Error generating description:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Failed to generate description: ${error.response?.data?.detail || error.message}`);
  }
}

export async function generateImage(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const res = await axios.post(`${API_BASE}/ai/generate-image`, { prompt, models: modelsArray });
    console.log('Backend response for image generation:', res.data);
    console.log('Image URL from backend:', res.data.url);
    
    // Validate response
    if (!res.data || !res.data.url) {
      throw new Error('Invalid response format from image generation');
    }
    
    return res.data.url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
}

export async function aiChat(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const res = await axios.post(`${API_BASE}/ai/chat`, { prompt, models: modelsArray });
    
    // Validate response
    if (!res.data || !res.data.result) {
      throw new Error('Invalid response format from AI chat');
    }
    
    console.log('AI chat response:', res.data.result);
    return res.data.result;
  } catch (error) {
    console.error('Error in AI chat:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

export async function diseaseAnalysis(diseaseName: string, confidence: number, cropType: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const prompt = `${diseaseName}|${confidence}|${cropType}`;
    const res = await axios.post(`${API_BASE}/ai/disease-analysis`, { prompt, models: modelsArray });
    
    // Validate response
    if (!res.data || !res.data.result) {
      throw new Error('Invalid response format from disease analysis');
    }
    
    console.log('Disease analysis response:', res.data.result);
    return res.data.result;
  } catch (error) {
    console.error('Error in disease analysis:', error);
    throw new Error('Failed to analyze disease. Please try again.');
  }
}

export async function getAIStatus() {
  try {
    const res = await axios.get(`${API_BASE}/ai/status`);
    
    // Validate response
    if (!res.data) {
      throw new Error('Invalid response format from AI status');
    }
    
    console.log('AI status response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error getting AI status:', error);
    return { status: 'error', error: 'Failed to get AI status' };
  }
} 