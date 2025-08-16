# Manage Mate — Next.js Full‑Stack Development Plan & To‑Do Tracker

Deliver a production‑ready project management platform (Next.js + MongoDB) with first‑class Issue Tracking and QA/Test Management. Structured as a to‑do tracker per phase with acceptance criteria and quality gates.

## 0) Overview

- Objective: Build Manage Mate using Next.js App Router with secure auth, RBAC, projects/modules/tasks, issue tracking, QA (test cases/suites/runs), real‑time collaboration, reporting, and solid DevEx.
- Principles:
  - Ship vertical slices with measurable outcomes
  - Strong typing + validation (TypeScript + Zod)
  - Security, performance, and observability baked in
  - Developer experience: lint, format, tests, CI, preview deploys

## 1) Tech Stack (Next.js)

- Framework: Next.js 15 (App Router, RSC, Server Actions, Turbopack)
- React: React 19 + TypeScript
- Styling/UI: Tailwind CSS (monochrome theme), shadcn/ui, next-themes
- Data fetching: RSC (Server Components), Route Handlers, Server Actions, TanStack Query (client islands)
- Forms: React Hook Form + Zod Resolver
- Charts: Recharts
- Database: MongoDB Atlas + Mongoose (optional: Prisma for MongoDB)
- Auth: JWT (access + refresh) via Route Handlers + httpOnly cookies (optional: Auth.js/NextAuth with JWT strategy)
- Real‑time: WebSocket (Next.js built‑in ws in Route Handlers) or Socket.IO (Node runtime)
- File uploads: Next.js Route Handlers + Multer or nextjs-better-api with BusBoy (Node runtime)
- Email: Microsoft Graph API (Outlook) or Resend (for dev ease)
- Validation: Zod
- State: React Context (theme/user prefs) + TanStack Query (client)
- Testing: Vitest or Jest (unit), React Testing Library, Playwright (E2E)
- Tooling: ESLint (Next + Airbnb), Prettier, Husky + lint-staged
- Optional “good to have”:
  - i18n: next-intl
  - PWA: next-pwa
  - SEO: Metadata API + @vercel/og for social images
  - Analytics: Vercel Analytics + Web Vitals
  - Edge Runtime for read‑heavy endpoints; Node Runtime for DB

## 2) Current State

- Scaffold: Next.js + Tailwind + shadcn/ui pending configuration
- Target next slice: Auth + RBAC foundations; then Tasks + Issues vertical slice

## 3) Initial Setup & Dependencies

Create app:
```bash
npx create-next-app@latest manage-mate --ts --eslint --tailwind --src-dir --app --import-alias "@/*"
cd manage-mate
```

Install dependencies:
```bash
# Data, validation, security
npm i mongoose zod jsonwebtoken bcryptjs
npm i next-themes @tanstack/react-query react-hook-form @hookform/resolvers date-fns recharts lucide-react

# Realtime & uploads (choose one for realtime)
npm i socket.io socket.io-client multer
# or (native ws using Next.js, no extra package required for ws)

# Email (choose one)
npm i @microsoft/microsoft-graph-client isomorphic-fetch
# or
npm i resend

# Dev/test
npm i -D eslint-config-next @types/jsonwebtoken @types/bcryptjs @types/multer vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright
```

Optional:
- i18n: npm i next-intl
- PWA: npm i next-pwa
- Prisma (alternative ODM): npm i prisma @prisma/client

## 4) Project Structure (App Router)

```
src/
├── app/
│   ├── (marketing)/page.tsx
│   ├── (auth)/login/page.tsx
│   ├── (auth)/reset-password/page.tsx
│   ├── dashboard/page.tsx
│   ├── projects/[…routes]
│   ├── modules/[…routes]
│   ├── tasks/[…routes]
│   ├── issues/[…routes]
│   ├── qa/[…routes]         # test cases/suites/runs
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── users/route.ts
│   │   ├── projects/route.ts
│   │   ├── modules/route.ts
│   │   ├── tasks/route.ts
│   │   ├── issues/route.ts
│   │   ├── test-cases/route.ts
│   │   ├── test-suites/route.ts
│   │   ├── test-runs/route.ts
│   │   ├── files/route.ts
│   │   ├── comments/route.ts
│   │   ├── notifications/route.ts
│   │   └── websocket/route.ts  # optional native ws
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── charts/
│   └── common/
├── features/
│   ├── issues/
│   ├── qa/
│   ├── tasks/
│   └── users/
├── lib/
│   ├── db.ts                  # Mongoose connection (singleton)
│   ├── auth.ts                # JWT helpers, cookie utils
│   ├── policies.ts            # RBAC/permission checks
│   ├── validations/           # Zod schemas (request/response)
│   ├── notifications.ts
│   ├── mail.ts
│   ├── storage.ts
│   ├── cache.ts               # revalidateTag helpers
│   └── logger.ts
├── server/                    # domain services (pure TS)
│   ├── users.service.ts
│   ├── projects.service.ts
│   ├── modules.service.ts
│   ├── tasks.service.ts
│   ├── issues.service.ts
│   └── qa.service.ts
├── models/                    # Mongoose models
├── middleware.ts              # route protection & public assets control
├── types/
└── tests/
```

