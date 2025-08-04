# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 frontend application for an AI web chatting system with support for chat, location services, and RAG (Retrieval-Augmented Generation) features.

## Key Commands

### Development
```bash
# Install dependencies
npm install

# Run development server (port 3033)
npm run dev

# Run linting
npm run lint
```

### Production
```bash
# Build production version
npm run build

# Start production server
npm start
```

## Architecture Overview

### Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Authentication**: JWT-based with localStorage

### Project Structure
```
src/
├── app/          # Next.js pages and layouts
├── components/   # Reusable UI components
├── contexts/     # React Context providers
├── services/     # API service layer
├── hooks/        # Custom React hooks
├── types/        # TypeScript definitions
└── utils/        # Utility functions
```

### API Integration

All API calls go through service layer in `/services/`:
- **authApi.ts**: Authentication (singleton pattern with token management)
- **chatApi.ts**: Chat messaging 
- **ragApi.ts**: RAG functionality

API calls are proxied through Next.js rewrites:
- `/api/chat` → `http://localhost:8033/ai/chat`
- `/api/chat/tool` → `http://localhost:8033/ai/chat/tool`

### Authentication Flow

1. AuthContext (`/contexts/AuthContext.tsx`) manages global auth state
2. Tokens stored in localStorage (`accessToken`, `refreshToken`)
3. Auto-refresh on 401 responses
4. Protected routes check auth state before rendering

### Component Architecture

Components follow this pattern:
- UI components in `/components/` (grouped by feature)
- Page components in `/app/` (file-based routing)
- Feature-specific logic in `/features/`
- Shared types in `/types/`

### Development Considerations

1. **Port Configuration**: Dev server runs on port 3033 (configured in package.json)
2. **Backend Dependency**: Expects backend API on `http://localhost:8033`
3. **TypeScript**: Strict mode enabled - all props must be typed
4. **Tailwind CSS**: v4 with custom configuration in `tailwind.config.ts`
5. **Path Aliases**: Use `@/` for imports from `src/` directory

### Common Patterns

**API Service Pattern**:
```typescript
// Services use fetch with auth headers
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Protected Route Pattern**:
```typescript
// Routes check auth state from context
const { user, loading } = useAuth();
if (!user) redirect('/login');
```

**Component Structure**:
```typescript
// Components use TypeScript interfaces for props
interface ComponentProps {
  // Define props here
}
export default function Component({ ...props }: ComponentProps) {
  // Component logic
}
```