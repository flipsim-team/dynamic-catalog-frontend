import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AIChat,
  AIProductRecommendation,
  AIAnalyticsDashboard,
  AISemanticSearch,
  AIProductAnalyzer,
} from '@/components/ai';
import { MessageSquare, Sparkles, BarChart3, Search, Wand2 } from 'lucide-react';
import { useSellerGlidData } from '@/hooks/useSellerGlidData';

export default function AIPage() {
  const { catalogProducts = [], sellerData = {} } = useSellerGlidData();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            AI-Native Seller Catalog
          </h1>
          <p className="text-slate-400">
            Experience your product catalog with AI-powered insights, recommendations, and analytics
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-slate-800 border border-slate-700">
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Recs</span>
            </TabsTrigger>
            <TabsTrigger
              value="analyzer"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analyzer</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIChat
                  className="h-[600px]"
                  suggestedPrompts={[
                    'Analyze my best performing products',
                    'Suggest ways to improve product visibility',
                    'What categories should I focus on?',
                    'Generate product descriptions for my catalog',
                    'Help me optimize pricing strategy',
                  ]}
                />
              </div>
              <div className="hidden lg:block">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-white">Tips</h3>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Ask about product categories and market trends</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Get recommendations for pricing strategies</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Analyze competitor products</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Generate SEO-optimized descriptions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-8">
            <AISemanticSearch
              products={catalogProducts}
              onProductSelect={setSelectedProduct}
              className="space-y-4"
              placeholder="Find products using natural language..."
            />
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-8">
            <AIProductRecommendation
              userProfile={{
                interests: ['technology', 'productivity'],
                budgetRange: [50, 500],
                recentPurchases: [],
              }}
              products={catalogProducts}
              onProductSelect={setSelectedProduct}
            />
          </TabsContent>

          {/* Analyzer Tab */}
          <TabsContent value="analyzer" className="mt-8">
            {selectedProduct ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AIProductAnalyzer
                    product={selectedProduct}
                    onAnalysisComplete={(analysis) => {
                      console.log('Analysis:', analysis);
                    }}
                  />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-4">Selected Product</h3>
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="font-semibold text-white">{selectedProduct.name}</h4>
                  <p className="text-slate-400 text-sm mt-2">
                    {selectedProduct.description}
                  </p>
                  {selectedProduct.price && (
                    <p className="text-blue-400 font-semibold mt-4">
                      ${selectedProduct.price}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-400 mb-4">
                  Use the Search or Recommendations tabs to select a product to analyze
                </p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-8">
            <AIAnalyticsDashboard
              sellerData={{
                totalProducts: catalogProducts.length,
                totalSales: 15420,
                avgRating: 4.8,
                conversionRate: 0.034,
                averageOrderValue: 87.5,
                repeatCustomers: 0.42,
                topCategory: 'Technology',
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