Notes:
- Use Node runtime for DB routes: export const runtime = 'nodejs'
- Use Edge runtime for read‑only endpoints if needed: export const runtime = 'edge'
- Use revalidateTag / revalidatePath for targeted cache busting from mutations

## 5) Global Quality Gates

- TypeScript strict: on, no implicit any
- ESLint + Prettier: clean on main
- Test coverage: ≥ 80% on critical paths per delivered slice
- Security: helmet‑equivalent headers via Next (secureHeaders), input validation (Zod), JWT best practices, rate limiting on API routes
- Performance: P95 API < 500ms for list/detail, initial page load < 3s, nav < 1s
- Accessibility: WCAG 2.1 AA on core flows
- Observability: structured logs, error boundaries, basic metrics

## 6) Phased To‑Do Plan (with Acceptance Criteria)

Legend: [ ] To do | [~] In progress | [x] Done

### Phase 1: Foundation & Auth (Week 1–2)

Tasks:
- [ ] Configure Tailwind + shadcn/ui + monochrome theme tokens
- [ ] next-themes ThemeProvider (light/dark/system) with persistence
- [ ] Mongoose connection util with global caching in dev
- [ ] User model (email, hash, roles, prefs, timestamps)
- [ ] Auth APIs (Route Handlers): register, login, logout, refresh, forgot/reset
- [ ] JWT access + refresh in httpOnly cookies; rotation + CSRF guard
- [ ] middleware.ts to protect app routes; role claims parsing
- [ ] Client forms with RHF + Zod; error/loading states
- [ ] Base layout: Header, Sidebar, Breadcrumbs, Nav
- [ ] Error boundary + not-found routes
- [ ] Metadata API (SEO) baseline; robots/sitemap

Acceptance:
- Can register/login/logout; refresh rotates tokens
- Protected dashboard redirects unauthenticated users
- Theme switch persists
- Unit tests: auth services + route handlers (≥70%)
- E2E: login → access protected page

### Phase 2: RBAC & Users (Week 3–4)

Tasks:
- [ ] Roles: admin, manager, qa_lead, team_member, guest
- [ ] Permission matrix in policies.ts + guards in handlers/actions
- [ ] Users API: list/create/update/deactivate (admin)
- [ ] Invite flow (email stub + token set‑password)
- [ ] Profile page (avatar, name, prefs)
- [ ] Activity logs for auth and user admin actions

Acceptance:
- Admin assigns roles; guards enforced server‑side
- Invite + set password works end‑to‑end
- Audit log entries visible to admin

### Phase 3: Projects & Modules (Week 5–6)

Tasks:
- [ ] Models: Project, Module (+ indexes)
- [ ] APIs: CRUD projects, member add/remove, templates seed
- [ ] Views: list/grid, detail, module overview with filters/sort
- [ ] Pagination server‑side (page/limit) + total count
- [ ] Access control: managers manage own projects
- [ ] Revalidate tags for project/module changes

Acceptance:
- Create project from template, invite members
- Create modules with deps; visible in UI
- Lists fast (<300ms median for 100 items)

### Phase 4: Tasks & Issue Tracking (Week 7–9)

Tasks — Tasks:
- [ ] Task model + indexes (projectId, status, assignees, order)
- [ ] APIs: CRUD, status transitions, bulk operations
- [ ] Kanban (DND) + list view with filters
- [ ] Task detail: comments, attachments, todos
- [ ] Real‑time updates (ws or socket.io)

Tasks — Issue Tracking (Tickets):
- [ ] Issue model (type, status, severity, priority, env, components, steps, expected/actual, links, dedupe hash, SLA)
- [ ] Triage workflow (new → triaged → in_progress → in_review → qa_testing → done/wontfix/duplicate)
- [ ] APIs: CRUD, triage, link/unlink to tasks, duplicate handling
- [ ] Issue board (triage queue) + saved filters
- [ ] Notifications on assignment/status/severity

