import { useQuery } from "@tanstack/react-query";
import { loadSellerRawDataByGlid } from "@/lib/sellerDataLoader";

export const sellerRawByGlidQueryKey = (glid: string) =>
  ["sellerRaw", glid] as const;

export function useSellerGlidData(sellerId: string | undefined) {
  const glid = sellerId?.trim() ?? "";
  return useQuery({
    queryKey: sellerRawByGlidQueryKey(glid),
    queryFn: () => loadSellerRawDataByGlid(glid),
    enabled: Boolean(glid),
  });
}
