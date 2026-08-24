# Architecture Documentation - PlayConnect (Sprint 0)

## 1. Executive Summary & Overview

**PlayConnect** is a mobile application platform designed to connect amateur sports players (starting with Football and Padel, with an extensible domain model for future sports).

The core operational flow involves:
`User activates online` -> `Discovers nearby players/teams` -> `Forms group/team` -> `Reserves field/court` -> `Plays match` -> `Rates participants`.

Sprint 0 establishes the foundational technical architecture:
- Monorepo directory layout
- PostgreSQL + PostGIS spatial database modeling
- Scalable backend service with Express & TypeScript
- Mobile application setup using Expo (React Native) + React Navigation
- JWT-based authentication system (Access + Refresh Token) with social login readiness (Google/Apple)

---

## 2. Technical Stack & Key Architectural Decisions

### 2.1 Repository Architecture: Monorepo vs. Separate Repos
* **Decision**: Single Monorepo with NPM Workspaces (`/backend`, `/mobile`).
* **Rationale**:
  * **Unified Onboarding**: Developers can clone a single repository and boot up the full stack (`npm install`, `docker-compose up -d`, `npm run dev:backend`).
  * **Shared Contracts**: Enables sharing DTO definitions, type definitions, and API client interfaces between backend and mobile application.
  * **Simplified Versioning**: Keeps frontend and backend features aligned per sprint.

### 2.2 Backend Framework: Express.js + TypeScript
* **Decision**: Express.js with TypeScript and layered architecture (Controller-Service-Repository pattern with Prisma ORM).
* **Rationale**:
  * **Lightweight & High-Performance**: Express provides minimal overhead and explicit middleware routing without magic decorators.
  * **Clean Domain Layering**: Controller -> Service -> Prisma ORM structure ensures business logic isolation.
  * **Trade-Off vs NestJS**: NestJS offers modular dependency injection out-of-the-box, but introduces framework boilerplate. Express + TS delivers the exact same clean modular boundaries with zero framework complexity for Sprint 0.

### 2.3 Database & Geographic Indexing: PostgreSQL + PostGIS
* **Decision**: PostgreSQL 16 with spatial extension `postgis` 3.4.
* **Geographic Field**: `canchas.ubicacion` stored as `GEOGRAPHY(Point, 4326)`.
* **Spatial Index**: GIST Index (`idx_canchas_ubicacion`) created on `canchas.ubicacion`.
* **Rationale**:
  * Amateur sports discovery depends on spatial radius filtering (e.g., "fields within 5km of my current location").
  * PostGIS `ST_DWithin` and `<->` (nearest neighbor distance operator) leverage the GIST index for sub-millisecond spatial queries.

### 2.4 Mobile App Framework: React Native with Expo
* **Decision**: React Native managed workflow with Expo SDK and React Navigation (Native Stack).
* **Rationale**:
  * **Developer Velocity**: Fast refresh, zero Xcode/Android Studio native compilation friction during early foundation.
  * **Secure Storage**: Native integration with `expo-secure-store` for safe storage of JWT refresh tokens on iOS (Keychain) and Android (Keystore).
  * **Cross-Platform Readiness**: Effortless building for iOS, Android, and web preview environments.

---

## 3. System Architecture Diagram

```
+-------------------------------------------------------------------+
|                        MOBILE CLIENT (Expo)                       |
|                                                                   |
|   +-----------------------+           +-----------------------+   |
|   |  Auth Screens         |           |  Home Screen          |   |
|   |  (Login / Register)   |           |  (Profile / Me)       |   |
|   +-----------+-----------+           +-----------+-----------+   |
|               |                                   |               |
|               +-----------------+-----------------+               |
|                                 |                                 |
|                      +----------v----------+                      |
|                      |  Axios API Client   |                      |
|                      |  (JWT Interceptors) |                      |
|                      +----------+----------+                      |
+---------------------------------|---------------------------------+
                                  | HTTP / REST (JSON)
                                  | Bearer Tokens
+---------------------------------|---------------------------------+
|                        BACKEND (Node/Express)                     |
|                                 |                                 |
|                      +----------v----------+                      |
|                      |  Express Router     |                      |
|                      +----------+----------+                      |
|                                 |                                 |
|                      +----------v----------+                      |
|                      |  Auth Middleware    |                      |
|                      +----------+----------+                      |
|                                 |                                 |
|                      +----------v----------+                      |
|                      |  Auth Controller    |                      |
|                      +----------+----------+                      |
|                                 |                                 |
|                      +----------v----------+                      |
|                      |  Auth Service       |                      |
|                      |  (bcrypt / JWT)     |                      |
|                      +----------+----------+                      |
|                                 |                                 |
|                      +----------v----------+                      |
|                      |    Prisma Client    |                      |
|                      +----------+----------+                      |
+---------------------------------|---------------------------------+
                                  | SQL Queries / PostGIS
+---------------------------------|---------------------------------+
|                      DATABASE (PostgreSQL)                        |
|                                 |                                 |
|                +----------------v----------------+                |
|                |  PostgreSQL 16 + PostGIS 3.4    |                |
|                |  - usuarios                     |                |
|                |  - perfiles_deportivos          |                |
|                |  - equipos / equipo_miembros    |                |
|                |  - centros_deportivos / canchas |                |
|                |    (canchas.ubicacion + GIST)   |                |
|                |  - reservas / partidos          |                |
|                |  - calificaciones               |                |
|                +---------------------------------+                |
+-------------------------------------------------------------------+
```

