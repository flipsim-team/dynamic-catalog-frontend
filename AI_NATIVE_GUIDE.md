# AI-Native Application Conversion Guide

## Overview

This project has been converted into a **comprehensive AI-native application** with multi-provider support, advanced AI features, and intelligent product management capabilities.

## What's New

### 🤖 AI Core Architecture

#### Multi-Provider Support

- **OpenAI (GPT-4 Turbo)** - Default, most capable
- **Anthropic Claude 3** - Alternative, excellent reasoning
- **Google Gemini** - Multi-modal capabilities

The application uses an **abstraction layer** that allows seamless switching between providers without code changes.

#### AI Service Layer

- **Location**: `src/lib/ai/`
- Base classes and interfaces for provider abstraction
- Individual provider implementations
- Manager for handling initialization and provider switching

### 🎯 AI-Powered Features

#### 1. **AI Chat Assistant** (`AIChat.tsx`)

- Natural language conversations about products
- Contextual understanding of your catalog
- Real-time streaming responses
- Suggested quick prompts for common tasks

**Use Cases:**

- "Analyze my top selling products"
- "Suggest improvements for my catalog"
- "Generate product descriptions"
- "Find market opportunities"

#### 2. **Semantic Search** (`AISemanticSearch.tsx`)

- Natural language product discovery
- Understands customer intent
- Finds products beyond exact keyword matching

**Example Query:**

- "affordable blue wireless headphones under $50"
- "sustainable eco-friendly yoga mats"

#### 3. **AI Recommendations** (`AIProductRecommendation.tsx`)

- Personalized product suggestions
- Based on user profile and preferences
- ML-driven relevance scoring
- Related products suggestions

#### 4. **Product Analyzer** (`AIProductAnalyzer.tsx`)

- Automated product analysis
- Key features extraction
- Suggested tags and categories
- Issue detection and optimization suggestions
- Enhancement recommendations

#### 5. **Analytics Dashboard** (`AIAnalyticsDashboard.tsx`)

- AI-generated seller insights
- Trend analysis
- Business recommendations
- Metric tracking with trending indicators

### 📍 Access Points

#### Main AI Page

```
/ai
```

Accessible via the "AI Catalog" button in the top-right of the dashboard.

#### Features Available:

- **Chat Tab**: Direct conversation with AI assistant
- **Search Tab**: Semantic product search
- **Recommendations Tab**: Personalized product suggestions
- **Analyzer Tab**: Deep product analysis
- **Analytics Tab**: Seller insights and trends

## Setup Instructions

### 1. **Install Dependencies**

```bash
bun install
# or
npm install
```

### 2. **Configure Environment Variables**

Copy the example file and configure your API keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API credentials:

```env
# AI Provider Configuration
VITE_AI_PROVIDER=openai  # or 'anthropic' or 'gemini'

# OpenAI
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4-turbo

# Anthropic (optional)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Google Gemini (optional)
VITE_GEMINI_API_KEY=...
VITE_GEMINI_MODEL=gemini-pro

# AI Behavior
VITE_AI_TEMPERATURE=0.7
VITE_AI_MAX_TOKENS=2000

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_AI_RECOMMENDATIONS=true
VITE_ENABLE_AI_ANALYTICS=true
VITE_ENABLE_AI_SEARCH=true
VITE_ENABLE_CONTENT_MODERATION=true
```

### 3. **Get API Keys**

#### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and API key
3. Ensure you have credits for API usage

#### Anthropic Claude

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and API key
3. Set up billing

#### Google Gemini

