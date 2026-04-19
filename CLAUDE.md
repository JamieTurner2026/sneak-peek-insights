# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development-mode build
npm run lint         # ESLint check
npm run test         # Run Vitest tests (single pass)
npm run test:watch   # Run Vitest in watch mode
npm run preview      # Preview production build
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture

**SnapShotz Soles** is a React + TypeScript SPA for AI-powered sneaker identification, market pricing, and drop alerts. It uses Vite for bundling and targets both web and mobile (Capacitor for iOS/Android).

### Key Technology

- **React 18 + React Router 6** — client-side routing; `@/*` maps to `src/*`
- **TanStack Query 5** — all async/server state
- **Supabase** — auth and database; client is initialized in `src/integrations/supabase/client.ts`; the only table currently used is `scan_history`
- **shadcn/ui** (Radix UI primitives) + **Tailwind CSS** — UI components live in `src/components/ui/`
- **React Hook Form + Zod** — form validation

### Application Structure

The main application logic lives almost entirely in **`src/pages/Index.tsx`** (~1947 lines). It contains:
- The full shoe vault (grid/list toggle, shoe cards)
- Shoe detail modal (specs, retail/resale pricing, profit calculation)
- A 5-step checkout flow modal (retailer → size → shipping → payment → confirmation)
- Screen/page switching state machine
- All hardcoded shoe catalog data (5 shoes: AJ1-CHI, AJ3-BLC, DUNK-PND, YZY-ZBR, NB-550) with types `ShoeResult` and `VaultShoe`
- 8 hardcoded retailers (StockX, GOAT, Flight Club, etc.)

### Design System

CSS custom properties defined in `src/index.css`:
- `--bg: #1A1818` (dark background)
- `--surface: #EAB5B5` (rose/pink surface)
- `--red: #D93631` (primary accent)
- `--green: #1e7a3c` (positive/profit indicator)
- `--paper: #EAE6E1` (light background)

Brand fonts: **Oswald** (headers), **Playfair Display** (serif display), **Courier Prime** (monospace). Dark mode is class-based.

### Images

Shoe images are local PNGs in `src/assets/`. `src/components/SneakerImage.tsx` handles primary + Unsplash fallback sources and renders a branded SVG placeholder on failure.

### Environment Variables

Required in `.env`:
```
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
```

### Testing

Vitest with jsdom; Testing Library for React components. Setup file at `src/test/setup.ts` mocks `matchMedia`. Tests match `src/**/*.{test,spec}.{ts,tsx}`.

### Capacitor / Mobile

App ID: `app.lovable.bf8759d722ab453aa5c69df7b1765bb7`, App Name: SnapShotz Soles. Splash screen uses `--bg` dark color. Mobile detection via `src/hooks/use-mobile.tsx`.
