# iwealth-better-front

Next.js + TypeScript + Mantine v7 stub for **iWealth Better** (portfolio + historical event compare).

## Stack

- Next.js App Router + TypeScript
- Mantine v7 + Tabler icons
- API client → `NEXT_PUBLIC_API_BASE` (default `http://localhost:8787/api/v0`)
- Auth: Bearer token in `localStorage` after login/register
- LLM summarize: **back only** — front never calls `ai.develyst.online`

## Screens

1. Login / Register (email + password, min 8)
2. Portfolio list — create / rename / delete
3. Portfolio detail — holdings CRUD
4. Compare — bars/events stub + **สรุปด้วย AI** via back

## Run

```bash
cp .env.example .env.local
# edit NEXT_PUBLIC_API_BASE if needed
npm install
npm run dev   # http://localhost:3001
```

Typecheck: `npm run typecheck` (or `npx tsc --noEmit`)

## Notes

- Do **not** deploy from this stub
- Do **not** put vendor secrets in the front
- Push from room may be blocked — commit locally and hand off
