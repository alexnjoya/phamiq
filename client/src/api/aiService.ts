import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function generateTitle(prompt: string, models?: string | string[]) {
  const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
  const res = await axios.post(`${API_BASE}/ai/generate-title`, { prompt, models: modelsArray });
  return res.data.result;
}

export async function generateDescription(prompt: string, models?: string | string[]) {
  const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
  const res = await axios.post(`${API_BASE}/ai/generate-description`, { prompt, models: modelsArray });
  return res.data.result;
}

export async function generateImage(prompt: string, models?: string | string[]) {
  const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
  const res = await axios.post(`${API_BASE}/ai/generate-image`, { prompt, models: modelsArray });
  return res.data.url;
} 