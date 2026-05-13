// AI Service Types and Interfaces

export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface StreamCallback {
  onToken?: (token: string) => void;
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
}

export interface ProductAnalysis {
  title: string;
  summary: string;
  keyFeatures: string[];
  suggestedTags: string[];
  potentialIssues: string[];
  enhancementSuggestions: string[];
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
  relatedProducts: string[];
}

export interface SellerInsight {
  metric: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export interface SearchQuery {
  query: string;
  category?: string;
  priceRange?: [number, number];
  filters?: Record<string, string[]>;
}

export interface ConversationContext {
  sessionId: string;
  messages: ChatMessage[];
  metadata?: Record<string, any>;
}
