# iwealth-better-front

Next.js + TypeScript + **Ant Design** + Magic UI accents stub for **iWealth Better** (portfolio + historical event compare).

## Stack

- Next.js App Router + TypeScript
- Ant Design 5+ (`ConfigProvider`, Form, Table, Card, Menu, …) + `@ant-design/icons`
- Magic UI accents (lightweight, no shadcn): `ShimmerButton`, `BorderBeam` under `src/shared/ui/magic/`
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
- No Mantine / no shadcn packages
- Push from room may be blocked — commit locally and hand off
