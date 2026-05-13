import Anthropic from '@anthropic-ai/sdk';
import { AIService } from '../aiService';
import { AIConfig, ChatMessage, AIResponse, StreamCallback } from '../types';

export class AnthropicService extends AIService {
  private client: Anthropic;
  private model: string;

  constructor(config: AIConfig) {
    super(config);
    this.client = new Anthropic({
      apiKey: this.config.apiKey,
    });
    this.model = config.model || 'claude-3-sonnet-20240229';
  }

  async chat(message: string, context?: ChatMessage[]): Promise<AIResponse> {
    const messages = this.buildMessages(message, context);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.config.maxTokens || 2000,
        system: `You are an AI assistant for an e-commerce seller catalog platform. 
You help sellers manage products, analyze sales, recommend strategies, and interact with customers.
Be helpful, professional, and data-driven in your responses.`,
        messages: messages as Anthropic.Messages.MessageParam[],
      });

      const content =
        response.content[0]?.type === 'text' ? response.content[0].text : '';

      return {
        content,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      throw new Error(
        `Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: this.config.maxTokens || 2000,
        system: `You are an AI assistant for an e-commerce seller catalog platform. 
You help sellers manage products, analyze sales, recommend strategies, and interact with customers.
Be helpful, professional, and data-driven in your responses.`,
        messages: messages as Anthropic.Messages.MessageParam[],
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta?.type === 'text_delta'
        ) {
          const token = chunk.delta.text || '';
          if (token) {
            fullContent += token;
            callbacks.onToken?.(token);
          }
        }
      }

      callbacks.onComplete?.(fullContent);
    } catch (error) {
      callbacks.onError?.(
        error instanceof Error ? error : new Error('Unknown streaming error')
      );
    }
  }

  private buildMessages(
    message: string,
    context?: ChatMessage[]
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

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
