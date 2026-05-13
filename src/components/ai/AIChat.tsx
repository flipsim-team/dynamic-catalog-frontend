import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AIChatProps {
  onClose?: () => void;
  className?: string;
  suggestedPrompts?: string[];
}

export function AIChat({
  onClose,
  className,
  suggestedPrompts = [
    'Analyze my top selling products',
    'Suggest improvements for my catalog',
    'Generate product descriptions',
    'Find product recommendations',
    'What should I focus on this month?',
  ],
}: AIChatProps) {
  const {
    loading,
    error,
    messages,
    sendMessage,
    streamMessage,
    clearHistory,
    getProvider,
  } = useAI();

  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userInput = input;
    setInput('');
    setStreamingText('');

    try {
      // Use streaming for better UX
      const response = await streamMessage(userInput, (token) => {
        setStreamingText((prev) => prev + token);
      });

      setStreamingText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 shadow-2xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
          <p className="text-xs text-slate-400">Provider: {getProvider()}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !streamingText ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Welcome to AI Assistant
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Ask me anything about your products, sales, or business strategy
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 gap-2 w-full">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors text-sm border border-slate-600 hover:border-slate-500"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn('flex gap-3', {
                    'justify-end': msg.role === 'user',
                  })}
                >
                  <div
                    className={cn('max-w-xs lg:max-w-md px-4 py-2 rounded-lg', {
                      'bg-blue-600 text-white': msg.role === 'user',
                      'bg-slate-700 text-slate-100': msg.role === 'assistant',
                    })}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Streaming text */}
              {streamingText && (
                <div className="flex gap-3">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-slate-700 text-slate-100">
                    <p className="text-sm whitespace-pre-wrap">{streamingText}</p>
                    <span className="inline-block animate-pulse">▊</span>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-200 text-sm">
              Error: {error.message}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {messages.length > 0 && (
          <Button
            onClick={clearHistory}
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-slate-300 hover:text-white"
          >
            Clear Conversation
          </Button>
        )}
      </div>
    </div>
  );
}
