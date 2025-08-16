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
- Forms: React Hook Form + Zod Resolver (implemented across all forms)
- All forms implemented with consistent patterns:
  - useForm() hook with zodResolver for validation
  - Error state management with form.formState.errors
  - Loading states during submission
  - Proper TypeScript typing with validation schemas
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

- **Phase 3: Projects & Modules** - ✅ 100% Complete
  - Project models and validation schemas implemented
  - Complete project management UI with enhanced create/edit functionality
  - Full module management with creation, editing, and dependency tracking
  - Project template system in place
  - Team member assignment and management
  - Project detail pages with modules overview
  - Complete API endpoints for projects and modules (CRUD operations)
  - Circular dependency detection for modules
  - Enhanced forms with proper validation and error handling

✅ **Phase 4: Tasks & Issue Tracking** - 60% Complete
- **Issues Module** - 100% Complete
  - Complete issues tracking with list and board views
  - Issue creation with full form validation
  - Status-based workflow (new → triaged → in_progress → etc.)
  - Filtering and search capabilities
  - Role-based access controls
- **Tasks Module** - Needs completion
  - Task models exist but UI implementation needed
  - Kanban board functionality to be implemented

✅ **Phase 5: QA Test Management** - 40% Complete
- QA dashboard with metrics overview
- Test cases management with creation forms
- Test suites and test runs (UI placeholders created)
- QA validation schemas implemented

✅ **Additional Features Completed:**
- **Reports Module** - Basic dashboard with report types
- **Settings Module** - Comprehensive settings interface
- **Role-based Navigation** - Dynamic sidebar based on user permissions
- **Theme Consistency** - All new components use theme-aware styling
- **React Hook Form Integration** - Documented and consistently implemented

🚧 **Current Priority Items:**
- ✅ Complete Project and Module management features (PHASE 3 COMPLETED)
- Complete Tasks module with Kanban board
- Implement remaining QA functionality (test suites/runs)
- Add real-time features and notifications

## 🎯 Recent Completions (January 2025)

### ✅ **Phase 3: Projects & Modules - COMPLETED**

**Completed Features:**
- **Complete Project APIs:**
  - ✅ GET /api/projects (list projects with filtering and pagination)
  - ✅ POST /api/projects (create with team assignment and validation)
  - ✅ PUT /api/projects/[id] (update with permission checks)
  - ✅ DELETE /api/projects/[id] (soft delete)
  - ✅ GET /api/projects/[id]/members (team member management)
  - ✅ POST /api/projects/[id]/members (add team members with roles)
  - ✅ DELETE /api/projects/[id]/members (remove team members)

- **Complete Module APIs:**
  - ✅ GET /api/modules (list modules with project filtering)
  - ✅ POST /api/modules (create modules with dependencies)
  - ✅ GET /api/modules/[id] (get module details)
  - ✅ PUT /api/modules/[id] (update with circular dependency detection)
  - ✅ DELETE /api/modules/[id] (delete with dependency validation)

- **Enhanced UI Implementation:**
  - ✅ Complete project creation form with all required fields and team assignment
  - ✅ Enhanced project detail page with modules, members, and settings tabs
  - ✅ Full module management with creation, editing, and dependency tracking
  - ✅ Team member assignment interface with role management
  - ✅ Module detail views with dependency visualization
  - ✅ Status filtering and search functionality across all components
  - ✅ Comprehensive error handling and validation

- **Advanced Features:**
  - ✅ Circular dependency detection for module dependencies
  - ✅ Role-based team member management (owners, managers, qa_leads, members, guests)
  - ✅ Enhanced validation schemas with proper TypeScript integration
  - ✅ Multi-select components for user and module selection
  - ✅ Real-time module statistics and progress tracking

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

### Phase 3: Projects & Modules (Week 5–6) - ✅ 100% COMPLETE

**Goal:** Implement complete project structure and module organization with full team management

