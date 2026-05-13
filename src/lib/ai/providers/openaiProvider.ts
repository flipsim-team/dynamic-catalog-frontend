import OpenAI from 'openai';
import { AIService } from '../aiService';
import { AIConfig, ChatMessage, AIResponse, StreamCallback } from '../types';

export class OpenAIService extends AIService {
  private client: OpenAI;
  private model: string;

  constructor(config: AIConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model || 'gpt-4-turbo';
  }

  async chat(message: string, context?: ChatMessage[]): Promise<AIResponse> {
    const messages = this.buildMessages(message, context);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamChat(
    message: string,
    callbacks: StreamCallback,
    context?: ChatMessage[]
  ): Promise<void> {
    const messages = this.buildMessages(message, context);
    let fullContent = '';

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
        stream: true,
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          fullContent += token;
          callbacks.onToken?.(token);
        }
      }

      callbacks.onComplete?.(fullContent);
    } catch (error) {
      callbacks.onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  private buildMessages(message: string, context?: ChatMessage[]): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Add system message
    messages.push({
      role: 'system',
      content: `You are an AI assistant for an e-commerce seller catalog platform. 
You help sellers manage products, analyze sales, recommend strategies, and interact with customers.
Be helpful, professional, and data-driven in your responses.`,
    });

    // Add conversation history (last 10 messages for context)
    const historyToAdd = [...(context || this.conversationHistory)].slice(-10);
    messages.push(...historyToAdd);

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    return messages;
  }
}
