import { apiFetch } from "@/shared/api/client";
import type {
  CompareResult,
  MarketEvent,
  PriceBar,
  SummarizeResult,
} from "@/shared/lib/types";

export function getBars(symbol: string, from?: string, to?: string) {
  const q = new URLSearchParams({ symbol: symbol.toUpperCase() });
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  return apiFetch<{ bars: PriceBar[] }>(`/market/bars?${q}`);
}

export function getEvents(
  symbol: string,
  opts?: { from?: string; to?: string; types?: string },
) {
  const q = new URLSearchParams({ symbol: symbol.toUpperCase() });
  if (opts?.from) q.set("from", opts.from);
  if (opts?.to) q.set("to", opts.to);
  if (opts?.types) q.set("types", opts.types);
  return apiFetch<{ events: MarketEvent[] }>(`/market/events?${q}`);
}

export function compare(body: {
  symbol: string;
  from?: string;
  to?: string;
  eventTypes?: string[];
}) {
  return apiFetch<CompareResult>("/compare", {
    method: "POST",
    body: {
      ...body,
      symbol: body.symbol.toUpperCase(),
    },
  });
}

/** Summarize via back only — never call ai.develyst.online from the browser */
export function summarizeCompare(body: {
  compare: CompareResult;
  question?: string;
}) {
  return apiFetch<SummarizeResult>("/compare/summarize", {
    method: "POST",
    body,
  });
}
