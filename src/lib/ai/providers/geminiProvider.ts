import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { AIService } from '../aiService';
import { AIConfig, ChatMessage, AIResponse, StreamCallback } from '../types';

export class GeminiService extends AIService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: AIConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(this.config.apiKey);
    this.model = config.model || 'gemini-pro';
  }

  async chat(message: string, context?: ChatMessage[]): Promise<AIResponse> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });

      const messages = this.buildMessages(message, context);
      const chat = model.startChat({
        history: this.convertToGeminiHistory(messages.slice(0, -1)),
      });

      const result = await chat.sendMessage(messages[messages.length - 1].content);
      const response = await result.response;
      const content = response.text();

      return {
        content,
        model: this.model,
      };
    } catch (error) {
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async streamChat(
    message: string,
    callbacks: StreamCallback,
    context?: ChatMessage[]
  ): Promise<void> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const messages = this.buildMessages(message, context);
      const chat = model.startChat({
        history: this.convertToGeminiHistory(messages.slice(0, -1)),
      });

      let fullContent = '';
      const stream = await chat.sendMessageStream(
        messages[messages.length - 1].content
      );

      for await (const chunk of stream.stream) {
        const token = chunk.text?.() || '';
        if (token) {
          fullContent += token;
          callbacks.onToken?.(token);
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

  private convertToGeminiHistory(
    messages: ChatMessage[]
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  }
}
