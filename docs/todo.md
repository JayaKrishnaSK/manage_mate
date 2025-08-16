## ManageMate: Development Task Checklist

This document breaks down the development of ManageMate into a series of actionable tasks, organized by sprint. Each item represents a concrete piece of work that can be assigned and tracked.

---

### Sprint 0: The Foundation & Project Bootstrap

**Goal:** Establish a fully configured, developer-ready application skeleton.

#### **Setup & Configuration**

- `[ ]` Initialize Next.js project (App Router, TypeScript, Tailwind, ESLint).
- `[ ]` Create canonical directory structure (`src/app`, `src/components`, `src/lib`, etc.).
- `[ ]` Install backend dependencies: `mongoose`, `next-auth`, `bcryptjs`, `redis`, `socket.io`, `node-cron`.
- `[ ]` Install frontend dependencies: `@tanstack/react-query`, `zustand`, `socket.io-client`, `lucide-react`, `react-hook-form`, `zod`.
- `[ ]` Initialize `shadcn-ui` and add initial components (`button`, `input`, `card`, `form`).
- `[ ]` Install utility & dev dependencies: `date-fns`, `xlsx`, `husky`, `lint-staged`.
- `[ ]` Configure Husky and lint-staged for pre-commit quality checks.

#### **Core Services & Database**

- `[ ]` Implement MongoDB connection singleton in `src/lib/db.ts`.
- `[ ]` Implement Redis connection singleton in `src/lib/redis.ts`.
- `[ ]` Define all Mongoose schemas in `src/models/`: `users`, `projects`, `projectMemberships`, `modules`, `tasks`, `notifications`, `personalTodos`.
- `[ ]` Create and document environment variables in `.env.example`.
- `[ ]` Implement the abstract `StorageService` with the initial `LocalFsProvider`.

---

### Sprint 1: User Authentication & System Administration

**Goal:** Implement the complete user lifecycle and foundational administrative capabilities.

#### **Authentication**

- `[ ]` Configure Next-Auth `[...nextauth]` route with a Credentials Provider.
- `[ ]` Build UI: Login page (`/login`).
- `[ ]` Build UI: Registration page (`/register`).
- `[ ]` Implement API: `POST /api/register` for new user creation with password hashing.
- `[ ]` Implement Next-Auth `authorize` logic for the login process.
- `[ ]` Configure Next-Auth callbacks to add user `_id` and `systemRole` to the session JWT.
- `[ ]` Wrap the root layout in a `SessionProvider`.

#### **Authorization & Admin Features**

- `[ ]` Create root `middleware.ts` to protect all application pages by default.
- `[ ]` Build UI: Admin-only user management page to list all system users.
- `[ ]` Implement API: `GET /api/users` (protected for Admins only).
- `[ ]` Build UI: "Create Project" form/modal for Admins.
- `[ ]` Implement API: `POST /api/projects` to create a `projects` document and initial `projectMemberships` for Owner/Manager.
- `[ ]` **QA Gate:** Verify all authentication flows, route protection, and admin permissions.

---

### Sprint 2: Project Workspace & Role-Based Access (RBAC)

**Goal:** Enable project setup, team management, and enforce granular permissions.

#### **Project & Team Management**

- `[ ]` Build UI: Dynamic project dashboard page (`/projects/[projectId]`).
- `[ ]` Build UI: Member management panel within the project dashboard (view, add, edit role, remove).
- `[ ]` Implement API: `GET /api/projects/[projectId]/members`.
- `[ ]` Implement API: `POST /api/projects/[projectId]/members` to add a user.
- `[ ]` Implement API: `PATCH /api/projects/[projectId]/members/[membershipId]` to change a role.
- `[ ]` Implement API: `DELETE /api/projects/[projectId]/members/[membershipId]` to remove a user.

#### **Core Authorization Logic**

- `[ ]` Create a reusable server-side function/middleware for project-level RBAC.
- `[ ]` Define a permission map (e.g., a constant object) outlining what each project-level role can do.
- `[ ]` Integrate this RBAC check into all project-specific API endpoints.

#### **Module Management**

- `[ ]` Build UI: "Create Module" form within the project dashboard.
- `[ ]` Build UI: List/display of modules within a project.
- `[ ]` Implement API: CRUD endpoints for modules (e.g., `/api/projects/[projectId]/modules`).
- `[ ]` **QA Gate:** Rigorously test all project-level roles. (e.g., Ensure a 'Developer' cannot add members).

---

### Sprint 3: Core Task Management

**Goal:** Deliver the application's central feature: creating, viewing, and managing tasks.

#### **Task Functionality**

- `[ ]` Build UI: "Create Task" form with all fields (Type, Assignee, Priority, Dates, etc.).
- `[ ]` Build UI: Task Detail View (as a modal or side panel) to display all task information.
- `[ ]` Implement API: `POST /api/modules/[moduleId]/tasks`.
- `[ ]` Implement API: `GET /api/tasks/[taskId]`.
- `[ ]` Implement API: `PATCH /api/tasks/[taskId]` for updates.
- `[ ]` Implement API: `DELETE /api/tasks/[taskId]`.

