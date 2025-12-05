# CFC Raffle

A simple and interactive raffle application for drawing random winners from a list of participants. Built with Next.js 16, React 19, and Prisma.

## Features

- Add multiple participants (one name per line)
- Animated random draw with visual feedback
- Automatic duplicate detection
- Search and manage participants
- Winner announcement dialog
- Persistent storage with SQLite database
- Responsive design

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Database:** SQLite with Prisma ORM
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cfc-raffle.git
   cd cfc-raffle
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   ```bash
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma migrate dev` | Run migrations in development |

## Usage

1. Click the hamburger menu to open the participants panel
2. Enter names in the text area (one name per line)
3. Click "Add Names" to add participants
4. Click "DRAW" to randomly select a winner
5. The winner is removed from the pool and displayed in a dialog

## License

MIT
