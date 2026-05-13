import { useState } from "react";
import { Loader2, Wand2, Tag, AlertTriangle, Lightbulb } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AIProductAnalyzerProps {
  product: any;
  className?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export function AIProductAnalyzer({
  product,
  className,
  onAnalysisComplete,
}: AIProductAnalyzerProps) {
  const { loading, analyzeProduct } = useAI();
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    const result = await analyzeProduct(product);
    if (result) {
      setAnalysis(result);
      onAnalysisComplete?.(result);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            AI Product Analysis
          </CardTitle>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </CardHeader>

        {!analysis && !loading && (
          <CardContent className="text-center py-8 text-slate-400">
            Click analyze to get AI insights about this product
          </CardContent>
        )}

        {loading && (
          <CardContent className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </CardContent>
        )}

        {analysis && (
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="font-semibold text-white mb-2">Summary</h3>
              <p className="text-slate-300 text-sm">{analysis.summary}</p>
            </div>

            {/* Key Features */}
            {analysis.keyFeatures && analysis.keyFeatures.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Key Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyFeatures.map((feature: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-blue-900/50 text-blue-200"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Tags */}
            {analysis.suggestedTags && analysis.suggestedTags.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Suggested Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedTags.map((tag: string, idx: number) => (
                    <Badge
                      key={idx}
                      className="bg-green-900/50 text-green-200 cursor-pointer hover:bg-green-800/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Potential Issues */}
            {analysis.potentialIssues &&
              analysis.potentialIssues.length > 0 && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <h3 className="font-semibold text-red-200 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Potential Issues
                  </h3>
                  <ul className="space-y-1">
                    {analysis.potentialIssues.map(
                      (issue: string, idx: number) => (
                        <li key={idx} className="text-sm text-red-300">
                          • {issue}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

            {/* Enhancement Suggestions */}
            {analysis.enhancementSuggestions &&
              analysis.enhancementSuggestions.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                  <h3 className="font-semibold text-yellow-200 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Enhancement Suggestions
                  </h3>
                  <ul className="space-y-1">
                    {analysis.enhancementSuggestions.map(
                      (suggestion: string, idx: number) => (
                        <li key={idx} className="text-sm text-yellow-300">
                          • {suggestion}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
