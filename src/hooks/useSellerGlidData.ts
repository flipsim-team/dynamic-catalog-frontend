import { useQuery } from "@tanstack/react-query";
import { loadSellerRawDataByGlid } from "@/lib/sellerDataLoader";

// React Query key for the raw seller payload loaded from Supabase.
export const sellerRawByGlidQueryKey = (glid: string) =>
  ["sellerRaw", glid] as const;

// Fetch and cache one seller catalog by GLID so the page can render the route.
export function useSellerGlidData(sellerId: string | undefined) {
  const glid = sellerId?.trim() ?? "";

  // 5. The route param becomes the cache key and the fetch input, so each seller page loads its own record.
  return useQuery({
    queryKey: sellerRawByGlidQueryKey(glid),
    queryFn: () => loadSellerRawDataByGlid(glid),
    enabled: Boolean(glid),
  });
}
