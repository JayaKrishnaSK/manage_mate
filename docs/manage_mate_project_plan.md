# Manage Mate — Next.js Project Plan (with Issue Tracking & QA)

## 1) Overview
A comprehensive project management web app built on Next.js 15 (App Router, RSC, Server Actions) with MongoDB. Includes role‑based access, real‑time collaboration, multi‑project support, issue tracking, and QA test management.

## 2) Roles & Hierarchy
Hierarchy: Admin → Manager → QA Lead → Team Member → Guest
- Admin: Full control
- Manager: Own/manage projects, teams
- QA Lead: Owns test cases/suites/runs, triage policies
- Team Member: Tasks, execute test runs, update assigned issues
- Guest: Limited read, can comment on assigned items
Notes: Multi‑role per project; role‑specific dashboards and permissions.

## 3) Architecture (App Router)

- Next.js 15 with TypeScript, Tailwind, shadcn/ui, next-themes
- Data layer: MongoDB Atlas + Mongoose (optional Prisma)
- APIs: Route Handlers under app/api (Node runtime for DB)
- Data fetching: RSC for reads; Route Handlers/Server Actions for mutations
- Realtime: WebSocket route (native) or Socket.IO (Node runtime)
- Caching: RSC cache + revalidateTag / revalidatePath
- SEO: Metadata API, sitemap/robots, @vercel/og social images
- i18n (optional): next-intl
- PWA (optional): next-pwa

Folder highlights:
```
src/app/*             # routes, layouts, route handlers
src/lib/*             # db, auth, policies, validations, cache, mail, storage
src/models/*          # Mongoose models
src/server/*          # domain services (pure TS)
src/components/*      # UI, layout, forms, common
src/features/*        # issues, qa, tasks modules (UI + server utils)
middleware.ts         # auth/role gating for routes
```

## 4) Database Design (Key Collections)

Users:
```javascript
{ _id, email, name, roles: ['admin'|'manager'|'qa_lead'|'team_member'|'guest'], isActive, avatar, createdAt, lastLogin,
  preferences: { notifications, emailUpdates, theme } }
```

Projects:
```javascript
{ _id, name, description, status: 'active'|'on_hold'|'completed'|'cancelled',
  template: 'agile'|'waterfall'|'kanban'|'custom', owners: [uid], managers: [uid], qaLeads: [uid],
  members: [uid], guestUsers: [uid], components: [String], startDate, endDate, priority: 'low'|'medium'|'high'|'critical',
  attachments: [{ name, url, uploadedBy, uploadedAt }], createdBy, createdAt, updatedAt }
```

Modules:
```javascript
{ _id, projectId, name, description, owners: [uid], contributors: [uid],
  status: 'not_started'|'in_progress'|'testing'|'completed'|'on_hold',
  priority, dependencies: [moduleId], startDate, endDate, attachments, createdBy, createdAt, updatedAt }
```

Tasks:
```javascript
{ _id, projectId, moduleId, title, description, type: 'feature'|'chore'|'research'|'documentation'|'bugfix',
  assignees: [uid], status: 'todo'|'in_progress'|'review'|'testing'|'done'|'blocked', priority, order,
  dependencies: [{ type: 'task'|'resource', reference, description }], timeEstimate, timeSpent, startDate, dueDate,
  attachments, todos: [{ text, completed, createdBy, createdAt }], linkedIssues: [issueId], createdBy, createdAt, updatedAt }
```

Issues (Ticketing):
```javascript
{ _id, projectId, moduleId: ObjectId|null, reporterId, assignees: [uid],
  type: 'bug'|'incident'|'improvement'|'request',
  status: 'new'|'triaged'|'in_progress'|'in_review'|'qa_testing'|'done'|'wontfix'|'duplicate',
  severity: 'critical'|'high'|'medium'|'low', priority: 'p0'|'p1'|'p2'|'p3',
  components: [String], environment: 'prod'|'staging'|'dev', reproducible: Boolean,
  stepsToReproduce, expectedResult, actualResult, labels: [String], relatedTasks: [taskId],
  duplicateOf: issueId|null, sla: { targetAt: Date|null, breached: Boolean },
  similarityHash: String|null, attachments, createdAt, updatedAt, closedAt: Date|null, closedBy: uid|null }
```

