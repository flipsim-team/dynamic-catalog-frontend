import { useState, useCallback, useEffect } from 'react';
import { AIManager } from '@/lib/ai/aiManager';
import { ChatMessage, AIResponse, ProductAnalysis, AIProvider } from '@/lib/ai/types';

export function useAI() {
  const [aiManager, setAIManager] = useState<AIManager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize AI manager
  useEffect(() => {
    try {
      const manager = AIManager.getInstance();
      setAIManager(manager);
    } catch {
      const manager = AIManager.initialize({
        provider: 'openai',
        apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      });
      setAIManager(manager);
    }
  }, []);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (message: string): Promise<AIResponse | null> => {
      if (!aiManager) return null;

      setLoading(true);
      setError(null);

      try {
        // Add user message to history
        const userMessage: ChatMessage = { role: 'user', content: message };
        setMessages((prev) => [...prev, userMessage]);

        // Get AI response
        const response = await aiManager.chat(message);

        // Add assistant message to history
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Stream a message to the AI
   */
  const streamMessage = useCallback(
    async (
      message: string,
      onToken?: (token: string) => void
    ): Promise<string> => {
      if (!aiManager) return '';

      setLoading(true);
      setError(null);

      return new Promise((resolve, reject) => {
        // Add user message to history
        const userMessage: ChatMessage = { role: 'user', content: message };
        setMessages((prev) => [...prev, userMessage]);

        let fullContent = '';

        aiManager
          .streamChat(message, {
            onToken: (token) => {
              fullContent += token;
              onToken?.(token);
            },
            onComplete: (content) => {
              const assistantMessage: ChatMessage = {
                role: 'assistant',
                content,
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setLoading(false);
              resolve(content);
            },
            onError: (error) => {
              setError(error);
              setLoading(false);
              reject(error);
            },
          })
          .catch(reject);
      });
    },
    [aiManager]
  );

  /**
   * Analyze a product
   */
  const analyzeProduct = useCallback(
    async (productData: any): Promise<ProductAnalysis | null> => {
      if (!aiManager) return null;

      setLoading(true);
      setError(null);

      try {
        return await aiManager.analyzeProduct(productData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Get product recommendations
   */
  const getRecommendations = useCallback(
    async (userProfile: any, products: any[]) => {
      if (!aiManager) return [];

      setLoading(true);
      setError(null);

      try {
        return await aiManager.getProductRecommendations(userProfile, products);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Generate seller insights
   */
  const generateInsights = useCallback(
    async (sellerData: any) => {
      if (!aiManager) return [];

      setLoading(true);
      setError(null);

      try {
        return await aiManager.generateSellerInsights(sellerData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Semantic search
   */
  const search = useCallback(
    async (query: string, products: any[]) => {
      if (!aiManager) return [];

      setLoading(true);
      setError(null);

      try {
        return await aiManager.semanticSearch(query, products);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Generate product description
   */
  const generateDescription = useCallback(
    async (productInfo: any) => {
      if (!aiManager) return '';

      setLoading(true);
      setError(null);

      try {
        return await aiManager.generateProductDescription(productInfo);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return '';
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Extract product info from text
   */
  const extractInfo = useCallback(
    async (text: string) => {
      if (!aiManager) return {};

      setLoading(true);
      setError(null);

      try {
        return await aiManager.extractProductInfo(text);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return {};
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Moderate content
   */
  const moderate = useCallback(
    async (content: string) => {
      if (!aiManager) return { isSafe: true, score: 0, reasons: [] };

      setLoading(true);
      setError(null);

      try {
        return await aiManager.moderateContent(content);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return { isSafe: true, score: 0, reasons: [] };
      } finally {
        setLoading(false);
      }
    },
    [aiManager]
  );

  /**
   * Switch provider
   */
  const switchProvider = useCallback((provider: AIProvider) => {
    if (aiManager) {
      aiManager.switchProvider(provider);
    }
  }, [aiManager]);

  /**
   * Clear message history
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Get current provider
   */
  const getProvider = useCallback(() => {
    return aiManager?.getActiveProvider() || 'openai';
  }, [aiManager]);

  return {
    // State
    loading,
    error,
    messages,
    
    // Methods
    sendMessage,
    streamMessage,
    analyzeProduct,
    getRecommendations,
    generateInsights,
    search,
    generateDescription,
    extractInfo,
    moderate,
    switchProvider,
    clearHistory,
    getProvider,
  };
}