✅ **Completed Tasks:**
- [x] **Project Model & Schema**
  - [x] Create Project model with all required fields
  - [x] Add proper MongoDB indexes
  - [x] Add validation schemas in `src/lib/validations/projects.ts`
- [x] **Complete Project APIs**
  - [x] GET /api/projects - List projects with filtering, pagination, and search
  - [x] POST /api/projects - Create with comprehensive team assignment
  - [x] GET /api/projects/[id] - Get project details with populated team data
  - [x] PUT /api/projects/[id] - Update with permission checks and validation
  - [x] DELETE /api/projects/[id] - Soft delete with proper cleanup
  - [x] GET /api/projects/[id]/members - Team member management
  - [x] POST /api/projects/[id]/members - Add members with role assignment
  - [x] DELETE /api/projects/[id]/members - Remove members with validation
- [x] **Complete Module APIs**
  - [x] GET /api/modules - List modules with project filtering
  - [x] POST /api/modules - Create modules with dependency management
  - [x] GET /api/modules/[id] - Get module details with dependencies
  - [x] PUT /api/modules/[id] - Update with circular dependency detection
  - [x] DELETE /api/modules/[id] - Delete with dependency validation
- [x] **Enhanced UI Implementation**
  - [x] Complete project creation form with all fields and team assignment
  - [x] Project detail page with modules, members, and settings tabs
  - [x] Module management with creation, editing, and dependency tracking
  - [x] Team member assignment interface with role-based management
  - [x] Enhanced search and filtering capabilities
  - [x] Module statistics and progress tracking
  - [x] Comprehensive error handling and validation
  - [x] Theme-aware styling throughout all components

**Key Features Implemented:**
- Complete project lifecycle management (create → assign team → manage modules)
- Advanced module dependency management with circular dependency detection
- Role-based team member management (owners, managers, qa_leads, members, guests)
- Multi-select components for efficient user and module selection
- Real-time statistics and progress tracking
- Enhanced validation with proper TypeScript integration
- Comprehensive CRUD operations for both projects and modules

**Acceptance Criteria Met:**
- ✅ Create project → assign team → create modules → assign contributors workflow complete
- ✅ Project managers can only manage their assigned projects
- ✅ Proper access control enforced throughout all APIs and UI components
- ✅ Module dependencies tracked with circular dependency prevention
- ✅ Team member roles properly managed with validation
- ✅ All forms include comprehensive validation and error handling

**Status:** ✅ **COMPLETED - Ready for User Testing**
**Completion Date:** January 2025

### Phase 4: Tasks & Issue Tracking (Week 7–9) - 🟡 60% COMPLETE

**Current Status:** Issues module complete, Tasks module needs implementation

✅ **Completed - Issues Module (100%)**
- [x] **Issue Model:** Complete with comprehensive tracking fields
- [x] **Issue APIs:** Full CRUD with filtering and search
- [x] **Issue UI Implementation:**
  - [x] Issues list view with advanced filtering
  - [x] Issues board view (Kanban-style by status)
  - [x] Create issue modal with full validation
  - [x] Status workflow (new → triaged → in_progress → etc.)
  - [x] Priority and severity badges with theme support
- [x] **Validation Schemas:** Complete issue validation
- [x] **Role-based Access:** Issues available to appropriate roles

🚧 **Remaining Tasks - Tasks Module:**
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

- [ ] **Integration Features**
  - [ ] Task ↔ Issue linking
  - [ ] Real-time board updates
  - [ ] Activity feeds for tasks and issues

**Priority:** High (core workflow implementation)
**Target Completion:** February 2025

### Phase 5: QA Test Management (Week 10–12) - 🟡 40% COMPLETE

**Current Status:** Dashboard and test cases implemented, test suites/runs need completion

