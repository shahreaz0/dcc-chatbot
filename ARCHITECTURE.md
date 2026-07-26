# Architecture & Design Document

## Table of Contents

- [1. System Overview](#1-system-overview)
- [2. Technology Stack](#2-technology-stack)
- [3. Monorepo Structure](#3-monorepo-structure)
- [4. Data Model](#4-data-model)
- [5. Authentication & Authorization](#5-authentication--authorization)
- [6. API Design](#6-api-design)
- [7. Chat & LLM Streaming Pipeline](#7-chat--llm-streaming-pipeline)
- [8. Frontend Architecture](#8-frontend-architecture)
- [9. Deployment Architecture](#9-deployment-architecture)
- [10. Non-Functional Considerations](#10-non-functional-considerations)

---

## 1. System Overview

DCC Chatbot Platform is a multi-tenant chatbot management system that allows users to create **projects** (AI agents), configure them with **system prompts**, and interact with them through a **real-time streaming chat interface** powered by LLM providers.

```
┌──────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Auth Pages  │  │  Dashboard   │  │  Chat Interface (SSE)  │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         └────────────────┼──────────────────────┘               │
│                          │ HTTPS                                │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │    Vercel Edge Network   │
              │  ┌────────┐ ┌────────┐  │
              │  │  Web   │ │ Server │  │
              │  │(Next.js)│ │(Hono)  │  │
              │  └────────┘ └───┬────┘  │
              └─────────────────┼───────┘
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────▼─────┐ ┌──▼──────┐ ┌──▼──────────┐
              │ PostgreSQL │ │  JWT    │ │  OpenRouter  │
              │  (Neon)    │ │ Tokens  │ │  LLM API    │
              └───────────┘ └─────────┘ └─────────────┘
```

### Core Capabilities

| Capability | Description |
|------------|-------------|
| **User Management** | Registration, login, session management with JWT authentication |
| **Project/Agent Management** | CRUD operations for AI agent workspaces with per-project model and system prompt configuration |
| **Prompt Library** | Create, store, and associate reusable prompts with projects |
| **Real-Time Chat** | Streaming LLM responses via Server-Sent Events with persistent message history |
| **Multi-Tenancy** | User-scoped data isolation across all resources |

---

## 2. Technology Stack

### Backend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Runtime | **Bun** | Native TypeScript execution, fast startup, built-in Argon2id hashing |
| Framework | **Hono** + **@hono/zod-openapi** | Lightweight (~15KB), edge-ready, automatic OpenAPI spec generation |
| ORM | **Prisma** (v6) | Type-safe database access, migration management, multi-schema support |
| Database | **PostgreSQL** (Neon Serverless) | Reliable RDBMS with connection pooling and branching support |
| Auth | **jose** (JWT HS512) + session tokens | Stateless API authentication with session-based refresh |
| LLM | **AI SDK** + **OpenRouter** provider | Unified streaming interface across 200+ LLM models |
| Validation | **Zod** v4 | Runtime schema validation shared between routes and OpenAPI spec |
| Logging | **evlog** | Structured wide-event logging with AI SDK telemetry integration |

### Frontend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | **Next.js 16** (App Router) | Server components, file-based routing, middleware support |
| UI Library | **shadcn/ui** (shared via `packages/ui`) | Composable, accessible component primitives |
| Styling | **Tailwind CSS v4** | Utility-first, design-token based styling |
| State | **TanStack React Query** + **stan-js** | Server state caching + lightweight client stores |
| HTTP Client | **xior** | Axios-compatible with built-in token refresh and retry plugins |
| Chat | **@ai-sdk/react** (`useChat`) | Native SSE streaming with UI message protocol |
| Markdown | **Streamdown** | Real-time markdown rendering during LLM streaming |

### DevOps

| Component | Technology |
|-----------|-----------|
| Monorepo | **Turborepo** with Bun workspaces |
| Linting | **Biome** (format + lint) |
| Git Hooks | **Husky** + **lint-staged** |
| Deployment | **Vercel Services** (dual-service config) |
| Env Validation | **@t3-oss/env-core** |

---

## 3. Monorepo Structure

```
dcc-chatbot/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/     # Sign-in & register pages
│   │       │   └── dashboard/  # Protected dashboard routes
│   │       │       ├── chat/       # Chat interface
│   │       │       ├── projects/   # Project management
│   │       │       ├── prompts/    # Prompt library
│   │       │       └── sessions/   # Active sessions view
│   │       ├── components/     # Shared app components
│   │       ├── configs/        # HTTP client configuration
│   │       ├── lib/            # Utilities and types
│   │       ├── stores/         # Client state stores
│   │       └── proxy.ts        # Next.js middleware (auth guards)
│   │
│   └── server/                 # Hono API server
│       └── src/
│           ├── lib/            # App factory, OpenAPI config, types
│           ├── middlewares/    # Auth middleware
│           └── modules/       # Feature modules
│               ├── auth/          # Register, login, logout, token refresh
│               ├── chat/          # LLM streaming, message history
│               ├── projects/      # Project CRUD
│               ├── prompts/       # Prompt CRUD
│               ├── sessions/      # Session management
│               └── users/         # User profile
│
├── packages/
│   ├── config/     # Shared TypeScript configuration
│   ├── db/         # Prisma schema, migrations, generated client
│   ├── env/        # Environment variable validation (server + web)
│   └── ui/         # Shared shadcn/ui components and design tokens
│
├── turbo.json      # Turborepo task pipeline
├── vercel.json     # Dual-service deployment config
└── biome.json      # Linter/formatter configuration
```

### Module Convention

Each server module follows a consistent four-file pattern:

| File | Purpose |
|------|---------|
| `*.routes.ts` | OpenAPI route definitions with Zod schemas |
| `*.handlers.ts` | Request handlers (business logic) |
| `*.schemas.ts` | Zod validation schemas |
| `*.services.ts` | Reusable service functions (optional) |
| `*.index.ts` | Module entry point — wires routes to handlers |

---

## 4. Data Model

### Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│     User     │       │   Session    │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ email (UQ)   │  │    │ userId (FK)  │──┐
│ password     │  ├───▶│ token (UQ)   │  │
│ name?        │  │    │ expiresAt    │  │
│ activeProjectId│ │    │ ipAddress?   │  │
│ createdAt    │  │    │ userAgent?   │  │
│ updatedAt    │  │    │ createdAt    │  │
│ deletedAt?   │  │    │ updatedAt    │  │
└──────────────┘  │    │ deletedAt?   │  │
                  │    └──────────────┘  │
                  │                      │
                  │    ┌──────────────┐  │
                  │    │   Project    │  │
                  │    ├──────────────┤  │
                  ├───▶│ id (PK)      │  │
                  │    │ name         │  │
                  │    │ description? │  │
                  │    │ systemPrompt?│  │
                  │    │ model        │  │
                  │    │ userId (FK)  │──┘
                  │    │ createdAt    │
                  │    │ updatedAt    │
                  │    │ deletedAt?   │
                  │    └──────┬───────┘
                  │           │
         ┌────────┘     ┌─────┴──────┐
         │              │            │
   ┌─────▼──────┐  ┌────▼─────┐ ┌───▼──────────┐
   │   Prompt   │  │ChatMessage│ │              │
   ├────────────┤  ├──────────┤ │              │
   │ id (PK)    │  │ id (PK)  │ │              │
   │ title      │  │projectId │ │              │
   │ content    │  │ role     │ │              │
   │ isSystem   │  │ content  │ │              │
   │ projectId  │  │ createdAt│ │              │
   │ createdAt  │  └──────────┘ │              │
   │ updatedAt  │               │              │
   └────────────┘               └──────────────┘
```

### Key Design Decisions

- **Soft deletes** (`deletedAt`) on User, Session, and Project for data recovery and audit trails
- **`activeProjectId`** on User enables per-user workspace context persistence across sessions
- **`model` field** on Project allows per-project LLM model selection (defaults to `deepseek/deepseek-v4-flash`)
- **`systemPrompt`** on Project provides a base system instruction, while **Prompt** entities allow composable prompt layering
- **ChatMessage** stores flat message history (role + content) for persistent conversation threads
- **Indexes** on all foreign keys and lookup fields (`email`, `projectId`, `userId`) for query performance

---

## 5. Authentication & Authorization

### Authentication Flow

```
                        Registration
                        ────────────
User ──POST /auth/register──▶ Server
     { email, password, name }    │
                                  ├─ Check email uniqueness
                                  ├─ Hash password (Argon2id)
                                  ├─ Create User record
                                  └─▶ 201 { user }


                           Login
                           ─────
User ──POST /auth/login───▶ Server
     { email, password }       │
                               ├─ Verify password (Argon2id)
                               ├─ Create Session (30-day token)
                               ├─ Sign JWT (HS512, 7-day expiry)
                               └─▶ 200 { user, session, token }


                      Token Refresh
                      ─────────────
Client ──POST /auth/token──▶ Server
       header: { token }       │
                               ├─ Validate session token
                               ├─ Check session not expired
                               ├─ Sign new JWT
                               └─▶ 200 { token }


                     API Requests
                     ────────────
Client ──GET /projects──▶ Auth Middleware
       Authorization:        │
       Bearer <jwt>          ├─ Verify JWT signature & expiry
                             ├─ Extract user ID from payload
                             ├─ Verify user exists in DB
                             ├─ Set userId in context
                             └─▶ Handler (user-scoped query)
```

### Dual-Token Strategy

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| **Session Token** | Cookie (`dcc_session_token`) | 30 days | Long-lived, used to refresh JWT |
| **JWT (Bearer)** | Cookie (`dcc_jwt_token`) | 7 days | Short-lived, used for API authorization |

This separation provides:
- **Security**: Short JWT window limits exposure if token is compromised
- **UX**: Seamless token refresh without re-login via session token exchange
- **Scalability**: Stateless JWT verification — no server-side session lookup per request

### Frontend Token Management

```
Request ──▶ xior interceptor
              │
              ├─ Attach JWT from cookie as Authorization header
              │
              ├─ On 401/403 response:
              │    ├─ Exchange session token for new JWT via POST /auth/token
              │    ├─ Update dcc_jwt_token cookie
              │    └─ Retry original request
              │
              └─ On persistent failure:
                   ├─ Clear all auth cookies
                   └─ Redirect to /signin
```

### Route Protection

| Layer | Mechanism | Protected Routes |
|-------|-----------|-----------------|
| **Backend** | JWT middleware (`auth()`) | `/users/*`, `/sessions/*`, `/projects/*` (covers chat + prompts) |
| **Frontend** | Next.js middleware (`proxy.ts`) | `/dashboard/*` → redirects to `/signin` without token |
| **Rate Limiting** | `hono-rate-limiter` | `/auth/login` (10/min), `/auth/register` (5/min) |

---

## 6. API Design

### Design Principles

1. **OpenAPI-first**: All routes defined via `@hono/zod-openapi` with auto-generated Swagger spec at `/doc` and interactive docs at `/reference`
2. **Consistent response envelope**: All responses follow `{ status: "success", data: T }` or `{ status: "error", message: string }`
3. **Input validation**: Every request body, path param, and query param validated with Zod schemas
4. **User-scoped queries**: All data access filtered by authenticated `userId`

### Endpoint Summary

#### Auth (`/auth/*`) — Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create user account |
| POST | `/auth/login` | Authenticate with email/password |
| POST | `/auth/token` | Exchange session token for JWT |
| POST | `/auth/logout` | Invalidate session |

#### Users (`/users/*`) — Protected

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update profile / active project |

#### Projects (`/projects/*`) — Protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects` | Create project/agent |
| GET | `/projects` | List user's projects (paginated) |
| GET | `/projects/{id}` | Get project details |
| PATCH | `/projects/{id}` | Update project settings |
| DELETE | `/projects/{id}` | Soft-delete project |

#### Prompts (`/projects/{projectId}/prompts/*`) — Protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/{projectId}/prompts` | Create prompt |
| GET | `/projects/{projectId}/prompts` | List project prompts |
| PATCH | `/projects/{projectId}/prompts/{id}` | Update prompt |
| DELETE | `/projects/{projectId}/prompts/{id}` | Delete prompt |

#### Chat (`/projects/{projectId}/*`) — Protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/{projectId}/chat` | Stream LLM response (SSE) |
| GET | `/projects/{projectId}/messages` | Get chat history (paginated) |
| DELETE | `/projects/{projectId}/messages` | Clear chat history |

#### Sessions (`/sessions/*`) — Protected

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sessions` | List active sessions |
| DELETE | `/sessions/{id}` | Revoke a session |

---

## 7. Chat & LLM Streaming Pipeline

### Request Flow

```
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌────────────┐
│  Browser │    │  Hono Server │    │   AI SDK +     │    │ OpenRouter │
│ (useChat)│    │              │    │   OpenRouter    │    │    API     │
└────┬─────┘    └──────┬───────┘    └───────┬────────┘    └─────┬──────┘
     │                 │                    │                    │
     │  POST /projects/{id}/chat            │                    │
     │  { messages, systemPrompt? }         │                    │
     ├────────────────▶│                    │                    │
     │                 │                    │                    │
     │                 ├─ Verify JWT        │                    │
     │                 ├─ Load project      │                    │
     │                 ├─ Load prompts      │                    │
     │                 ├─ Save user msg     │                    │
     │                 ├─ Build system      │                    │
     │                 │  instruction       │                    │
     │                 │                    │                    │
     │                 ├─ streamText() ────▶│                    │
     │                 │                    ├───────────────────▶│
     │                 │                    │                    │
     │                 │                    │◀── stream chunks ──│
     │                 │◀── SSE stream ─────│                    │
     │◀── SSE stream ──│                    │                    │
     │  (token by      │                    │                    │
     │   token)        │  onFinish:         │                    │
     │                 ├─ Save assistant    │                    │
     │                 │  message to DB     │                    │
     │                 │                    │                    │
     ▼                 ▼                    ▼                    ▼
```

### System Prompt Composition

When a chat request arrives, the system prompt is assembled from multiple sources in order:

```
1. Project.systemPrompt         →  Base project-level system instruction
2. Request body.systemPrompt    →  Optional per-request override (persona selection)
3. Project.prompts[]            →  All stored prompts appended as "[Prompt: Title]\nContent"
```

These are concatenated with double newlines and passed as the `system` parameter to `streamText()`.

### Streaming Protocol

- Uses AI SDK's **UI Message Stream** protocol
- `createUIMessageStreamResponse()` returns a proper SSE response
- Frontend `useChat()` hook with `DefaultChatTransport` consumes the stream
- Streaming markdown rendered in real-time via `Streamdown` component

### Message Persistence

- **User messages**: Saved to `ChatMessage` table *before* LLM call begins
- **Assistant messages**: Saved in `onFinish` callback *after* streaming completes
- **History retrieval**: Paginated GET endpoint returns chronologically ordered messages
- **History clear**: Bulk delete all messages for a project

---

## 8. Frontend Architecture

### Page Structure

```
RootLayout (providers, theme, fonts)
├── (auth)/
│   ├── /signin          → SignInForm
│   └── /register        → RegisterForm
│
└── dashboard/
    └── DashboardShell (sidebar nav, project switcher, header)
        ├── /chat        → ChatInterface (streaming chat)
        ├── /projects    → ProjectsView (CRUD grid)
        ├── /prompts     → PromptsView (CRUD grid)
        └── /sessions    → SessionsView (active sessions table)
```

### State Management

| State Type | Tool | Usage |
|------------|------|-------|
| Server state | **TanStack React Query** | All API data (projects, prompts, messages, sessions) |
| Client UI state | **stan-js** stores | Dialog open/close, editing entity, active project selection |
| Auth state | **js-cookie** | JWT token, session token, user profile (cookie-based) |
| Chat state | **@ai-sdk/react** `useChat` | Message list, streaming status, input management |

### Data Fetching Pattern

Each feature follows a consistent hook-based pattern:

```
feature/
├── _hooks/
│   ├── use-get-{resource}.ts      # React Query useQuery
│   ├── use-create-{resource}.ts   # React Query useMutation + invalidation
│   ├── use-update-{resource}.ts   # React Query useMutation + invalidation
│   └── use-delete-{resource}.ts   # React Query useMutation + invalidation
└── _components/
    ├── {resource}-view.tsx        # List/grid view
    ├── create-{resource}-dialog.tsx
    ├── edit-{resource}-dialog.tsx
    └── {resource}-upsert-form.tsx # Shared form (react-hook-form + zod)
```

### HTTP Client Architecture

```
xior instance (baseURL: API server)
├── Request interceptor: Attach JWT from cookie
├── Token refresh plugin: Auto-refresh on 401/403
├── Error retry plugin: Retry after token refresh
└── Fetch adapter: Bridge for Hono RPC client
```

The `xiorFetchAdapter` allows the type-safe Hono RPC client (`hc<AppType>`) to leverage xior's interceptor pipeline (auto-auth, token refresh) while maintaining end-to-end type safety.

---

## 9. Deployment Architecture

### Vercel Services (Dual-Service)

```
┌──────────────────────────────────────────────┐
│                Vercel Edge                    │
│                                              │
│   Incoming Request                           │
│        │                                     │
│        ├─ /api/*  ──▶  Server Service (Hono) │
│        │               ├─ Rewrite: /api/x → /x
│        │               └─ Runtime: Bun       │
│        │                                     │
│        └─ /*      ──▶  Web Service (Next.js)  │
│                        ├─ SSR + Static       │
│                        └─ Middleware (auth)   │
│                                              │
│   Shared: Project env vars                   │
└──────────────────────────────────────────────┘
```

### Key Deployment Details

- **Web service** builds with `NEXT_PUBLIC_SERVER_URL=/api` so all API calls route through Vercel's proxy
- **Server service** routes strip the `/api` prefix before reaching Hono handlers
- Auth routes (`/api/auth/*`) bypass the path transform to avoid conflicts
- Both services share the same Vercel project environment variables
- Environment sync scripts (`env:preview`, `env:production`) push local `.env` to Vercel

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | ✅ |
| `DIRECT_URL` | PostgreSQL direct connection (migrations) | Optional |
| `JWT_SECRET` | Secret key for JWT signing (HS512) | ✅ |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | ✅ |
| `CORS_ORIGIN` | Allowed frontend origin | ✅ |
| `PORT` | Server port (default: 8000) | Optional |

---

## 10. Non-Functional Considerations

### Scalability

| Strategy | Implementation |
|----------|---------------|
| **Stateless API** | JWT-based auth — no server-side session lookup per request |
| **Connection pooling** | Neon serverless PostgreSQL with pooled + direct URLs |
| **Pagination** | All list endpoints support `page`/`perPage` query params |
| **User isolation** | All queries filtered by `userId` — no cross-tenant data leakage |
| **Edge deployment** | Vercel global edge network for low-latency routing |

### Security

| Measure | Implementation |
|---------|---------------|
| **Password hashing** | Argon2id (memoryCost: 19,456, timeCost: 2) — OWASP recommended |
| **JWT algorithm** | HS512 with configurable secret |
| **Rate limiting** | Per-IP rate limits on auth endpoints |
| **Input validation** | Zod schemas on all endpoints |
| **CORS** | Restricted to configured origins |
| **Soft deletes** | Data preserved for audit, filtered from queries |
| **Route protection** | Backend JWT middleware + frontend Next.js middleware |
| **Token refresh** | Short-lived JWT (7d) refreshed via long-lived session (30d) |

### Extensibility

The modular architecture supports future additions:

| Extension | How to Add |
|-----------|-----------|
| **Analytics** | New `analytics` module following the routes/handlers/schemas pattern |
| **File uploads** | Add `files` module with OpenAI Files API integration; add `ProjectFile` model to Prisma schema |
| **Webhooks** | New module with webhook registration and delivery endpoints |
| **Multi-provider LLM** | Swap `createOpenRouter()` for any AI SDK-compatible provider |
| **Team/org support** | Add `Organization` model and team-scoping middleware |
| **Plugin system** | Leverage Hono middleware composition for pluggable features |

### Performance

| Optimization | Details |
|-------------|---------|
| **Streaming responses** | SSE via `createUIMessageStreamResponse` — no buffering entire LLM response |
| **Bun runtime** | Fast cold start, optimized I/O |
| **React Query caching** | 60-second stale time, deduplication of concurrent requests |
| **Selective DB queries** | `select` clauses to minimize data transfer |
| **Hono framework** | < 15KB, zero-dependency router |

### Reliability

| Strategy | Implementation |
|----------|---------------|
| **Input validation** | Reject malformed requests at the edge with Zod |
| **Global error handler** | `stoker` `onError` catches unhandled exceptions |
| **Type safety** | End-to-end TypeScript with strict mode |
| **Environment validation** | `@t3-oss/env-core` fails fast on missing variables |
| **Auto-retry** | xior error retry plugin on transient failures |
| **Graceful degradation** | Token refresh before forcing re-login |
