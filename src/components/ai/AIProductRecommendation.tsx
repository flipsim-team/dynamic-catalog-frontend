import { useState, useEffect } from 'react';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AIProductRecommendationProps {
  userProfile: any;
  products: any[];
  onProductSelect?: (product: any) => void;
  className?: string;
}

export function AIProductRecommendation({
  userProfile,
  products,
  onProductSelect,
  className,
}: AIProductRecommendationProps) {
  const { loading, error, getRecommendations } = useAI();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      loadRecommendations();
    }
  }, [userProfile, products]);

  const loadRecommendations = async () => {
    const recs = await getRecommendations(userProfile, products);
    setRecommendations(recs);
  };

  return (
    <Card className={cn('border-slate-700 bg-slate-800', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          AI Recommended For You
        </CardTitle>
        <Button
          onClick={loadRecommendations}
          disabled={loading}
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="text-red-400 text-sm">
            Failed to load recommendations: {error.message}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec: any, idx: number) => {
              const product = products.find(
                (p) => p.id === rec.productId || p.id === rec.id
              );
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-slate-500 hover:bg-slate-700/70 transition-all cursor-pointer group"
                  onClick={() => product && onProductSelect?.(product)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">
                        {product?.name || rec.productId}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {rec.reason}
                      </p>
                    </div>
                    <div className="flex-shrink-0 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {rec.score}%
                    </div>
                  </div>

                  {rec.relatedProducts && rec.relatedProducts.length > 0 && (
                    <p className="text-xs text-slate-400">
                      Also matches: {rec.relatedProducts.slice(0, 2).join(', ')}
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:gap-2"
                  >
                    View Product <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : !loading && recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No recommendations available yet</p>
            <Button
              onClick={loadRecommendations}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Generate Recommendations
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
