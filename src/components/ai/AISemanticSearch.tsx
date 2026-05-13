import { useState } from 'react';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AISemanticSearchProps {
  products: any[];
  onResultsChange?: (results: any[]) => void;
  onProductSelect?: (product: any) => void;
  className?: string;
  placeholder?: string;
}

export function AISemanticSearch({
  products,
  onResultsChange,
  onProductSelect,
  className,
  placeholder = 'Describe what you\'re looking for...',
}: AISemanticSearchProps) {
  const { loading, search } = useAI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const searchResults = await search(query, products);
    setResults(searchResults.filter(Boolean));
    onResultsChange?.(searchResults.filter(Boolean));
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 px-4"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Results */}
      {searched && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((product) => (
            <div
              key={product.id}
              onClick={() => onProductSelect?.(product)}
              className="p-3 rounded-lg bg-slate-700 border border-slate-600 hover:border-blue-500 hover:bg-slate-700/80 transition-all cursor-pointer group"
            >
              <div className="flex gap-3">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {product.description || 'No description'}
                  </p>
                  {product.price && (
                    <p className="text-sm text-blue-400 font-semibold mt-1">
                      ${product.price}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="text-center py-8 rounded-lg bg-slate-700/30 border border-slate-600">
          <p className="text-slate-400">No products found matching your query</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-8 text-slate-400">
          <p>Use natural language to find products</p>
          <p className="text-sm mt-2">e.g., "affordable blue wireless headphones"</p>
        </div>
      )}
    </div>
  );
}