QA (TestCases / TestSuites / TestRuns):
```javascript
TestCase: { _id, projectId, title, preconditions, steps: [{ step, action, expected }], priority, component, tags, version, ownerId, createdAt, updatedAt }
TestSuite: { _id, projectId, name, description, testCaseIds: [caseId], createdBy, createdAt, updatedAt }
TestRun: { _id, projectId, suiteId, buildTag, environment, executorId, status: 'not_started'|'in_progress'|'completed',
  startedAt, endedAt, results: [{ testCaseId, status: 'pass'|'fail'|'blocked'|'na', notes, evidence, defectIssueId }], createdAt }
```

TimeSheets:
```javascript
{ _id, userId, projectId, taskId: ObjectId|null, issueId: ObjectId|null, date, startTime, endTime, duration, description, createdAt }
```

Notifications:
```javascript
{ _id, userId, type: 'task_assigned'|'issue_assigned'|'status_changed'|'deadline'|'mention'|'sla_warning',
  title, message, read, relatedEntity: { type: 'project'|'module'|'task'|'issue'|'testrun', id }, createdAt }
```

Comments:
```javascript
{ _id, entityType: 'project'|'module'|'task'|'issue'|'testrun', entityId, userId, message, mentions: [uid], createdAt, updatedAt }
```

## 5) Auth & Authorization

- JWT in httpOnly cookies; access + refresh; rotation on refresh
- middleware.ts protects application routes; decodes minimal claims
- Role checks in policies.ts used by Route Handlers and Server Actions
- Optional: Auth.js (NextAuth) with Credentials and JWT session for improved SSR ergonomics

JWT payload:
```javascript
{ userId, email, roles: [String], exp, iat }
```

## 6) Frontend (App Router) Components

- Layouts: AppShell (Header, Sidebar, Breadcrumbs), ThemeProvider
- Pages (RSC first):
  - dashboard/
  - projects/ (list, detail, settings)
  - modules/ (overview)
  - tasks/ (kanban, list, detail modal)
  - issues/ (list, board/triage, detail)
  - qa/ (test-cases, suites, runs, dashboard)
  - users/ (admin)
  - reports/
  - settings/
- Shared Components:
  - EntityLinker, SLAIndicator, EvidenceUploader, NotificationCenter, ActivityFeed
- Forms: React Hook Form (RHF) + Zod validation; progressive enhancement via server actions where appropriate
- All forms use useForm() hook with zodResolver for validation
- Consistent error handling and loading states across all forms

## 7) API Endpoints (Route Handlers)

Auth:
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

Users:
```
GET    /api/users
POST   /api/users               (Admin)
PUT    /api/users/:id
DELETE /api/users/:id           (Admin)
POST   /api/users/:id/invite
POST   /api/users/set-password
```

Projects/Modules/Tasks:
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId
GET    /api/projects/:id/modules
GET    /api/projects/:id/tasks

GET    /api/modules
POST   /api/modules
GET    /api/modules/:id
PUT    /api/modules/:id
DELETE /api/modules/:id
POST   /api/modules/:id/contributors
GET    /api/modules/:id/tasks

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/todos
PUT    /api/tasks/:id/status
POST   /api/tasks/:id/time-entries
POST   /api/tasks/:id/issues/:issueId/link
DELETE /api/tasks/:id/issues/:issueId/unlink
```

Issues (Ticketing):
```
GET    /api/issues
POST   /api/issues
GET    /api/issues/:id
PUT    /api/issues/:id
DELETE /api/issues/:id
PUT    /api/issues/:id/status
PUT    /api/issues/:id/triage
POST   /api/issues/:id/link-task/:taskId
POST   /api/issues/:id/duplicate/:masterIssueId
GET    /api/issues/:id/history
```

QA:
```
GET    /api/test-cases
POST   /api/test-cases
GET    /api/test-cases/:id
PUT    /api/test-cases/:id
DELETE /api/test-cases/:id