Acceptance:
- Report bug → triage (severity/priority/assignee) → link to task → resolve
- Boards support DND with persistence
- Live updates for assignees/watchers

### Phase 5: QA Test Management (Week 10–12)

Tasks:
- [ ] Models: TestCase, TestSuite, TestRun (results with evidence)
- [ ] UI: Test Case Manager, Suite Builder (DND), Test Runner
- [ ] Defect linkage: failing result → create/link Issue
- [ ] QA Dashboard (coverage, pass rate, defect burndown)
- [ ] Exports: CSV/Excel for runs
- [ ] Permissions: qa_lead manages; team_member executes

Acceptance:
- Create suite → run → record results with attachments
- Failing test creates/links defect issue
- QA dashboard shows pass rate & open defects

### Phase 6: Real‑time & Notifications (Week 13)

Tasks:
- [ ] WebSocket route (native ws) or Socket.IO server on Node runtime
- [ ] Events: task:updated, issue:updated/triaged, run:updated, user:online/offline, notification:new
- [ ] Notification center with preferences
- [ ] Email templates (reset, invite, critical issue)

Acceptance:
- Live updates visible across tabs
- In‑app notifications mark read/unread
- Emails sent for critical events (stub/provider)

### Phase 7: Time Tracking & Reporting (Week 14–15)

Tasks:
- [ ] Timesheets: start/stop timer, manual entry, approvals
- [ ] Reports: throughput, lead/cycle time, QA pass rate, time by entity
- [ ] Role dashboards: admin/manager/qa/team
- [ ] Exports (CSV/Excel)

Acceptance:
- Submit/approve timesheet
- Generate and export key reports

### Phase 8: Files, Search, Import/Export (Week 16)

Tasks:
- [ ] File uploads: attachments for tasks/issues/runs (Node runtime)
- [ ] Storage abstraction (local → S3/GCP pluggable)
- [ ] Global search (Mongo text/Atlas Search)
- [ ] Import/export: tasks, issues, test runs (CSV/Excel)
- [ ] Backup strategy & scripts

Acceptance:
- RBAC‑aware upload/download/delete
- Search returns relevant entities quickly

### Phase 9: Security, Performance, Testing (Hardening)

Tasks:
- [ ] Security review: headers, JWT, RBAC, input validation
- [ ] Rate limits on auth/issue creation
- [ ] Index review + query optimization
- [ ] Cache strategy: revalidateTag, client cache policies
- [ ] Test coverage ≥ 80% critical, E2E for main journeys

Acceptance:
- OWASP Top 10 checklist pass
- P95 latencies within budgets
- CI green with coverage gate

### Phase 10: Deployment & Observability (Release)

Tasks:
- [ ] Envs: dev/stage/prod; secrets managed
- [ ] CI/CD: lint, test, typecheck, build, preview, prod
- [ ] Monitoring: Vercel Analytics, health endpoints, alerts
- [ ] Runbooks: rollback, migrations, backups/restore

Acceptance:
- One‑click deploy to staging → prod
- Alerts on error spikes/downtime
- Deployment checklist completed

## 7) API & Data Guidelines

- Route Handlers (app/api/*/route.ts) with Node runtime for DB access
- Consistent error shape: { error: { code, message, details? } }
- Zod for all request/response schemas
- Pagination: page/limit + total; support query filters
- Mutations: revalidateTag to update RSC caches
- Soft deletes where appropriate; audit fields { createdBy, updatedBy, timestamps }

## 8) Indexing Plan

- users: email (unique), roles
- projects: name (text), status, priority, owners/managers/members
- modules: projectId, status
- tasks: projectId, moduleId, status, priority, assignees, order, createdAt
- issues: projectId, status, severity, priority, assignees, components, createdAt
- testcases: projectId, component, priority
- testruns: projectId, suiteId, createdAt, results.status aggregate fields

## 9) Documentation & Tooling

- OpenAPI docs (next-swagger-doc or Orval) generated from Zod schemas
- Storybook for critical UI (forms, boards, modals)
- ADRs for key decisions (auth, realtime, storage)
- Changelog, setup, and deployment docs

## 10) Daily Workflow

1) Standup: goals & blockers
2) Implement vertical slice
3) Add/maintain tests while coding
4) Review with PR checklist
5) Update docs + changelog

## 11) Definition of Done (per Feature)

- Meets acceptance criteria
- Types, lint, tests pass; coverage threshold met
- A11y checks for UI
- Logs/metrics where needed
- Docs + changelog updated