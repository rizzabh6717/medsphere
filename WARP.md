# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Vite + React + TypeScript + Tailwind CSS + shadcn/ui. Routing via react-router-dom. State/query layer wired with @tanstack/react-query.
- Important: Path alias "@" resolves to "src" (configured in vite.config.ts and tsconfig). Use imports like `@/components/ui/button`.
- Dev server: Vite runs on port 8080 (see vite.config.ts) and binds to all interfaces (host "::").

Commands
- Install deps
  ```bash path=null start=null
  npm install
  ```
- Start dev server (hot reload)
  ```bash path=null start=null
  npm run dev
  ```
- Build (production)
  ```bash path=null start=null
  npm run build
  ```
- Build (development mode)
  ```bash path=null start=null
  npm run build:dev
  ```
- Preview built app
  ```bash path=null start=null
  npm run preview
  ```
- Lint
  ```bash path=null start=null
  npm run lint
  ```
- Tests
  - No test runner/config present (no jest/vitest/cypress configs; no test files). Running a single test is not applicable.

High-level architecture
- Entry points
  - `index.html` bootstraps the app.
  - `src/main.tsx` mounts React and imports global styles from `src/index.css`.
  - `src/App.tsx` sets global providers and routes:
    - Providers: QueryClientProvider (TanStack Query), TooltipProvider, shadcn Toasters.
    - Router: BrowserRouter with route table; a catch-all `*` renders `NotFound`.
- Routing
  - Page components live in `src/pages` (e.g., `Landing`, `Dashboard`, `DoctorDetails`, `Appointments`, etc.).
  - To add a route, create a component in `src/pages`, import it in `src/App.tsx`, and add a `<Route>` above the catch-all.
- UI system
  - Reusable primitives live under `src/components/ui` (shadcn-generated components: `button`, `card`, `dialog`, `select`, etc.).
  - App-specific components (e.g., `NavigationHeader`, `BackButton`) live under `src/components`.
- Styling and design tokens
  - Tailwind is configured in `tailwind.config.ts` with `darkMode: "class"` and content scanning for `./src/**/*.{ts,tsx}` (plus common folders).
  - Design tokens (CSS variables for colors, gradients, shadows, transitions, radii) are defined in `src/index.css` under `@layer base` for both light and dark themes.
  - Animations from `tailwindcss-animate` are enabled.
- State/data
  - React state for local UI; TanStack Query client is initialized globally (ready for data fetching).
  - Helpers live in `src/lib` (e.g., `utils.ts` with `cn`). Custom hooks in `src/hooks` (e.g., `use-mobile`, `use-toast`).
- Assets
  - Static images are in `src/assets` and imported via the module system (e.g., `@/assets/hero-doctor.jpg`).
- Tooling and configuration
  - Vite config: `vite.config.ts` sets port 8080, host "::", enables `@vitejs/plugin-react-swc`, and defines alias `@ -> src`.
  - TypeScript: `tsconfig.app.json` (bundler mode) and `tsconfig.json` declare baseUrl and `@/*` paths. `tsconfig.node.json` covers Vite config typing.
  - ESLint: `eslint.config.js` uses `@eslint/js`, `typescript-eslint`, `react-hooks`, and `react-refresh`. `npm run lint` lints the repo (dist is ignored).

Important README highlights
- Edit locally (Node.js + npm required): `npm i` then `npm run dev`.
- See `README.md` for setup and deployment instructions.

Conventions and tips specific to this repo
- Use the `@` alias for imports from `src`.
- Add new routes in `src/App.tsx`; keep the catch-all `*` route last.
- Use shadcn components from `src/components/ui` and Tailwind tokens defined in `src/index.css` for consistent theming.

Data persistence
- The app uses browser localStorage for data persistence (no backend)
- Storage utilities are in `src/lib/storage.ts`
- Key data stored: appointments, notifications, user profile, family members
- All data persists across browser refreshes
- To reset data: `localStorage.clear()` in browser console
- See `STORAGE_IMPLEMENTATION.md` for detailed documentation

Authentication (Demo)
- OTP system is simulated for demo/portfolio purposes
- OTPs are logged to browser console (F12) for testing
- 6-digit codes with 5-minute expiry and 3-attempt limit
- See `OTP_SYSTEM.md` for testing instructions
