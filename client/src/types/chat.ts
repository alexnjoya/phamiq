// types/chat.ts
export interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp?: Date;
}

export interface ChatState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

// types/api.ts
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}



export interface ChatCompletionOptions {
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_SITE_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}