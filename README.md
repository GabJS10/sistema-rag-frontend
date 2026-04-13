# Sistema RAG Frontend

A modern frontend application for a Retrieval-Augmented Generation (RAG) system built with Next.js 16 and React 19.

## Overview

This project provides a complete user interface for a RAG-based AI system. It features real-time chat with streaming responses via WebSockets, allowing users to see the AI's "thinking" process, token generation, and the exact document sources used to formulate answers. It also includes a robust dashboard for managing documents (uploading, deleting, embedding) and user settings.

## Features

- **Real-time Chat Interface**:
  - WebSocket connection for streaming AI responses.
  - Live feedback during generation (e.g., "Analizando historial...").
  - Source attribution (displays documents used for the answer).
  - Chat history and conversation management.
  - Markdown rendering with `react-markdown`.
- **Document Management Dashboard**:
  - Upload new documents to the knowledge base.
  - View, manage, and delete existing documents.
  - Trigger document embeddings.
- **User Authentication**:
  - Registration and login flow.
  - Secure JWT token handling via HttpOnly cookies.
  - User profile management.
- **Modern UI & UX**:
  - Built with Tailwind CSS v4 and Radix UI components (shadcn/ui style).
  - Dark mode support (`next-themes`).
  - Smooth animations using Framer Motion.
  - Toast notifications via Sonner.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

- Node.js (version 20 or higher recommended)
- pnpm

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd sistema-rag-frontend
   ```

2. Install the dependencies using pnpm:
   ```bash
   pnpm install
   ```

### Development Server

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

To create an optimized production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## Project Structure

- `/app`: Next.js App Router (pages, layouts, and API routes).
  - `/(auth)`: Authentication routes (login, register).
  - `/api`: API endpoints (auth, chat, dashboard, Supabase proxies).
  - `/chat`: Chat interface pages.
  - `/dashboard`: Document and settings management pages.
- `/components`: Reusable React components.
  - `/ui`: Base primitive UI components (buttons, inputs, etc.).
  - `/chat`: Feature-specific components for the chat interface.
  - `/dashboard`: Feature-specific components for the dashboard.
- `/hooks`: Custom React hooks (e.g., `useWebSocket`, `useUser`, `useDocuments`).
- `/lib`: Utility functions, constants, and type definitions.
- `/schemas`: Zod validation schemas for forms.

## WebSocket Protocol

The application uses a custom WebSocket hook (`useWebSocket`) to handle real-time AI responses. It expects a specific JSON format from the backend to process different states of the generation:
- `status`: Updates the current state (e.g., "Thinking...").
- `sources`: An array of document names used.
- `token`: Chunks of the generated response.
- `done`/`error`: Completion or failure signals.