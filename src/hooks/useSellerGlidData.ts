import { useQuery } from "@tanstack/react-query";
import { loadSellerRawDataByGlid } from "@/lib/sellerDataLoader";

// React Query key for the raw seller payload loaded from the data folder.
export const sellerRawByGlidQueryKey = (glid: string) =>
  ["sellerRaw", glid] as const;

// Fetch and cache one seller catalog by GLID/filename so the page can render the route.
export function useSellerGlidData(sellerId: string | undefined) {
  const glid = sellerId?.trim() ?? "";
  return useQuery({
    queryKey: sellerRawByGlidQueryKey(glid),
    queryFn: () => loadSellerRawDataByGlid(glid),
    enabled: Boolean(glid),
  });
}
