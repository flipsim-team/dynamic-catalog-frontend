import {
  AIConfig,
  ChatMessage,
  AIResponse,
  StreamCallback,
  ProductAnalysis,
  ProductRecommendation,
  SellerInsight,
  ConversationContext,
} from "./types";

/**
 * Abstract base class for AI providers
 */
export abstract class AIService {
  protected config: AIConfig;
  protected conversationHistory: ChatMessage[] = [];

  constructor(config: AIConfig) {
    this.config = config;
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(`API key not provided for ${this.config.provider}`);
    }
  }

  /**
   * Send a simple message and get a response
   */
  abstract chat(message: string, context?: ChatMessage[]): Promise<AIResponse>;

  /**
   * Stream a chat response
   */
  abstract streamChat(
    message: string,
    callbacks: StreamCallback,
    context?: ChatMessage[],
  ): Promise<void>;

  /**
   * Analyze a product and return insights
   */
  async analyzeProduct(productData: any): Promise<ProductAnalysis> {
    const prompt = `Analyze this product and provide:
1. A concise title/name
2. A 2-3 sentence summary
3. Key features (as array)
4. Suggested tags
5. Potential issues to be aware of
6. Enhancement suggestions

Product data: ${JSON.stringify(productData)}

Respond in JSON format with keys: title, summary, keyFeatures, suggestedTags, potentialIssues, enhancementSuggestions`;

    const response = await this.chat(prompt);
    try {
      return JSON.parse(response.content);
    } catch {
      return this.parseProductAnalysis(response.content);
    }
  }

  /**
   * Generate product recommendations based on user profile
   */
  async getProductRecommendations(
    userProfile: any,
    availableProducts: any[],
  ): Promise<ProductRecommendation[]> {
    const prompt = `Based on this user profile and available products, recommend the top 3-5 products.

User Profile: ${JSON.stringify(userProfile)}

Available Products: ${JSON.stringify(availableProducts.slice(0, 20))}

Respond with a JSON array of recommendations with: productId, score (0-100), reason, relatedProducts array`;

    const response = await this.chat(prompt);
    try {
      return JSON.parse(response.content);
    } catch {
      return this.parseRecommendations(response.content);
    }
  }

  /**
   * Generate seller insights and analytics
   */
  async generateSellerInsights(sellerData: any): Promise<SellerInsight[]> {
    const prompt = `Analyze this seller's data and provide 5-7 key insights about their business:

Seller Data: ${JSON.stringify(sellerData)}

For each insight provide: metric (name), value, trend (up/down/stable), recommendation

Respond in JSON format as an array`;

    const response = await this.chat(prompt);
    try {
      return JSON.parse(response.content);
    } catch {
      return this.parseInsights(response.content);
    }
  }

  /**
   * Search and filter products using natural language
   */
  async semanticSearch(query: string, products: any[]): Promise<any[]> {
    const prompt = `Given this natural language query, find and rank the most relevant products.

Query: "${query}"

Available Products: ${JSON.stringify(products.slice(0, 50))}

Return a JSON array of matching product IDs sorted by relevance, with a score for each.`;

    const response = await this.chat(prompt);
    try {
      const parsed = JSON.parse(response.content);
      return parsed.map((item: any) =>
        products.find((p: any) => p.id === item.productId || p.id === item.id),
      );
    } catch {
      return products.slice(0, 5);
    }
  }

  /**
   * Generate a detailed product description from basic info
   */
  async generateProductDescription(productInfo: any): Promise<string> {
    const prompt = `Generate a compelling, detailed product description (200-300 words) for this product:

${JSON.stringify(productInfo)}

Make it engaging, highlight key benefits, and suitable for an e-commerce catalog.`;

    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * Extract structured data from unstructured text
   */
  async extractProductInfo(text: string): Promise<Record<string, any>> {
    const prompt = `Extract product information from this text and return as JSON:

${text}

Extract: name, description, price, category, features, tags, condition, etc.`;

    const response = await this.chat(prompt);
    try {
      return JSON.parse(response.content);
    } catch {
      return { raw: response.content };
    }
  }

  /**
   * Moderate content for policy violations
   */
  async moderateContent(content: string): Promise<{
    isSafe: boolean;
    score: number;
    reasons: string[];
  }> {
    const prompt = `Analyze this content for policy violations or inappropriate content:

"${content}"

Respond with JSON: { isSafe: boolean, score: 0-100, reasons: string[] }
Score 0 = completely safe, 100 = severe violations`;

    const response = await this.chat(prompt);
    try {
      return JSON.parse(response.content);
    } catch {
      return { isSafe: true, score: 0, reasons: [] };
    }
  }

  /**
   * Add message to conversation history
   */
  addToHistory(message: ChatMessage): void {
    this.conversationHistory.push(message);
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Parse product analysis from text response
   */
  protected parseProductAnalysis(text: string): ProductAnalysis {
    return {
      title: "Product",
      summary: text,
      keyFeatures: [],
      suggestedTags: [],
      potentialIssues: [],
      enhancementSuggestions: [],
    };
  }

  /**
   * Parse recommendations from text response
   */
  protected parseRecommendations(text: string): ProductRecommendation[] {
    return [];
  }

  /**
   * Parse insights from text response
   */
  protected parseInsights(text: string): SellerInsight[] {
    return [];
  }
}
