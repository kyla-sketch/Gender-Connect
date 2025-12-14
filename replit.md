# Amour Dating Application

## Overview

Amour is a modern dating web application that allows users to create profiles, discover potential matches, and exchange messages. The app features a clean, romantic-themed UI with user authentication, profile browsing with filters, and real-time messaging capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query for server state, React Context for auth state
- **Styling**: Tailwind CSS v4 with custom romantic color palette (warm rose/coral primary)
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Fonts**: Playfair Display (serif for headings) and Inter (sans-serif for body)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Session Management**: express-session with MemoryStore (consider connect-pg-simple for production)
- **Password Hashing**: bcrypt
- **API Structure**: RESTful endpoints under `/api` prefix

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Tables**:
  - `users`: User profiles with id, email, password, name, age, gender, location, bio, interests, job, avatar
  - `messages`: Chat messages with sender/receiver references and timestamps
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication
- **Method**: Session-based authentication with HTTP-only cookies
- **Flow**: Email/password registration and login
- **Session Storage**: In-memory store (MemoryStore) - should migrate to PostgreSQL session store for production
- **Protection**: Middleware-based route protection with `requireAuth` helper

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components (shadcn/ui)
│   │   ├── pages/        # Route pages (Landing, Browse, Messages)
│   │   ├── lib/          # Utilities, API client, auth store
│   │   └── hooks/        # Custom React hooks
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations layer
│   ├── db.ts         # Database connection
│   └── vite.ts       # Development server integration
├── shared/           # Shared types and schema
│   └── schema.ts     # Drizzle schema + Zod validation
```

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: esbuild bundles server, Vite builds client to `dist/public`
- **Scripts**: `dev` for development, `build` for production build, `start` for production server

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management

### UI/UX Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Framer Motion**: Animation library (used in Browse page)
- **Lucide React**: Icon library

### Session/Auth
- **express-session**: Session middleware
- **memorystore**: Development session store
- **connect-pg-simple**: PostgreSQL session store (available for production)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (optional, has default for development)