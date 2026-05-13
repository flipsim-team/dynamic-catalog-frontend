import { AIService } from './aiService';
import { OpenAIService } from './providers/openaiProvider';
import { AnthropicService } from './providers/anthropicProvider';
import { GeminiService } from './providers/geminiProvider';
import { AIConfig, AIProvider } from './types';

/**
 * AI Manager - Handles provider selection and initialization
 */
export class AIManager {
  private static instance: AIManager;
  private services: Map<AIProvider, AIService> = new Map();
  private activeProvider: AIProvider;
  private config: AIConfig;

  private constructor(config: AIConfig) {
    this.config = config;
    this.activeProvider = config.provider;
  }

  /**
   * Initialize the AI Manager with a configuration
   */
  static initialize(config: AIConfig): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager(config);
    }
    return AIManager.instance;
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): AIManager {
    if (!AIManager.instance) {
      throw new Error('AIManager not initialized. Call initialize() first.');
    }
    return AIManager.instance;
  }

  /**
   * Get or create a service for a specific provider
   */
  private getService(provider: AIProvider): AIService {
    if (!this.services.has(provider)) {
      const providerConfig: AIConfig = {
        ...this.config,
        provider,
        apiKey: this.getApiKeyForProvider(provider),
      };

      switch (provider) {
        case 'openai':
          this.services.set(provider, new OpenAIService(providerConfig));
          break;
        case 'anthropic':
          this.services.set(provider, new AnthropicService(providerConfig));
          break;
        case 'gemini':
          this.services.set(provider, new GeminiService(providerConfig));
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    }

    return this.services.get(provider)!;
  }

  /**
   * Get API key for a specific provider from environment
   */
  private getApiKeyForProvider(provider: AIProvider): string {
    const keys: Record<AIProvider, string> = {
      openai: import.meta.env.VITE_OPENAI_API_KEY || '',
      anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
    };

    const key = keys[provider];
    if (!key) {
      console.warn(`No API key found for ${provider}`);
    }
    return key;
  }

  /**
   * Get the current active service
   */
  getActiveService(): AIService {
    return this.getService(this.activeProvider);
  }

  /**
   * Switch to a different provider
   */
  switchProvider(provider: AIProvider): void {
    this.activeProvider = provider;
  }

  /**
   * Get the active provider name
   */
  getActiveProvider(): AIProvider {
    return this.activeProvider;
  }

  /**
   * Chat with current provider
   */
  async chat(message: string) {
    return this.getActiveService().chat(message);
  }

  /**
   * Stream chat with current provider
   */
  async streamChat(message: string, callbacks: any) {
    return this.getActiveService().streamChat(message, callbacks);
  }

  /**
   * Analyze product with current provider
   */
  async analyzeProduct(productData: any) {
    return this.getActiveService().analyzeProduct(productData);
  }

  /**
   * Get product recommendations with current provider
   */
  async getProductRecommendations(userProfile: any, products: any[]) {
    return this.getActiveService().getProductRecommendations(userProfile, products);
  }

  /**
   * Generate seller insights with current provider
   */
  async generateSellerInsights(sellerData: any) {
    return this.getActiveService().generateSellerInsights(sellerData);
  }

  /**
   * Semantic search with current provider
   */
  async semanticSearch(query: string, products: any[]) {
    return this.getActiveService().semanticSearch(query, products);
  }

  /**
   * Generate product description with current provider
   */
  async generateProductDescription(productInfo: any) {
    return this.getActiveService().generateProductDescription(productInfo);
  }

  /**
   * Extract product info with current provider
   */
  async extractProductInfo(text: string) {
    return this.getActiveService().extractProductInfo(text);
  }

  /**
   * Moderate content with current provider
   */
  async moderateContent(content: string) {
    return this.getActiveService().moderateContent(content);
  }
}

/**
 * Export a convenience function to initialize and get the manager
 */
export function createAIManager(config: Partial<AIConfig> = {}): AIManager {
  const defaultConfig: AIConfig = {
    provider: (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'openai',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    ...config,
  };

  return AIManager.initialize(defaultConfig);
}
