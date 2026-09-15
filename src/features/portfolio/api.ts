import { apiFetch } from "@/shared/api/client";
import type { Portfolio } from "@/shared/lib/types";

export function listPortfolios() {
  return apiFetch<{ items: Portfolio[] }>("/portfolios");
}

export function createPortfolio(name: string) {
  return apiFetch<Portfolio>("/portfolios", {
    method: "POST",
    body: { name },
  });
}

export function getPortfolio(id: string) {
  return apiFetch<Portfolio>(`/portfolios/${encodeURIComponent(id)}`);
}

export function renamePortfolio(id: string, name: string) {
  return apiFetch<Portfolio>(`/portfolios/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { name },
  });
}

export function deletePortfolio(id: string) {
  return apiFetch<{ ok: true }>(`/portfolios/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function upsertHolding(
  portfolioId: string,
  holding: { symbol: string; quantity: number; avgCost: number },
) {
  return apiFetch<Portfolio>(
    `/portfolios/${encodeURIComponent(portfolioId)}/holdings`,
    {
      method: "PUT",
      body: {
        symbol: holding.symbol.toUpperCase(),
        quantity: holding.quantity,
        avgCost: holding.avgCost,
      },
    },
  );
}

export function deleteHolding(portfolioId: string, symbol: string) {
  return apiFetch<{ ok: true }>(
    `/portfolios/${encodeURIComponent(portfolioId)}/holdings/${encodeURIComponent(symbol.toUpperCase())}`,
    { method: "DELETE" },
  );
}
