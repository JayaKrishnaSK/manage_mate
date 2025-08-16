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

## 2) Current State (Updated: Jan 2025)

✅ **Completed Phases:**
- **Phase 1: Foundation & Auth** - 100% Complete
  - Next.js 15 + Tailwind CSS + shadcn/ui configured
  - NextAuth.js + MongoDB + Mongoose integration
  - JWT-based authentication with httpOnly cookies
  - Theme system (light/dark/system) with next-themes
  - Base layout with responsive navigation

- **Phase 2: RBAC & Users** - 100% Complete  
  - 5-tier role system (admin, manager, qa_lead, team_member, guest)
  - Comprehensive permission matrix in policies.ts
  - Complete user management APIs with CRUD operations
  - Token-based invite system with secure invitation flow
  - Profile management with user preferences
  - Activity logging system for audit compliance
  - Admin interface for user and activity management

🚧 **Current Focus: Phase 3: Projects & Modules**
- Need to implement Project and Module models/APIs
- Target: Project creation, member management, module organization

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
- [x] Configure Tailwind + shadcn/ui + monochrome theme tokens
- [x] next-themes ThemeProvider (light/dark/system) with persistence
- [x] Mongoose connection util with global caching in dev
- [x] User model (email, hash, roles, prefs, timestamps)
- [x] Auth APIs (Route Handlers): register, login, logout, refresh, forgot/reset
- [x] JWT access + refresh in httpOnly cookies; rotation + CSRF guard
- [x] middleware.ts to protect app routes; role claims parsing
- [x] Client forms with RHF + Zod; error/loading states
- [x] Base layout: Header, Sidebar, Breadcrumbs, Nav
- [x] Error boundary + not-found routes
- [x] Metadata API (SEO) baseline; robots/sitemap

Acceptance:
- Can register/login/logout; refresh rotates tokens
- Protected dashboard redirects unauthenticated users
- Theme switch persists
- Unit tests: auth services + route handlers (≥70%)
- E2E: login → access protected page

Status: ✅ COMPLETED

### Phase 2: RBAC & Users (Week 3–4)

Tasks:
- [x] Roles: admin, manager, qa_lead, team_member, guest
- [x] Permission matrix in policies.ts + guards in handlers/actions
- [x] Users API: list/create/update/deactivate (admin)
- [x] Invite flow (email stub + token set‑password)
- [x] Profile page (avatar, name, prefs)
- [x] Activity logs for auth and user admin actions

Acceptance:
- ✅ Admin assigns roles; guards enforced server‑side
- ✅ Invite + set password works end‑to‑end
- ✅ Audit log entries visible to admin

Status: ✅ COMPLETED

### Phase 3: Projects & Modules (Week 5–6) - 🚧 CURRENT FOCUS

**Goal:** Implement core project structure and module organization

Tasks:

- [ ] **Project Model & Schema**
  - [ ] Create Project model with all required fields (name, description, status, template, team roles, components, dates, priority, attachments)
  - [ ] Add proper MongoDB indexes (name, status, priority, team members)
  - [ ] Add validation schemas in `src/lib/validations/projects.ts`

- [ ] **Module Model & Schema**
  - [ ] Create Module model with project relationship, dependencies, team assignments
  - [ ] Add indexes for efficient queries (projectId, status, dependencies)
  - [ ] Add validation schemas for module operations

- [ ] **Project APIs**
  - [ ] `GET /api/projects` - List projects with filtering/pagination
  - [ ] `POST /api/projects` - Create new project (managers/admins)
  - [ ] `GET /api/projects/[id]` - Project details with modules
  - [ ] `PUT /api/projects/[id]` - Update project (project managers only)
  - [ ] `DELETE /api/projects/[id]` - Soft delete project (project managers/admins)
  - [ ] `POST /api/projects/[id]/members` - Add/remove team members
  - [ ] `GET /api/projects/[id]/modules` - List project modules

- [ ] **Module APIs**
  - [ ] `GET /api/modules` - List modules with project filtering
  - [ ] `POST /api/modules` - Create module (project members)
  - [ ] `GET /api/modules/[id]` - Module details
  - [ ] `PUT /api/modules/[id]` - Update module
  - [ ] `DELETE /api/modules/[id]` - Delete module

- [ ] **UI Implementation**
  - [ ] Projects list page (`/projects`) with grid/table view
  - [ ] Project detail page with module overview
  - [ ] Project creation/editing forms
  - [ ] Module management interface
  - [ ] Team member assignment UI

- [ ] **Access Control Integration**
  - [ ] Implement project-based permissions in policies.ts
  - [ ] Add role checks for project managers vs team members
  - [ ] Restrict project operations based on team membership

