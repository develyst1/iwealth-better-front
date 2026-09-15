export type ApiErrorBody = {
  error: string;
  code?: string;
};

export type User = {
  id: string;
  email: string;
  createdAt?: string;
};

export type Holding = {
  id?: string;
  symbol: string;
  quantity: number;
  avgCost: number;
};

export type Portfolio = {
  id: string;
  name: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  holdings?: Holding[];
};

export type PriceBar = {
  symbol?: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type MarketEvent = {
  id: string;
  symbol: string;
  type: "filing" | "news" | "earnings" | "other";
  occurredAt: string;
  title: string;
  summary?: string;
  url?: string;
  source?: string;
};

export type CompareResult = {
  symbol: string;
  range: { from: string; to: string };
  bars: PriceBar[];
  events: MarketEvent[];
  peers?: unknown[];
};

export type SummarizeResult = {
  content: string;
  provider?: string;
  model?: string;
  latency_ms?: number;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
