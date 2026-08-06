# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

---

## [v0.1.0] - 2026-08-06

### Added

#### Foundation

- Environment configuration with validation
- Centralized application configuration
- Prisma ORM integration
- PostgreSQL database support
- Docker Compose local development environment
- Health check endpoint

#### Authentication

- User registration
- User login
- JWT authentication
- Access and refresh token lifecycle
- Password hashing with bcrypt
- Protected routes
- Current user decorator

#### Multi-Tenancy

- Organization (workspace) management
- Membership model
- Organization creation
- Member invitation
- Tenant-scoped request handling
- Current organization decorator
- Organization membership guard

#### Authorization

- Role-Based Access Control (RBAC)
- Permission-based authorization
- Owner, Admin, and Member roles
- Permission guard
- Route-level permission decorators

#### Projects

- Project creation
- Project retrieval
- Project updates
- Project deletion
- Organization-scoped project access

#### Tasks

- Task creation
- Task retrieval
- Task updates
- Task deletion
- Task status workflow
- Organization-scoped task access

#### API

- Pagination support for project and task listings
- Global request validation
- CORS configuration
- Environment-based configuration

#### Deployment

- Render deployment configuration
- Neon PostgreSQL integration
- Production migration workflow
- Production build configuration
- Production startup configuration
- Environment variable template (`.env.example`)

### Changed

- Replaced custom DTO validation with NestJS global `ValidationPipe`
- Removed temporary debugging logs
- Refactored application structure into feature-based modules
- Configured production entry point for compiled application

### Security

- Enforced organization-level data isolation
- Added JWT-protected endpoints
- Added role-based authorization for protected resources