1. Go to [ai.google.dev](https://ai.google.dev)
2. Create an API key
3. Enable necessary APIs

### 4. **Start Development Server**

```bash
bun run dev
# or
npm run dev
```

Navigate to `http://localhost:5173/ai`

## Architecture

### Directory Structure

```
src/
├── lib/ai/
│   ├── types.ts                    # TypeScript interfaces
│   ├── aiService.ts                # Abstract base service
│   ├── aiManager.ts                # Singleton manager
│   └── providers/
│       ├── openaiProvider.ts       # OpenAI implementation
│       ├── anthropicProvider.ts    # Claude implementation
│       └── geminiProvider.ts       # Gemini implementation
├── components/ai/
│   ├── AIChat.tsx                  # Chat interface
│   ├── AISemanticSearch.tsx        # Semantic search
│   ├── AIProductRecommendation.tsx # Recommendations
│   ├── AIProductAnalyzer.tsx       # Product analysis
│   ├── AIAnalyticsDashboard.tsx    # Insights dashboard
│   └── index.ts                    # Barrel export
├── hooks/
│   └── useAI.ts                    # React hook for AI features
└── pages/
    └── AIPage.tsx                  # Main AI page
```

## Using AI Features in Components

### Quick Start with `useAI` Hook

```tsx
import { useAI } from "@/hooks/useAI";

function MyComponent() {
  const {
    loading,
    error,
    messages,
    sendMessage,
    analyzeProduct,
    search,
    getRecommendations,
    generateInsights,
  } = useAI();

  const handleChat = async () => {
    const response = await sendMessage("What are my best products?");
    console.log(response.content);
  };

  const handleAnalyze = async () => {
    const analysis = await analyzeProduct(productData);
    console.log(analysis);
  };

  // ... rest of component
}
```

### Example: Analyzing a Product

```tsx
import { useAI } from "@/hooks/useAI";

function ProductAnalysisExample({ product }) {
  const { analyzeProduct, loading, error } = useAI();

  const handleAnalyze = async () => {
    const analysis = await analyzeProduct(product);
    // analysis contains:
    // - title: string
    // - summary: string
    // - keyFeatures: string[]
    // - suggestedTags: string[]
    // - potentialIssues: string[]
    // - enhancementSuggestions: string[]
  };

  return (
    <button onClick={handleAnalyze} disabled={loading}>
      {loading ? "Analyzing..." : "Analyze Product"}
    </button>
  );
}
```

### Example: Semantic Search

```tsx
import { AISemanticSearch } from "@/components/ai";

function SearchExample() {
  return (
    <AISemanticSearch
      products={allProducts}
      placeholder="What are you looking for?"
      onProductSelect={(product) => console.log(product)}
    />
  );
}
```

## API Reference

### `useAI()` Hook

Returns an object with the following methods:

#### Chat Methods

- **`sendMessage(message: string)`** - Send a single message
- **`streamMessage(message: string, onToken?: callback)`** - Stream response with tokens
- **`clearHistory()`** - Clear conversation history

#### Product Methods

- **`analyzeProduct(productData: any)`** - Get detailed product analysis
- **`search(query: string, products: any[])`** - Semantic search on products
- **`generateDescription(productInfo: any)`** - Generate product description
- **`extractInfo(text: string)`** - Extract structured data from text

#### Analytics Methods

- **`getRecommendations(userProfile, products)`** - Get recommendations
- **`generateInsights(sellerData)`** - Generate seller insights

#### Moderation

- **`moderate(content: string)`** - Check content for policy violations

#### State

- **`loading`** - Boolean indicating if request is in progress
- **`error`** - Error object if request failed
- **`messages`** - Array of chat messages in conversation

## Switching AI Providers

### At Runtime

```tsx
import { AIManager } from "@/lib/ai/aiManager";

const manager = AIManager.getInstance();
manager.switchProvider("anthropic"); // or 'gemini', 'openai'
```

### Via Environment Variable

Set `VITE_AI_PROVIDER` in `.env.local`:

```env
VITE_AI_PROVIDER=anthropic
```

## Performance Tips

1. **Streaming**: Use `streamMessage()` for better UX on long responses
2. **Temperature**: Lower (0.3-0.5) for factual tasks, higher (0.7-1.0) for creative tasks
3. **Max Tokens**: Adjust `VITE_AI_MAX_TOKENS` based on your needs
4. **Caching**: Consider caching recommendations for repeat users

## Cost Management

### Token Usage Estimates

- Chat message: 100-500 tokens
- Product analysis: 200-800 tokens
- Recommendation generation: 300-1000 tokens
- Semantic search: 400-1500 tokens

### Cost Optimization

1. Use `temperature=0.5-0.7` to reduce variation
2. Batch requests when possible
3. Cache generated descriptions
4. Use shorter context windows

## Troubleshooting

### API Key Not Working

- Check `.env.local` file exists
- Verify API key is correct
- Ensure API has remaining credits
- Check API is enabled in provider dashboard

### No Responses from AI

- Check browser console for errors
- Verify network request in DevTools
- Check API key permissions
- Ensure provider is selected in `VITE_AI_PROVIDER`

### Slow Responses

- Check network speed
- Consider using streaming for better perception of speed
- Reduce `VITE_AI_MAX_TOKENS`
- Switch to faster model (e.g., GPT-3.5 instead of GPT-4)

## Advanced Usage

### Custom AI Service

Create your own provider by extending `AIService`:

```tsx
import { AIService } from "@/lib/ai/aiService";
import { AIConfig, ChatMessage, AIResponse } from "@/lib/ai/types";

export class CustomService extends AIService {
  async chat(message: string, context?: ChatMessage[]): Promise<AIResponse> {
    // Your implementation
  }

  async streamChat(message: string, callbacks: any, context?: ChatMessage[]) {
    // Your implementation
  }
}
```

### Custom Configuration

```tsx
import { AIManager } from "@/lib/ai/aiManager";

AIManager.initialize({
  provider: "openai",
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: "gpt-4-turbo",
  temperature: 0.5,
  maxTokens: 3000,
});
```

## Best Practices

1. ✅ **Always handle errors** - Wrap AI calls in try-catch
2. ✅ **Show loading states** - Provide user feedback during requests
3. ✅ **Cache results** - Don't re-analyze same product multiple times
4. ✅ **Batch requests** - Combine multiple queries when possible
5. ✅ **Monitor costs** - Track API usage and token consumption
6. ✅ **Test with streaming** - Better UX for long responses
7. ✅ **Use context wisely** - Only pass relevant conversation history

## Future Enhancements

- [ ] Caching layer for frequently analyzed products
- [ ] Vector database for semantic search optimization
- [ ] Fine-tuned models for specific domains
- [ ] Multi-language support
- [ ] Image analysis capabilities (with vision models)
- [ ] Batch processing API
- [ ] Advanced prompt templates
- [ ] A/B testing framework for different AI strategies

## Support & Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com)
- [Google Gemini Documentation](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## License

This AI-native conversion maintains the original license of the project.

---

**Happy AI-powered selling! 🚀✨**
