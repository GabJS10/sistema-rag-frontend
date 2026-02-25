# Sistema RAG Frontend

A modern, high-performance web interface for a Retrieval-Augmented Generation (RAG) system, built with cutting-edge web technologies. This application provides a seamless, interactive chat experience to interface with underlying document intelligence and AI services.

## 🚀 Key Features

*   **Interactive Chat Interface:** Real-time chat application with support for Markdown rendering (`react-markdown`) and auto-expanding input areas (`react-textarea-autosize`).
*   **Robust Authentication:** Secure JWT-based authentication system with dedicated login and registration flows.
*   **Modern UI/UX:** Clean, accessible, and responsive interface inspired by shadcn/ui, featuring smooth animations (`framer-motion`) and crisp iconography (`lucide-react`).
*   **Dark Mode Support:** Built-in theme switching (light/dark/system) utilizing `next-themes`.
*   **Optimized Data Fetching:** Efficient server state management, caching, and optimistic updates powered by `@tanstack/react-query`.
*   **Type-Safe Forms:** Rigorous client-side and server-side validation using `react-hook-form` and `zod`.

## 🛠️ Technology Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Library:** [React 19](https://react.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **State Management:** [TanStack Query v5](https://tanstack.com/query/latest)
*   **UI Primitives:** [Radix UI](https://www.radix-ui.com/)
*   **Package Manager:** [pnpm](https://pnpm.io/)

## 📂 Project Architecture

```text
├── app/               # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (auth)/        # Authentication routes (Login, Register)
│   ├── api/           # Route Handlers (Auth, Chat, Dashboard)
│   └── chat/          # Main chat interface and dynamic conversation routes
├── components/        # React Components
│   ├── chat/          # Feature-specific components for the chat UI
│   └── ui/            # Reusable, primitive UI components (Buttons, Inputs, etc.)
├── lib/               # Utility functions, constants, and global types
├── schemas/           # Zod validation schemas for forms and API requests
└── public/            # Static assets
```

## 🏁 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v20+ recommended) and `pnpm` installed on your machine.

```bash
npm install -g pnpm
```

### Installation

1. Clone the repository.
2. Install the project dependencies:

```bash
pnpm install
```

### Development Server

Run the local development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📜 Available Scripts

*   `pnpm dev`: Starts the Next.js development server.
*   `pnpm build`: Creates an optimized production build.
*   `pnpm start`: Starts the production server (requires a prior build).
*   `pnpm lint`: Runs ESLint to check for code quality and styling issues.

## 🔒 Environment Variables

Create a `.env` or `.env.local` file in the root directory to configure the application. *(Note: Ensure you never commit sensitive tokens or secrets to version control).*

```env
# Example environment variables required by the frontend
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
# JWT_SECRET=your_jwt_secret_here
```

## 🧑‍💻 Contributing

When contributing to this project, please adhere to the established conventions documented in the [`AGENTS.md`](./AGENTS.md) file. Key guidelines include:
*   Using `pnpm` for dependency management.
*   Following the `cn()` utility pattern for Tailwind class merging.
*   Ensuring strict typing and rigorous null-checks.
*   Preserving accessibility (`aria-*`) attributes when modifying UI components.