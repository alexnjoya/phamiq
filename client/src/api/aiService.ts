import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function generateTitle(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const res = await axios.post(`${API_BASE}/ai/generate-title`, { prompt, models: modelsArray });
    return res.data.result;
  } catch (error) {
    console.error('Error generating title:', error);
    throw new Error('Failed to generate title');
  }
}

export async function generateDescription(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const res = await axios.post(`${API_BASE}/ai/generate-description`, { prompt, models: modelsArray });
    return res.data.result;
  } catch (error) {
    console.error('Error generating description:', error);
    throw new Error('Failed to generate description');
  }
}

export async function generateImage(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const res = await axios.post(`${API_BASE}/ai/generate-image`, { prompt, models: modelsArray });
    return res.data.url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
}

export async function aiChat(prompt: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const res = await axios.post(`${API_BASE}/ai/chat`, { prompt, models: modelsArray });
    return res.data.result;
  } catch (error) {
    console.error('Error in AI chat:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function diseaseAnalysis(diseaseName: string, confidence: number, cropType: string, models?: string | string[]) {
  try {
    const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
    const prompt = `${diseaseName}|${confidence}|${cropType}`;
    const res = await axios.post(`${API_BASE}/ai/disease-analysis`, { prompt, models: modelsArray });
    return res.data.result;
  } catch (error) {
    console.error('Error in disease analysis:', error);
    throw new Error('Failed to analyze disease');
  }
}

export async function getAIStatus() {
  try {
    const res = await axios.get(`${API_BASE}/ai/status`);
    return res.data;
  } catch (error) {
    console.error('Error getting AI status:', error);
    return { status: 'error', error: 'Failed to get AI status' };
  }
} 