- [ ] **Template System**
  - [ ] Create project templates (agile, waterfall, kanban, custom)
  - [ ] Template-based project initialization
  - [ ] Pre-defined module structures for templates

Acceptance Criteria:

- ✅ Create project from template with team assignment
- ✅ Create modules with dependencies and assign contributors  
- ✅ Project managers can manage their own projects
- ✅ API response times < 300ms for 100 items
- ✅ Proper access control enforced server-side
- ✅ Cache invalidation with revalidateTag on mutations

**Target Completion:** End of January 2025

### Phase 4: Tasks & Issue Tracking (Week 7–9) - 🏗️ MODELS COMPLETE

**Current Status:** Models and basic APIs implemented, UI and advanced features needed

Completed Tasks:
- [x] **Task Model:** Complete with projectId, moduleId, status, assignees, todos, attachments
- [x] **Issue Model:** Comprehensive issue tracking with triage workflow, SLA, duplicate detection
- [x] **Basic API Routes:** CRUD endpoints for tasks and issues exist
- [x] **Validation Schemas:** Task and issue validation implemented
- [x] **Model Relationships:** Task ↔ Issue linking, project/module associations

Remaining Tasks — **Tasks:**
- [ ] **Enhanced Task APIs**
  - [ ] Complete CRUD implementation with proper error handling
  - [ ] Status transition API with workflow validation
  - [ ] Bulk operations for task management
  - [ ] Todo management within tasks
  - [ ] Attachment handling

- [ ] **Task UI Implementation**
  - [ ] Kanban board with drag-and-drop functionality
  - [ ] Task list view with filtering and sorting
  - [ ] Task detail modal with comments and attachments
  - [ ] Task creation/editing forms

Remaining Tasks — **Issue Tracking:**
- [ ] **Advanced Issue Features**
  - [ ] Triage workflow implementation (new → triaged → in_progress → etc.)
  - [ ] Issue linking/unlinking to tasks
  - [ ] Duplicate detection and management
  - [ ] SLA tracking and breach notifications
  - [ ] Component-based issue assignment

- [ ] **Issue UI Implementation**
  - [ ] Issue board with triage queue
  - [ ] Advanced filtering and saved searches
  - [ ] Issue detail view with timeline
  - [ ] Bulk triage operations

- [ ] **Real-time Features**
  - [ ] Live board updates (WebSocket/Socket.IO)
  - [ ] Notification system for assignments and status changes
  - [ ] Activity feeds for tasks and issues

Acceptance Criteria:
- ✅ Report bug → triage → assign → link to task → resolve workflow
- ✅ Kanban boards support drag-and-drop with real-time updates  
- ✅ Issue duplicate detection and SLA breach warnings
- ✅ Live updates visible to all assignees and watchers
- ✅ Comprehensive filtering and search capabilities

**Priority:** Critical (core workflow implementation)
**Target Completion:** February 2025

### Phase 5: QA Test Management (Week 10–12) - 🏗️ PARTIALLY IMPLEMENTED

**Current Status:** Models are implemented, APIs and UI need completion

Completed:
- [x] **QA Models:** TestCase, TestSuite, TestRun with complete schema
- [x] **Basic API routes:** test-cases, test-suites, test-runs route files exist
- [x] **Validation schemas:** QA validations in place

Remaining Tasks:
- [ ] **Complete API Implementation**
  - [ ] Implement full CRUD operations for test cases
  - [ ] Test suite builder with drag/drop functionality
  - [ ] Test run execution tracking
  - [ ] Result recording with evidence upload
  - [ ] Defect linking from failed test results

- [ ] **UI Implementation**
  - [ ] Test Case Manager interface
  - [ ] Suite Builder with drag/drop test case selection
  - [ ] Test Runner for executing test suites
  - [ ] Results viewer with evidence attachments
  - [ ] QA Dashboard with metrics and charts

- [ ] **Integration Features**
  - [ ] Auto-create issues from failing test results
  - [ ] Link test results to existing issues
  - [ ] QA coverage reporting by module/project
  - [ ] Export functionality (CSV/Excel)

- [ ] **Permissions & Access Control**
  - [ ] QA Lead can manage all test artifacts
  - [ ] Team members can execute assigned test runs
  - [ ] Project-based test case visibility

Acceptance Criteria:
- ✅ Create test suite → assign test cases → execute run → record results
- ✅ Failing test automatically creates/links defect issue
- ✅ QA dashboard shows pass rate, coverage, and open defects by priority
- ✅ Export test run results with evidence attachments
- ✅ Role-based access: qa_lead manages, team_member executes

**Priority:** High (needed for comprehensive testing workflow)
**Target Completion:** February 2025

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