// ChatService.ts
// Complete implementation with fetch API for browser compatibility

// Types for chat functionality
export interface Message {
    id: number;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
  }
  
  export interface ChatHistory {
    id: string;
    title: string;
    updated_at: string;
    created_at: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: string;
    }>;
  }
  
  export interface ChatContext {
    disease: string;
    cropType: string;
    confidence: number;
    severity: string;
    filename?: string;
    created_at?: string;
    image_url?: string;
  }
  
  // Configuration
  const OPENROUTER_API_KEY = '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';
  const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
  const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://phamiq.ai';
  
  // In-memory storage for chat history
  const chatStorage = new Map<string, ChatHistory>();
  
  // Generate a unique ID for new chats
  const generateChatId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  };
  
  // Utility function to generate chat title from first message
  const generateChatTitle = (message: string): string => {
    const words = message.split(' ').slice(0, 5);
    return words.join(' ') + (message.split(' ').length > 5 ? '...' : '');
  };
  
  // ChatService implementation using fetch API
  export const chatService = {
    /**
     * Get AI response from OpenRouter using fetch API
     */
    getAIResponse: async (message: string, chatId?: string): Promise<{ message: string; chatId: string }> => {
      try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Phamiq AI',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an agricultural AI assistant specializing in crop diseases, farming techniques, and agricultural management. Provide helpful, accurate information to farmers and agricultural professionals. Be concise but comprehensive in your responses.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 700,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }
  
        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  
        // Handle chat storage
        const currentChatId = chatId || generateChatId();
        const now = new Date().toISOString();
        
        if (chatStorage.has(currentChatId)) {
          // Update existing chat
          const existingChat = chatStorage.get(currentChatId)!;
          existingChat.messages.push(
            {
              role: 'user',
              content: message,
              timestamp: now
            },
            {
              role: 'assistant',
              content: aiMessage,
              timestamp: now
            }
          );
          existingChat.updated_at = now;
          chatStorage.set(currentChatId, existingChat);
        } else {
          // Create new chat
          const newChat: ChatHistory = {
            id: currentChatId,
            title: generateChatTitle(message),
            created_at: now,
            updated_at: now,
            messages: [
              {
                role: 'user',
                content: message,
                timestamp: now
              },
              {
                role: 'assistant',
                content: aiMessage,
                timestamp: now
              }
            ]
          };
          chatStorage.set(currentChatId, newChat);
        }
  
        return {
          message: aiMessage,
          chatId: currentChatId
        };
      } catch (error) {
        console.error('Error getting AI response:', error);
        throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  
    /**
     * Get AI response with chat context (for continuing conversations)
     */
    getContinuedAIResponse: async (message: string, chatId: string): Promise<{ message: string }> => {
      try {
        const existingChat = chatStorage.get(chatId);
        if (!existingChat) {
          throw new Error('Chat not found');
        }
  
        // Build conversation history
        const conversationMessages = [
          {
            role: 'system' as const,
            content: 'You are an agricultural AI assistant specializing in crop diseases, farming techniques, and agricultural management. Provide helpful, accurate information to farmers and agricultural professionals. Be concise but comprehensive in your responses.'
          },
          ...existingChat.messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })),
          {
            role: 'user' as const,
            content: message
          }
        ];
  
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Phamiq AI',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o',
            messages: conversationMessages,
            temperature: 0.7,
            max_tokens: 700,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }
  
        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  
        // Update chat history
        const now = new Date().toISOString();
        existingChat.messages.push(
          {
            role: 'user',
            content: message,
            timestamp: now
          },
          {
            role: 'assistant',
            content: aiMessage,
            timestamp: now
          }
        );
        existingChat.updated_at = now;
        chatStorage.set(chatId, existingChat);
  
        return { message: aiMessage };
      } catch (error) {
        console.error('Error getting continued AI response:', error);
        throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  
    /**
     * Get AI response with image context (for crop disease analysis)
     */
    getImageAIResponse: async (message: string, imageUrl: string, context?: ChatContext): Promise<{ message: string; chatId: string }> => {
      try {
        const systemPrompt = context 
          ? `You are an agricultural AI assistant specializing in crop diseases, farming techniques, and agricultural management. 
             The user has uploaded an image that has been analyzed and shows: ${context.disease} in ${context.cropType} 
             with ${context.confidence}% confidence and ${context.severity} severity. 
             Use this context to provide detailed, helpful advice about treatment and management.`
          : 'You are an agricultural AI assistant specializing in crop diseases, farming techniques, and agricultural management. Analyze the provided image and give detailed advice about any crop diseases or issues you can identify.';
  
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Phamiq AI',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: message },
                  { type: 'image_url', image_url: { url: imageUrl } }
                ]
              }
            ],
            temperature: 0.7,
            max_tokens: 700,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }
  
        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || "I couldn't analyze the image. Please try again.";
  
        // Create new chat with image context
        const chatId = generateChatId();
        const now = new Date().toISOString();
        
        const newChat: ChatHistory = {
          id: chatId,
          title: context ? `${context.disease} Analysis` : generateChatTitle(message),
          created_at: now,
          updated_at: now,
          messages: [
            {
              role: 'user',
              content: message,
              timestamp: now
            },
            {
              role: 'assistant',
              content: aiMessage,
              timestamp: now
            }
          ]
        };
        chatStorage.set(chatId, newChat);
  
        return {
          message: aiMessage,
          chatId: chatId
        };
      } catch (error) {
        console.error('Error getting image AI response:', error);
        throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  
    /**
     * Get chat history
     */
    getChatHistory: async (limit: number = 20): Promise<ChatHistory[]> => {
      // Return sorted chats from in-memory storage
      const chats = Array.from(chatStorage.values());
      return chats
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, limit);
    },
  
    /**
     * Get a specific chat by ID
     */
    getChatById: async (chatId: string): Promise<ChatHistory> => {
      const chat = chatStorage.get(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }
      return chat;
    },
  
    /**
     * Update chat title
     */
    updateChatTitle: async (chatId: string, newTitle: string): Promise<void> => {
      const chat = chatStorage.get(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }
      chat.title = newTitle;
      chat.updated_at = new Date().toISOString();
      chatStorage.set(chatId, chat);
    },
  
    /**
     * Delete a chat
     */
    deleteChat: async (chatId: string): Promise<void> => {
      if (!chatStorage.has(chatId)) {
        throw new Error('Chat not found');
      }
      chatStorage.delete(chatId);
    },
  
    /**
     * Clear all chat history
     */
    clearAllChats: async (): Promise<void> => {
      chatStorage.clear();
    },
  
    /**
     * Export chat history as JSON
     */
    exportChatHistory: async (): Promise<string> => {
      const chats = Array.from(chatStorage.values());
      return JSON.stringify(chats, null, 2);
    },
  
    /**
     * Import chat history from JSON
     */
    importChatHistory: async (jsonData: string): Promise<void> => {
      try {
        const chats: ChatHistory[] = JSON.parse(jsonData);
        chats.forEach(chat => {
          chatStorage.set(chat.id, chat);
        });
      } catch (error) {
        throw new Error('Invalid chat history format');
      }
    },
  
    /**
     * Check if the chat service is available
     */
    isAvailable: async (): Promise<boolean> => {
      try {
        // Perform a simple request to check if the API is reachable
        const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Phamiq AI',
          },
        });
        return response.ok;
      } catch (error) {
        console.error('Chat service availability test failed:', error);
        return false;
      }
    },
  
    /**
     * Get available models
     */
    getAvailableModels: async (): Promise<string[]> => {
      try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Phamiq AI',
          },
        });
  
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      } catch (error) {
        console.error('Error fetching available models:', error);
        return ['openai/gpt-4o']; // fallback to default model
      }
    },
  
    /**
     * Test backend connection (simulated in frontend-only version)
     */
    testBackendConnection: async (): Promise<boolean> => {
      return true; // Always returns true in this frontend-only implementation
    },
  
    /**
     * Get chat statistics
     */
    getChatStatistics: async (): Promise<{
      totalChats: number;
      totalMessages: number;
      averageMessagesPerChat: number;
      oldestChat: string | null;
      newestChat: string | null;
    }> => {
      const chats = Array.from(chatStorage.values());
      const totalChats = chats.length;
      const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
      const averageMessagesPerChat = totalChats > 0 ? totalMessages / totalChats : 0;
      
      const sortedByDate = chats.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      return {
        totalChats,
        totalMessages,
        averageMessagesPerChat: Math.round(averageMessagesPerChat * 100) / 100,
        oldestChat: sortedByDate[0]?.created_at || null,
        newestChat: sortedByDate[sortedByDate.length - 1]?.created_at || null,
      };
    }
  };
  
  export default chatService;