/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils";
import { Check } from "lucide-react";
import type { SellerData } from "@/lib/sellerDataExtractor";

type Column = { key: string; label: string };

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "Link";
  } catch {
    return "Link";
  }
}

export default function TrustGraphModal({
  data,
  open,
  onOpenChange,
}: {
  data: SellerData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const columns = useMemo<Column[]>(() => {
    const map = new Map<string, string>();

    // Collect sources from phones, emails, website, whatsapp, and social_urls
    const cs = data.contactSources || ({} as Record<string, any>);
    for (const key of Object.keys(cs)) {
      for (const s of (cs as any)[key] || []) {
        if (!map.has(s.key)) map.set(s.key, s.label);
      }
    }

    // Collect sources from social_urls
    for (const item of data.socialUrls || []) {
      for (const source of item.sources || []) {
        if (!map.has(source.key)) map.set(source.key, source.label);
      }
    }

    // Sort with website first, then google, then alphabetically
    const sorted = Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => {
        if (a.key === "website") return -1;
        if (b.key === "website") return 1;
        if (a.key === "google") return -1;
        if (b.key === "google") return 1;
        return a.label.localeCompare(b.label);
      });
    return sorted;
  }, [data]);

  const rows = useMemo(() => {
    const out: Array<{
      id: string;
      type: string;
      value: string;
      sources: string[];
    }> = [];

    // Phone rows
    const phoneEntries = data.phoneEntries?.length
      ? data.phoneEntries
      : data.primaryPhone
        ? [
            {
              value: data.primaryPhone,
              sources: data.contactSources?.primaryPhone || [],
            },
          ]
        : [];
    for (const p of phoneEntries)
      out.push({
        id: `phone-${p.value}`,
        type: "Phone",
        value: `+91 ${p.value}`,
        sources: (p.sources || []).map((s: any) => s.key),
      });

    // Email rows
    const emailEntries = data.emailEntries?.length
      ? data.emailEntries
      : data.email
        ? [{ value: data.email, sources: data.contactSources?.email || [] }]
        : [];
    for (const e of emailEntries)
      out.push({
        id: `email-${e.value}`,
        type: "Email",
        value: e.value,
        sources: (e.sources || []).map((s: any) => s.key),
      });

    // Website row
    if (data.website)
      out.push({
        id: `website-${data.website}`,
        type: "Website",
        value: data.website,
        sources: (data.contactSources?.website || []).map((s: any) => s.key),
      });

    // CTA (WhatsApp) row
    if (data.whatsappUrl)
      out.push({
        id: `cta-whatsapp`,
        type: "CTA",
        value: data.whatsappUrl,
        sources: (
          data.contactSources?.whatsapp ||
          data.contactSources?.contactCta ||
          []
        ).map((s: any) => s.key),
      });

    // Social URL rows from company_profile.social_urls
    for (let i = 0; i < (data.socialUrls || []).length; i++) {
      const urlItem = data.socialUrls![i];
      out.push({
        id: `social-url-${i}`,
        type: "Social URL",
        value: urlItem.value,
        sources: (urlItem.sources || []).map((s: any) => s.key),
      });
    }

    return out;
  }, [data]);

  useEffect(() => {
    if (open) lockBodyScroll();
    return () => {
      if (open) unlockBodyScroll();
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[calc(100vw-1rem)] sm:w-[calc(100vw-3rem)] max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] p-0 overflow-hidden bg-background flex flex-col">
        <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Trust Graph
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground max-w-2xl">
            Source verification matrix — shows which sources have confirmed each
            URL.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-3 sm:p-6">
          {rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items to display
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border border-border shadow-sm bg-card">
              <table
                className="w-full min-w-[720px] border-collapse"
                style={{
                  minWidth: `${Math.max(720, (columns.length + 1) * 128)}px`,
                }}
              >
                <thead>
                  <tr className="bg-gradient-to-r from-muted/60 to-muted/40 border-b-2 border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground whitespace-nowrap">
                      Item
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-border transition-colors hover:bg-muted/30 ${
                        idx % 2 === 0 ? "bg-background" : "bg-muted/5"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground max-w-xs">
                        {row.type === "Social URL" ? (
                          <a
                            href={row.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline block truncate"
                            title={row.value}
                          >
                            {hostFromUrl(row.value)}
                          </a>
                        ) : (
                          <div>
                            <div className="font-semibold truncate">
                              {row.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {row.type}
                            </div>
                          </div>
                        )}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={`${row.id}-${col.key}`}
                          className="px-4 py-3 text-center"
                        >
                          {row.sources.includes(col.key) ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="text-lg text-muted-foreground/40">
                              —
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
