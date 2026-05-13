import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIAnalyticsDashboardProps {
  sellerData: any;
  className?: string;
}

export function AIAnalyticsDashboard({
  sellerData,
  className,
}: AIAnalyticsDashboardProps) {
  const { loading, error, generateInsights } = useAI();
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    if (sellerData) {
      loadInsights();
    }
  }, [sellerData]);

  const loadInsights = async () => {
    const aiInsights = await generateInsights(sellerData);
    setInsights(aiInsights);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">AI Insights Dashboard</h2>
        <Button
          onClick={loadInsights}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh Insights'
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-800 bg-red-950">
          <CardContent className="pt-6 text-red-200">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <Card
              key={idx}
              className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-colors"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                  {insight.metric}
                  <TrendingIcon trend={insight.trend} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-blue-400">
                  {insight.value}
                </div>
                <p className="text-sm text-slate-300">{insight.recommendation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !loading && insights.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-400 mb-4">No insights generated yet</p>
            <Button onClick={loadInsights} className="bg-blue-600 hover:bg-blue-700">
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function TrendingIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return (
      <span className="inline-block px-2 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-semibold">
        ↑ Up
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-block px-2 py-1 rounded-full bg-red-900/30 text-red-400 text-xs font-semibold">
        ↓ Down
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
      → Stable
    </span>
  );
}