---

## 4. Directory Structure

```
playconnect-monorepo/
├── ARCHITECTURE.md                  # System architecture & key technical decisions
├── README.md                        # Developer onboarding & local setup guide
├── docker-compose.yml               # PostgreSQL + PostGIS database container setup
├── package.json                     # Root monorepo workspace configuration
├── .gitignore                       # Global gitignore rule set
│
├── backend/                         # Express + TypeScript Backend
│   ├── .env.example                 # Documented environment template
│   ├── .eslintrc.js                 # ESLint rules configuration
│   ├── .prettierrc                  # Prettier formatting rules
│   ├── package.json                 # Backend scripts & dependencies
│   ├── tsconfig.json                # TypeScript compiler config
│   │
│   ├── prisma/
│   │   ├── schema.prisma            # Data models and provider config
│   │   └── migrations/              # Versioned SQL migrations
│   │       └── 20260824000000_init/ # Initial migration with PostGIS GIST index
│   │
│   └── src/
│       ├── app.ts                   # Express server config & middleware
│       ├── server.ts                # Application entrypoint
│       ├── config/                  # Validated environment configuration
│       ├── lib/                     # Singleton instances (Prisma client)
│       ├── middleware/              # Auth middleware & Global Error Handler
│       ├── modules/
│       │   └── auth/                # Authentication module (HU-31)
│       │       ├── auth.controller.ts
│       │       ├── auth.service.ts
│       │       ├── auth.routes.ts
│       │       └── dto/             # Request payloads validation schemas
│       └── tests/
│           └── auth.test.ts         # Automated auth integration tests
│
└── mobile/                          # React Native Expo Mobile Application
    ├── .env.example                 # Mobile environment template
    ├── .eslintrc.js                 # Mobile ESLint configuration
    ├── .prettierrc                  # Mobile Prettier formatting rules
    ├── app.json                     # Expo configuration manifest
    ├── package.json                 # Mobile dependencies
    ├── tsconfig.json                # React Native TypeScript settings
    ├── App.tsx                      # Root application entrypoint
    │
    └── src/
        ├── context/
        │   └── AuthContext.tsx      # Auth state management & token lifecycle
        ├── navigation/
        │   └── AppNavigator.tsx     # React Navigation (AuthStack vs MainStack)
        ├── screens/
        │   ├── LoginScreen.tsx      # Login UI component
        │   ├── RegisterScreen.tsx   # User Registration UI component
        │   └── HomeScreen.tsx       # Home view displaying authenticated user info
        └── services/
            └── api.ts               # Axios client with interceptors for JWT
```

---

## 5. Security & Authentication Strategy (HU-31)

### 5.1 JWT Token Lifecycle
1. **Access Token**: Short expiration time (15 minutes). Transmitted in HTTP Header `Authorization: Bearer <access_token>`.
2. **Refresh Token**: Long expiration time (7 days). Stored securely on mobile via `expo-secure-store`.
3. **Token Refresh Flow**:
   - When an API request fails with `401 Unauthorized`, the mobile Axios response interceptor intercepts the failure.
   - It issues a request to `POST /api/v1/auth/refresh` sending the stored `refreshToken`.
   - The backend validates the `refreshToken`, issues a new `accessToken` & `refreshToken`, and the client retries the failed request seamlessly.

### 5.2 Social Login Preparation Strategy
Although Google and Apple OAuth logins are not implemented in Sprint 0, the schema and authentication service are prepared:
- `password_hash` column in `usuarios` is marked **nullable** (allowing social login accounts created without local passwords).
- Future social login handlers will verify the Google/Apple OAuth idToken, find or create the `usuario` record by email, and return the exact same JWT access/refresh token pair to the client.

---

## 6. Extensibility for Future Sports
- The `perfiles_deportivos.deporte` and `partidos.deporte` columns use string/enum values (e.g., `'FUTBOL'`, `'PADEL'`).
- Future sports (Tennis, Basketball, Volleyball) can be added cleanly by expanding valid sport types without requiring database migrations or breaking existing match logic.
