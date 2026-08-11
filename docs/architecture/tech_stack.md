# Student ERP - Technology Stack

## Overview

The Student ERP is designed as a modern, scalable, multi-tenant SaaS platform capable of supporting institutions ranging from coaching centers to universities. The architecture emphasizes modularity, maintainability, developer productivity, and horizontal scalability while remaining cost-effective for the MVP.

---

# Core Technology Stack

Use Typescript as your go to language

| Layer | Technology |
|---------|------------|
| Frontend | Next.js 16 (React 19, App Router) |
| Backend API | NestJS |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| ORM | Prisma ORM |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Icons | Lucide React |
| Forms | React Hook Form |
| Validation | Zod |
| State Management | TanStack Query + Zustand |
| File Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Email | Resend |
| Background Jobs | BullMQ + Redis |
| Cache | Redis |
| Search | PostgreSQL Full Text Search (MVP), Meilisearch/OpenSearch (later) |
| API Documentation | OpenAPI (Swagger) |
| Testing | Vitest + Playwright |
| Package Manager | pnpm |
| Monorepo | Nx |
| Deployment | Docker + Coolify / Railway / VPS |
| CI/CD | GitHub Actions |

---

# Frontend

## Framework

- Next.js 16
- React 19
- App Router
- TypeScript

Reasons

- Server Components
- Streaming
- Excellent SEO
- Route Handlers
- Server Actions
- Excellent DX
- Large ecosystem

---

## Styling

- Tailwind CSS v4
- CSS Variables
- Tailwind Animations

---

## Component Library

- shadcn/ui
- Radix UI
- Lucide Icons

Reason

Highly customizable while remaining fully accessible.

---

## Forms

- React Hook Form
- Zod

Reason

Excellent validation performance and type safety.

---

## Data Fetching

- TanStack Query

Used for

- Server cache
- Pagination
- Infinite scrolling
- Optimistic updates

---

## Global State

Use Zustand only for

- Theme
- Sidebar state
- User preferences
- UI state

Business data should remain in TanStack Query.

---

# Backend

## Framework

NestJS

Reasons

- Modular architecture
- Dependency Injection
- Excellent TypeScript support
- CQRS ready
- Enterprise architecture
- Background jobs
- WebSockets
- Easy testing

---

## API

REST APIs

Primary API style.

GraphQL is intentionally avoided in MVP.

---

## Validation

class-validator

DTO validation inside NestJS.

Shared validation schemas use Zod.

---

# Database

## PostgreSQL

Hosted by Supabase.

Reasons

- Mature
- ACID
- Excellent indexing
- JSON support
- Full Text Search
- Extensions
- Row Level Security support

---

## ORM

Prisma ORM

Reasons

- Excellent TypeScript support
- Type-safe queries
- Migration system
- Great developer experience

---

# Authentication

Supabase Auth

Supported providers

- Email + Password
- Magic Link
- OTP
- Google
- Microsoft
- GitHub (Platform only)

Future

- SAML
- Azure AD
- LDAP

---

# Authorization

Custom RBAC

Role-Based Access Control

Tables

- Users
- Roles
- Permissions
- RolePermissions
- UserRoles

Supports

- Multiple roles per user
- Institution scoped permissions
- Campus scoped permissions
- Department scoped permissions

Designed around the 49-persona permission model. :contentReference[oaicite:0]{index=0}

---

# Multi-Tenancy

Single Database

Shared Schema

Every business table contains

```
institutionId
```

Platform tables remain global.

Advantages

- Lower cost
- Easier migrations
- Easier backups
- Faster MVP

Future

Database sharding can be introduced without changing the application layer.

---

# Storage

Supabase Storage

Used for

- Student photos
- Faculty documents
- Assignments
- Certificates
- Question papers
- Videos
- PDFs
- Reports

---

# Realtime

Supabase Realtime

Used for

- Notifications
- Attendance updates
- Live announcements
- Chat
- Dashboard updates

---

# Background Jobs

BullMQ

Redis

Jobs include

- Emails
- SMS
- Notifications
- Report generation
- Certificate generation
- Fee reminders
- Attendance alerts
- Scheduled tasks

---

# Search

## MVP

PostgreSQL Full Text Search

Used for

- Students
- Faculty
- Courses
- Documents

## Future

Meilisearch

or

OpenSearch

For global search.

---

# Notifications

Channels

- Email
- In-App
- Push Notifications

Future

- WhatsApp
- SMS

Email provider

Resend

---

# File Processing

Libraries

- Sharp
- PDF-lib
- ExcelJS

Used for

- Image optimization
- PDF generation
- Excel exports
- Bulk imports

---

# Logging

Pino

Structured logging.

---

# Monitoring

Sentry

For

- Error tracking
- Performance monitoring
- Stack traces

---

# API Documentation

Swagger

Automatically generated from NestJS.

---

# Testing

Unit Testing

- Vitest

Backend

- Jest (NestJS default)

E2E

- Playwright

---

# Package Manager

pnpm

Reasons

- Fast
- Efficient
- Workspace support

---

# Monorepo

Nx

Structure

apps/

libs/

packages/

Reasons

- Shared libraries
- Better boundaries
- Incremental builds
- Excellent scalability

This aligns with the modular architecture defined for the ERP. :contentReference[oaicite:1]{index=1}

---

# DevOps

Containerization

Docker

Reverse Proxy

Traefik

Deployment

- Coolify
- Railway
- VPS
- DigitalOcean

CI/CD

GitHub Actions

---

# Future Services

These are intentionally excluded from MVP but the architecture supports adding them later.

## Redis Cluster

Scaling cache.

## Meilisearch

Advanced search.

## MinIO

Self-hosted storage.

## Temporal

Workflow orchestration.

## Apache Kafka

High-volume event streaming.

## Elastic Stack

Centralized logging.

---

# Coding Standards

- TypeScript everywhere
- Strict mode enabled
- ESLint
- Prettier
- Husky
- Commitlint
- Conventional Commits

---

# Architecture Principles

- API-first
- Domain-driven modules
- Clean Architecture
- SOLID principles
- Repository pattern
- Event-driven communication
- Multi-tenant by design
- Mobile-ready
- Scalable horizontally
- Cloud agnostic
- Infrastructure as Code ready

---

# Summary

## Frontend

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod

## Backend

- NestJS
- Prisma
- PostgreSQL
- Supabase
- Redis
- BullMQ

## Infrastructure

- Docker
- GitHub Actions
- Coolify
- Sentry
- Swagger

## Storage & Auth

- Supabase Auth
- Supabase Storage
- Supabase Realtime

## Overall Architecture

A modular, event-driven, multi-tenant SaaS architecture optimized for long-term scalability while keeping the MVP simple and cost-effective.
