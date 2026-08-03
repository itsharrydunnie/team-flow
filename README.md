# TeamFlow

A production-oriented, multi-tenant team collaboration and workflow backend built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma**.

TeamFlow is not another CRUD or Todo application. It is a long-term backend engineering project designed to explore the architecture, patterns, and operational concerns behind modern SaaS collaboration platforms like Linear, Jira, Asana, and Notion.

The goal is to continuously evolve TeamFlow into a production-ready backend while learning real-world backend engineering concepts along the way.

---

## Vision

Modern teams often rely on multiple disconnected tools:

- Trello for task management
- Slack for communication
- Email for notifications
- Google Docs for collaboration
- Spreadsheets for tracking

TeamFlow aims to become a centralized backend platform that powers collaborative workspaces where teams can manage projects, tasks, files, notifications, and real-time collaboration from a single system.

---

## Project Goals

This project is intentionally designed to expose real backend engineering problems instead of artificial tutorial examples.

It progressively introduces concepts such as:

- Multi-tenancy
- Authentication & Authorization
- Database Design
- Background Processing
- Event-Driven Architecture
- WebSockets
- Object Storage
- Docker
- CI/CD
- Monitoring
- Testing
- Caching
- Deployment

Every technology is introduced because the product naturally requires it—not simply to check a box.

---

# Current Progress

## ✅ Phase 0 — Foundation

- Environment validation
- Centralized configuration
- Prisma ORM
- PostgreSQL
- Dockerized development
- Health Check endpoint

---

## ✅ Phase 1 — Identity

- User Registration
- User Login
- JWT Authentication
- Refresh Tokens
- Password Hashing (bcrypt)
- Protected Routes
- Current User decorator

---

## ✅ Phase 2 — Multi-Tenancy

- Organizations (Workspaces)
- Membership Model
- Role-based Memberships
- Organization Creation
- Tenant Isolation
- Organization Guard
- Current Organization decorator

---

## 🚧 Phase 3 — Core Domain (In Progress)

- Projects
- Tasks
- Status Workflows
- Pagination
- Filtering

---

# Planned Architecture

## Authentication

- JWT Authentication
- Refresh Tokens
- Password Reset
- Email Verification
- Session / Device Tracking

---

## Organizations

- Workspace Creation
- Organization Membership
- Tenant Isolation
- Invite Users

---

## Role-Based Access Control (RBAC)

Roles include:

- Owner
- Admin
- Manager
- Member

Permissions will control access to:

- Projects
- Tasks
- Members
- Administrative Actions

---

## Projects & Tasks

Projects contain tasks that move through defined workflows.

Planned features include:

- Task Assignment
- Comments
- Labels
- Priorities
- Due Dates
- Status Management
- Pagination
- Filtering

---

## Activity Feed

Every important action becomes an immutable activity event.

Examples:

- Task Assigned
- Project Updated
- Comment Added
- Member Invited

---

## Notifications

Notification channels:

- In-App
- Email
- WebSocket

Implemented using asynchronous background workers.

---

## Real-Time Collaboration

- Live Notifications
- Live Task Updates
- Presence System

Powered by WebSockets.

---

## File Management

- Task Attachments
- Comment Attachments
- Object Storage
- Signed URLs
- Storage Abstraction

---

## Background Jobs

Background workers will process:

- Emails
- Scheduled Reminders
- Notification Delivery
- Cleanup Jobs

Implemented using BullMQ and Redis.

---

## Search

Support for:

- Pagination
- Sorting
- Filtering
- Full-Text Search

---

# Technology Stack

## Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ

## Infrastructure

- Docker
- GitHub Actions
- Nginx
- Fly.io / Render / VPS

## Testing

- Jest
- Supertest
- k6

## Documentation

- Swagger / OpenAPI

---

# Engineering Principles

TeamFlow is built around the following principles:

- Feature-based architecture
- Multi-tenant by design
- Secure authentication
- Clean module boundaries
- Request-scoped authorization
- Production-oriented development
- Incremental delivery
- Deployment-first mindset

The objective is to continuously take concrete steps that move the system closer to production rather than becoming trapped in premature optimization or unnecessary complexity.

---

# Project Structure

```text
src/
├── auth/
├── configuration/
├── health/
├── middleware/
├── organizations/
├── pipe/
├── prisma/
├── projects/
├── users/
└── app.module.ts
```

As TeamFlow grows, additional modules such as Tasks, Notifications, Activity, Files, Search, and Realtime will be introduced.

---

# Getting Started

## Clone

```bash
git clone https://github.com/<your-github-username>/team-flow.git
cd team-flow
```

## Install Dependencies

```bash
pnpm install
```

## Configure Environment

Create a `.env` file.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:password@localhost:5432/teamflow-db

JWT_SECRET=your-secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Start PostgreSQL

```bash
docker compose up -d
```

## Run Migrations

```bash
npx prisma migrate dev
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Run the Application

```bash
pnpm start:dev
```

---

# Roadmap

- ✅ Foundation
- ✅ Authentication
- ✅ Multi-Tenancy
- 🚧 Projects & Tasks
- ⏳ RBAC
- ⏳ Activity Feed
- ⏳ Notifications
- ⏳ File Uploads
- ⏳ Real-Time Collaboration
- ⏳ Background Jobs
- ⏳ Search
- ⏳ Caching
- ⏳ Monitoring
- ⏳ CI/CD
- ⏳ Production Deployment

---

# Why TeamFlow?

TeamFlow exists to explore production backend engineering—not just API development.

As the project evolves, it will cover topics including:

- REST API Design
- Authentication & Security
- Multi-Tenancy
- RBAC
- PostgreSQL Schema Design
- Transactions
- Query Optimization
- Redis
- BullMQ
- Event-Driven Architecture
- WebSockets
- Object Storage
- Docker
- CI/CD
- Monitoring & Logging
- Testing
- Rate Limiting
- Deployment

Rather than building many disconnected demo projects, TeamFlow is intended to grow into a single, realistic backend platform that demonstrates progressively more advanced engineering concepts over time.

---

## License

MIT
