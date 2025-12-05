# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start development server at http://localhost:3000
pnpm build    # Create production build
pnpm start    # Run production server
pnpm lint     # Run ESLint

# Prisma commands
npx prisma migrate dev    # Run migrations in development
npx prisma generate       # Regenerate Prisma client after schema changes
npx prisma studio         # Open database GUI
```

## Architecture

This is a Next.js 16 application using the App Router pattern with React 19 and TypeScript.

**Key Technologies:**
- Next.js 16 with App Router (file-based routing in `src/app/`)
- React 19 (Server Components by default)
- Tailwind CSS v4 for styling
- TypeScript with strict mode
- Prisma ORM with SQLite database

**Path Alias:** Use `@/` to import from the `src/` directory (e.g., `import { Component } from '@/components/Component'`).

**Styling:** Tailwind CSS with dark mode support via `prefers-color-scheme`. Theme variables defined in `src/app/globals.css`.

**Fonts:** Geist Sans and Geist Mono loaded via `next/font/google` in the root layout.
