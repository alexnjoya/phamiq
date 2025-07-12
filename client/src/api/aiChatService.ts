/**
 * Ask the AI assistant a question, optionally with context and model selection.
 * @param userMessage The user's question or prompt.
 * @param context Optional context (e.g., predicted result summary).
 * @param models Optional list of AI models to use.
 * @returns The AI's response as a string.
 */
export async function askAiChat(userMessage: string, context?: string, models?: string[]): Promise<string> {
  try {
    // Use the new AI chat endpoint
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    
    // Prepare the payload for the backend
    const payload = {
      prompt: userMessage,
      models: models || undefined,
    };
    
    console.log('Sending AI chat request:', { message: userMessage, models });
    
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('AI chat request failed:', res.status, errorText);
      throw new Error(`Failed to get AI response: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log('AI chat response:', data);
    
    if (!data.result) {
      throw new Error('No AI response received');
    }
    
    return data.result;
  } catch (error) {
    console.error('AI chat error:', error);
    throw error;
  }
}

/**
 * Test the AI chat functionality with a simple message.
 * @returns Test result information.
 */
export async function testAiChat(): Promise<any> {
  try {
    console.log('Testing AI chat functionality...');
    
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    
    const res = await fetch(`${API_BASE}/ai/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('AI chat test failed:', res.status, errorText);
      throw new Error(`AI chat test failed: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log('AI chat test response:', data);
    
    return data;
  } catch (error) {
    console.error('AI chat test error:', error);
    throw error;
  }
}

/**
 * Get available AI models from the backend.
 * @returns List of available model names.
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    
    const res = await fetch(`${API_BASE}/ai/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to get available models:', res.status, errorText);
      throw new Error(`Failed to get available models: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Available models response:', data);
    
    if (!data.status || data.status === 'error' || !data.models) {
      throw new Error(data.error || 'No models available');
    }
    
    return data.models;
  } catch (error) {
    console.error('Error getting available models:', error);
    throw error;
  }
} 