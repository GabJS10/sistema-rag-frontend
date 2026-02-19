# Agent Guidelines for Sistema RAG Frontend

This document contains guidelines for AI agents and developers working on this codebase.

## 1. Environment & Tooling

- **Package Manager:** `pnpm` (Core)
  - Install dependencies: `pnpm install`
  - Add dependency: `pnpm add <package>`
  - Add dev dependency: `pnpm add -D <package>`

- **Build & Run Scripts:**
  - Development Server: `pnpm dev`
  - Production Build: `pnpm build`
  - Production Start: `pnpm start`
  - Linting: `pnpm lint`

- **Testing:**
  - **Status:** No test framework is currently configured in `package.json`.
  - **Action:** Do not attempt to run tests (`pnpm test`) as the script does not exist. If specifically asked to add tests, verify the preferred framework (Jest/Vitest/Playwright) with the user first.

## 2. Code Style & Conventions

### General
- **Language:** TypeScript (`.ts`, `.tsx`) is strict. Avoid `any` types; define interfaces or types for props and state.
- **Formatting:** Prettier-like formatting (2 spaces, double quotes, semicolons).
- **Imports:**
  - Use the `@/` alias for local imports (e.g., `import { cn } from "@/lib/utils"`).
  - Group imports: Built-ins -> Third-party -> Local Components -> Local Utils/Types.

### React / Next.js
- **Framework:** Next.js 16 (App Router).
- **Components:**
  - Use **Function Components** with named exports (`export function MyComponent() {...}`).
  - Directives: Explicitly add `"use client";` at the top of components using hooks or interactivity.
  - Props: Define props with `interface` (e.g., `MyComponentProps`). Extend native props when wrapping elements (e.g., `React.ComponentProps<"button">`).

### Styling (Tailwind CSS)
- **Engine:** Tailwind CSS v4.
- **Utility:** Use `cn(...)` (from `@/lib/utils`) for conditional class merging.
- **Pattern:** `className={cn("base-classes", condition && "conditional-classes", className)}`.
- **Icons:** Use `lucide-react`.

### UI Components (shadcn/ui)
- This project uses a structure inspired by shadcn/ui.
- **Location:** Reusable UI components are in `components/ui/`.
- **Modification:** When modifying these, keep the `cva` (class-variance-authority) pattern for variants.

## 3. Project Structure

- `app/` - Next.js App Router pages, layouts, and route handlers.
- `components/` - React components.
  - `components/ui/` - Generic/Primitive UI components (buttons, inputs, etc.).
  - `components/chat/` - Feature-specific components (e.g., Chat interface).
- `lib/` - Utilities (e.g., `utils.ts`, constants).
- `public/` - Static assets.

## 4. Error Handling & State
- Use strict null checks.
- For form handling, `react-hook-form` + `zod` is the preferred pattern.
- For async state, `@tanstack/react-query` is available.

## 5. Agent Behavior
- **Refactoring:** When modifying existing components, preserve existing accessible patterns (`aria-*` attributes) and animations (`framer-motion`).
- **Dependencies:** Do not install new heavy libraries without verifying if an existing one (e.g., `date-fns`, `lodash`) can solve the problem, or if native JS suffices.
- **Verification:** Since there are no automated tests, double-check logic changes and ensure no type errors (`pnpm build` or type-check) are introduced.
