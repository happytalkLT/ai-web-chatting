# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Express.js backend server for an AI-powered chat application with vector search capabilities using Google Gemini AI and Qdrant vector database.

## Key Commands

### Development
```bash
# Install dependencies
npm install

# Run development server with auto-reload
npm run dev

# Default port: 3000 (configurable via PORT env)
```

### Production
```bash
npm start
```

## Architecture Overview

### Core Stack
- **Framework**: Express.js
- **Database**: MySQL with TypeORM
- **Vector DB**: Qdrant
- **AI Model**: Google Gemini (chat & embeddings)
- **Authentication**: JWT with whitelist pattern
- **Language**: JavaScript (ES6+)

### Database Schema

**MySQL Entities:**
- `User`: User accounts with authentication
- `Token`: JWT whitelist for session management
- `ChatRoom`: Chat rooms (public/private/group)
- `ChatMessage`: Messages with multi-type support
- `ChatParticipant`: User-room relationships

**Qdrant Collections:**
- `ai_chat_embeddings`: 1536-dimension vectors
- Indexed on: `room_id`, `user_id`, `type`

### API Structure

```
/users
  POST /signup         # User registration
  POST /login          # Login (returns JWT tokens)
  POST /refresh        # Refresh access token
  POST /logout         # Invalidate tokens
  GET  /me            # Current user info
  
/ai
  POST /chat          # Multi-turn Gemini chat
  POST /chat/tool     # Chat with function calling
  
/vector
  POST /store-message    # Store with embedding
  POST /search-similar   # Semantic search
  POST /store-knowledge  # RAG knowledge base
  POST /search-knowledge # Search knowledge
```

### Service Architecture

**Service Layer (`/services/`):**
- `gemini/multiChat.js`: Manages conversation context
- `gemini/tool.js`: Function calling integration
- `mysql-database.js`: Database operations
- `qdrant-service.js`: Vector storage/search

**Middleware (`/middleware/`):**
- `authenticateToken`: Requires valid JWT
- `optionalAuth`: Optional authentication
- `requireRole`: Role-based access control

### External Integrations

**Gemini AI Configuration:**
- Chat model: `gemini-2.5-flash`
- Embedding model: `gemini-embedding-exp-03-07`
- Vector size: 1536 dimensions
- API endpoints in `constants/gemini.js`

**Available Tools:**
- `get_current_time`: Timezone-aware time
- `get_search_local`: Naver local search API

### Authentication Flow

1. **Login**: Returns access (1hr) + refresh (7d) tokens
2. **Token Storage**: Whitelist in database
3. **Request**: `Authorization: Bearer <token>`
4. **Refresh**: Use refresh token when access expires
5. **Cleanup**: Automatic expired token removal (6hr interval)

### Environment Variables

Critical configurations in `.env`:
```
# Database
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Vector DB
QDRANT_URL, QDRANT_API_KEY

# AI Services
GEMINI_API_KEY

# Security
JWT_SECRET, ENCRYPT_KEY

# External APIs
NCP_CLIENT_ID, NCP_CLIENT_SECRET
```

### Development Patterns

**Error Handling**:
- Standardized error codes in `constants/errorCodes.js`
- Consistent error response format

**Database Access**:
```javascript
const repository = getRepository('EntityName');
// TypeORM repository pattern
```

**Vector Operations**:
```javascript
// Store with embedding
await qdrantService.storeVector(text, metadata);

// Semantic search
await qdrantService.searchSimilar(query, filter, limit);
```

**Tool Integration**:
Tools defined in `services/tool/llm-tools.json` and implemented in individual files.

### Important Considerations

1. **Token Cleanup**: Runs every 6 hours to remove expired tokens
2. **CORS**: Enabled for cross-origin requests
3. **Vector Search**: Requires embedding generation for all stored content
4. **Rate Limiting**: Consider implementing for production
5. **Database Sync**: TypeORM synchronize is enabled in development only