✅ **Completed:**
- [x] **QA Models:** TestCase, TestSuite, TestRun with complete schema
- [x] **QA Dashboard:** Metrics overview with stats and recent runs
- [x] **Test Cases Management:**
  - [x] Test cases list with filtering
  - [x] Create test case modal with validation
  - [x] Priority-based organization
  - [x] Component and tag-based filtering
- [x] **Validation schemas:** QA validations in place
- [x] **UI Framework:** Tabbed interface for different QA modules

🚧 **Remaining Tasks:**
- [ ] **Complete Test Suites Implementation**
  - [ ] Test suite builder with drag/drop functionality
  - [ ] Suite management interface
  - [ ] Test case assignment to suites

- [ ] **Complete Test Runs Implementation**
  - [ ] Test run execution tracking
  - [ ] Result recording with evidence upload
  - [ ] Test execution workflows

- [ ] **Integration Features**
  - [ ] Auto-create issues from failing test results
  - [ ] Link test results to existing issues
  - [ ] QA coverage reporting by module/project
  - [ ] Export functionality (CSV/Excel)

- [ ] **Permissions & Access Control**
  - [ ] QA Lead can manage all test artifacts
  - [ ] Team members can execute assigned test runs
  - [ ] Project-based test case visibility

**Status:** ✅ Foundation complete, execution features in progress
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

### Additional Modules Implemented

✅ **Reports Module** - Basic Implementation Complete
- Dashboard with various report types (Project Summary, Task Completion, etc.)
- Quick statistics overview
- Placeholder for future report generation
- Role-based access (admin, manager, qa_lead)

✅ **Settings Module** - Comprehensive Implementation Complete
- Multi-section settings interface (General, Users, Security, etc.)
- Role-based settings access (admin only)
- Organized settings categories with proper navigation
- Theme-aware styling throughout

✅ **Role-Based Navigation System** - Complete
- Dynamic sidebar navigation based on user roles
- Role-specific menu items with proper filtering
- 5-tier permission system integration (admin → manager → qa_lead → team_member → guest)
- Consistent access control across all modules

✅ **Theme System Improvements** - Complete
- All new components use theme-aware styling
- Consistent color variables throughout application
- Dark/light mode support for all new UI elements
- Fixed legacy components to use theme tokens

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

## 9) Forms Implementation Standards

All forms in the application follow consistent React Hook Form patterns:

### Implemented Forms:
- ✅ **Login Form** (`/src/app/login/page.tsx`) - Email/password authentication
- ✅ **Register Form** (`/src/app/register/page.tsx`) - User registration 
- ✅ **Profile Form** (`/src/components/forms/profile-form.tsx`) - User profile management
- ✅ **Invite Form** (`/src/components/forms/invite-form.tsx`) - Accept user invitations
- ✅ **Create Project Modal** (`/src/components/projects/create-project-modal.tsx`) - Project creation

### Form Implementation Pattern:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemaName, type SchemaInput } from '@/lib/validations/...';

export function ComponentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaInput>({
    resolver: zodResolver(schemaName),
  });

  const onSubmit = async (data: SchemaInput) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with error handling */}
    </form>
  );
}
```

### Form Standards:
- Use Zod schemas for validation defined in `/src/lib/validations/`
- Consistent error display patterns
- Loading states during submission  
- TypeScript types generated from Zod schemas
- Accessible form labels and error messages

## 10) Documentation & Tooling

- OpenAPI docs (next-swagger-doc or Orval) generated from Zod schemas
- Storybook for critical UI (forms, boards, modals)
- ADRs for key decisions (auth, realtime, storage)
- Changelog, setup, and deployment docs

## 11) Daily Workflow

1) Standup: goals & blockers
2) Implement vertical slice
3) Add/maintain tests while coding
4) Review with PR checklist
5) Update docs + changelog

## 12) Definition of Done (per Feature)

- Meets acceptance criteria
- Types, lint, tests pass; coverage threshold met
- A11y checks for UI
- Logs/metrics where needed
- Docs + changelog updated