GET    /api/test-suites
POST   /api/test-suites
GET    /api/test-suites/:id
PUT    /api/test-suites/:id
DELETE /api/test-suites/:id

GET    /api/test-runs
POST   /api/test-runs
GET    /api/test-runs/:id
PUT    /api/test-runs/:id
POST   /api/test-runs/:id/results
POST   /api/test-runs/:id/results/:caseId/defect
GET    /api/test-runs/:id/export
```

Files/Comments/Notifications:
```
POST   /api/files
GET    /api/files/:id
DELETE /api/files/:id

GET    /api/comments?entityType&entityId
POST   /api/comments
PUT    /api/comments/:id
DELETE /api/comments/:id

GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
```

Realtime:
```
GET    /api/websocket           # Upgrade to ws (native) OR Socket.IO namespace
Events: task:updated, issue:updated, issue:triaged, run:updated, user:online/offline, notification:new
```

Runtime notes:
- DB operations require Node runtime: export const runtime = 'nodejs'
- Edge runtime acceptable for read‑only cacheable routes

## 8) Key Features

Dashboards:
- Admin: global stats, user metrics, activity
- Manager: projects health, deadlines, resources
- QA Lead: coverage, pass rate, defect SLAs
- Team Member: assigned tasks/issues, timesheet summary
- Guest: assigned items only

Issue Tracking:
- Triage queue with SLA indicators, component ownership, dedupe
- Status flow: new → triaged → in_progress → in_review → qa_testing → done/wontfix/duplicate
- Link issues ↔ tasks/modules/test results
- Saved searches and custom views

QA Test Management:
- Test case CRUD + version field
- Suite Builder (drag/drop)
- Test Run executor with evidence upload
- Auto defect creation/link on failures
- QA analytics + exports

Time Tracking:
- Timer + manual entries; approvals
- Reports by user/project/task/issue

Communication:
- Comments with @mentions, activity feeds
- Notification center + email for critical events

Files:
- RBAC‑aware attachments; pluggable storage (local → S3/GCP)

Search/Filtering:
- Global search with text + filters; Atlas Search optional

## 9) Development Phases (Updated Summary)

- P1: Foundations & Auth
- P2: RBAC & Users
- P3: Projects & Modules
- P4: Tasks & Issue Tracking (vertical slice)
- P5: QA Test Management
- P6: Realtime & Notifications
- P7: Time Tracking & Reporting
- P8: Files, Search, Import/Export
- P9: Security, Performance, Testing
- P10: Deployment & Observability

Each phase follows acceptance criteria and quality gates in the development plan.

## 10) Testing Strategy

- Unit: Vitest/Jest for services, route handlers, policies
- Integration: supertest/undici against Route Handlers in Node runtime
- E2E: Playwright for auth, tasks, issues, QA runs
- Performance: load tests for list/board endpoints
- Accessibility: axe checks on critical pages/components

## 11) Deployment & Infrastructure

- Hosting: Vercel (first‑class Next.js)
- DB: MongoDB Atlas
- Files: Local (dev) → S3/GCP via adapter
- Email: Microsoft Graph API (Outlook) or Resend
- CI/CD: Lint, typecheck, test, build, preview, deploy
- Observability: Vercel Analytics, structured logs, uptime checks

## 12) Future Enhancements

- Integrations: Git (PR ↔ Issue links), Slack/Teams, Calendar sync
- Advanced Analytics: lead/cycle time, burndown, defect escape rate
- Service Desk Portal: external ticket intake + SLAs
- Mobile: React Native app with push notifications
- Workflow Engine: custom approvals, auto‑assign rules
- AI Assist: triage/duplicate detection, repro step generation

## 13) Non‑Functional Requirements

- Security: OWASP Top 10, least privilege, secret management
- Performance: P95 API < 500ms; streaming for heavy pages
- Accessibility: WCAG 2.1 AA
- Privacy: retention for logs/attachments; PII minimization
- Backups: daily snapshots; restore/runbooks

---
This plan adapts Manage Mate to Next.js App Router with modern capabilities (RSC, Server Actions, caching, native websockets), and integrates robust issue tracking and QA workflows.