#### **Module Views**

- `[ ]` Implement UI: Waterfall view (a sortable table or list of tasks).
- `[ ]` Implement UI: Agile (Kanban) board view with columns for status.
- `[ ]` Install and configure `dnd-kit` for drag-and-drop functionality on the Kanban board.
- `[ ]` Connect the "onDragEnd" event to the `PATCH` API to update task status.

#### **Dependencies & Conflicts**

- `[ ]` Implement UI for selecting and displaying task dependencies in the Task Detail View.
- `[ ]` Update `task` schema and API to store dependency relationships.
- `[ ]` Add a visual indicator (e.g., a warning icon) to the task UI that appears if `hasConflict` is `true`.
- `[ ]` **QA Gate:** Test the entire task lifecycle, both module views, and drag-and-drop.

---

### Sprint 4: Real-Time Collaboration & Communication

**Goal:** Make the application dynamic with live updates, chat, and notifications.

#### **Real-Time Infrastructure**

- `[ ]` Set up the Socket.io server and integrate it with the Next.js backend.
- `[ ]` Create a utility service to publish events to Redis.
- `[ ]` Configure the Socket.io server to subscribe to Redis channels and emit events to clients.

#### **Notifications & Chat**

- `[ ]` Build UI: Notification Center (bell icon and dropdown list).
- `[ ]` Connect frontend `socket.io-client` to listen for real-time notification events.
- `[ ]` Update backend services (e.g., Task assignment) to create `notification` docs and publish events.
- `[ ]` Build UI: Chat interface for modules and project channels.
- `[ ]` Implement API: `POST /api/chat/messages` to save new messages to MongoDB.
- `[ ]` Integrate message saving with publishing the message to the appropriate Redis channel.

#### **File Management**

- `[ ]` Build UI: File upload component using a library like `react-dropzone`.
- `[ ]` Implement API: Endpoint to handle file uploads via the `StorageService`.
- `[ ]` Update Project, Module, and Task UIs to display and allow downloading of attached files.
- `[ ]` **QA Gate:** Test all real-time features with multiple concurrent users/browsers.

---

### Sprint 5: User Productivity & Automation

**Goal:** Enhance individual workflows and automate background system processes.

#### **Personal Workspace**

- `[ ]` Build UI: Main user dashboard to aggregate "My Tasks" from all projects.
- `[ ]` Build UI: Personal To-Do Manager component on the dashboard.
- `[ ]` Implement `TodoService` and CRUD API endpoints (`/api/todos`).
- `[ ]` Implement the MongoDB aggregation pipeline with `$lookup` for the `GET /api/todos` endpoint to provide context for linked items.

#### **Timesheet & Export**

- `[ ]` Build UI: Timesheet page with selectable Calendar and Table views.
- `[ ]` Implement API for logging time against specific tasks.
- `[ ]` Build UI: "Export to .xlsx" button on the timesheet page.
- `[ ]` Implement the export API endpoint using `worker_threads` to offload file generation.

#### **Background Jobs**

- `[ ]` Configure `node-cron` to initialize and run a scheduled job.
- `[ ]` Implement the Task Conflict Detection logic (aggregation query, flagging tasks, creating notifications).
- `[ ]` Integrate an SMTP service (e.g., SendGrid, Nodemailer).
- `[ ]` Implement the email sending logic for critical/high-priority notifications.
- `[ ]` **QA Gate:** Test the personal dashboard, to-do linking, timesheet export, and manually trigger/verify the cron job.

---

### Sprint 6: Reporting, Polish & Production Readiness

**Goal:** Finalize the application, add reporting, and prepare for a stable production release.

#### **Dashboards & Reporting**

- `[ ]` Build UI: Project Dashboard with progress charts and task status summaries.
- `[ ]` Build UI: User Dashboard with workload and performance analytics.
- `[ ]` Install and configure a charting library (e.g., Recharts).
- `[ ]` Implement the complex MongoDB aggregation queries required for dashboard data.
- `[ ]` Integrate aggregation data with the frontend charts.

#### **Final Polish & Review**

- `[ ]` Conduct a full UI/UX consistency review across the entire application.
- `[ ]` Perform an accessibility (a11y) audit using browser tools and fix high-priority issues.
- `[ ]` Test and ensure the application is responsive and usable on key screen sizes (desktop, tablet).

#### **Pre-Production**

- `[ ]` Add necessary indexes to MongoDB collections to optimize query performance.
- `[ ]` Ensure all API endpoints have robust server-side validation using Zod.
- `[ ]` Set up the production hosting environment (Vercel, AWS, etc.).
- `[ ]` Configure production environment variables and services.
- `[ ]` Create a CI/CD pipeline (e.g., GitHub Actions) for automated testing and deployment.
- `[ ]` **Final UAT:** Conduct User Acceptance Testing with a pilot group of internal users.
- `[ ]` Address all critical feedback and bugs from UAT.
- `[ ]` **Deploy to Production!**
