# TeamFlow

A production-oriented, multi-tenant team collaboration and workflow backend built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma**.

TeamFlow is a long-term backend engineering project inspired by modern collaboration platforms such as **Linear**, **Jira**, **Asana**, and **Notion**. Rather than being another CRUD application, it focuses on solving real backend engineering problems found in production SaaS systems.

The objective is to build a scalable, secure, and maintainable backend while continuously introducing technologies only when the product naturally requires them.

---

## Vision

Modern teams often rely on multiple disconnected tools to get work done:

- Trello for project management
- Slack for communication
- Email for notifications
- Google Docs for documentation
- Spreadsheets for tracking

TeamFlow aims to provide the backend that powers a centralized collaboration platform where organizations can manage projects, tasks, members, notifications, files, and real-time collaboration within isolated workspaces.

---

## Features

- Multi-tenant workspace architecture
- JWT Authentication
- Refresh Token lifecycle
- Role-Based Access Control (RBAC)
- Organization membership management
- Project management
- Task management
- Organization-scoped data isolation
- Pagination
- Docker-based development environment

As the platform evolves, additional capabilities such as activity feeds, notifications, background jobs, file uploads, real-time collaboration, search, caching, and observability will be introduced.

---

## Technology Stack

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM

### Infrastructure

- Docker
- Docker Compose

### Planned Technologies

- Redis
- BullMQ
- WebSockets
- Swagger / OpenAPI
- GitHub Actions
- Nginx
- Render / Fly.io / VPS

### Testing

- Jest
- Supertest
- k6

---

## Engineering Principles

TeamFlow is built around a few guiding principles:

- Production-first development
- Feature-based architecture
- Multi-tenancy by design
- Secure authentication and authorization
- Clean module boundaries
- Incremental delivery
- Deployment-driven development

The goal is to continuously ship working software while improving the architecture over time, rather than delaying deployment in pursuit of unnecessary complexity.

---

## Getting Started

### Clone the repository

```bash
git clone [https://github.com/itsharrydunnie/team-flow](https://github.com/itsharrydunnie/team-flow.git) 

cd team-flow
```

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Create a `.env` file.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:password@localhost:5432/teamflow-db

JWT_SECRET=your-secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Run database migrations

```bash
npx prisma migrate dev
```

### Generate the Prisma Client

```bash
npx prisma generate
```

### Start the application

```bash
pnpm start:dev
```

---
## Live API

**Base URL**

```text
https://team-flow-uufz.onrender.com
```

**Health Check**

```text
GET /health
```

## Why TeamFlow?

Instead of building many disconnected demo projects, TeamFlow grows as a single production-oriented backend that continuously introduces real engineering challenges.

As development progresses, the project explores topics including:

- REST API Design
- Authentication & Authorization
- Multi-Tenancy
- RBAC
- PostgreSQL Schema Design
- Transactions
- Query Optimization
- Redis
- Background Processing
- Event-Driven Architecture
- WebSockets
- Object Storage
- Docker
- CI/CD
- Monitoring & Logging
- Testing
- Rate Limiting
- Deployment

Each addition is driven by an actual product requirement, allowing the architecture to evolve naturally rather than through artificial examples.

---

## License

MIT
