/** API base including /api/v0 — never call ai.develyst.online from the front */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8787/api/v0"
).replace(/\/$/, "");
