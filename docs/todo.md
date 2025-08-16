## ManageMate: Development Task Checklist

This document breaks down the development of ManageMate into a series of actionable tasks, organized by sprint. Each item represents a concrete piece of work that can be assigned and tracked.

---

### Sprint 0: The Foundation & Project Bootstrap

**Goal:** Establish a fully configured, developer-ready application skeleton.

#### **Setup & Configuration**

- `[x]` Initialize Next.js project (App Router, TypeScript, Tailwind, ESLint).
- `[x]` Create canonical directory structure (`src/app`, `src/components`, `src/lib`, etc.).
- `[x]` Install backend dependencies: `mongoose`, `next-auth`, `bcryptjs`, `redis`, `socket.io`, `node-cron`.
- `[x]` Install frontend dependencies: `@tanstack/react-query`, `zustand`, `socket.io-client`, `lucide-react`, `react-hook-form`, `zod`.
- `[x]` Initialize `shadcn-ui` and add initial components (`button`, `input`, `card`, `form`).
- `[x]` Install utility & dev dependencies: `date-fns`, `xlsx`, `husky`, `lint-staged`.
- `[x]` Configure Husky and lint-staged for pre-commit quality checks.

#### **Core Services & Database**

- `[x]` Implement MongoDB connection singleton in `src/lib/db.ts`.
- `[x]` Implement Redis connection singleton in `src/lib/redis.ts`.
- `[x]` Define all Mongoose schemas in `src/models/`: `users`, `projects`, `projectMemberships`, `modules`, `tasks`, `notifications`, `personalTodos`.
- `[x]` Create and document environment variables in `.env.example`.
- `[x]` Implement the abstract `StorageService` with the initial `LocalFsProvider`.

---

### Sprint 1: User Authentication & System Administration

**Goal:** Implement the complete user lifecycle and foundational administrative capabilities.

#### **Authentication**

- `[x]` Configure Next-Auth `[...nextauth]` route with a Credentials Provider.
- `[x]` Build UI: Login page (`/login`).
- `[x]` Build UI: Registration page (`/register`).
- `[x]` Implement API: `POST /api/register` for new user creation with password hashing.
- `[x]` Implement Next-Auth `authorize` logic for the login process.
- `[x]` Configure Next-Auth callbacks to add user `_id` and `systemRole` to the session JWT.
- `[x]` Wrap the root layout in a `SessionProvider`.

#### **Authorization & Admin Features**

- `[x]` Create root `middleware.ts` to protect all application pages by default.
- `[x]` Build UI: Admin-only user management page to list all system users.
- `[x]` Implement API: `GET /api/users` (protected for Admins only).
- `[x]` Build UI: "Create Project" form/modal for Admins.
- `[x]` Implement API: `POST /api/projects` to create a `projects` document and initial `projectMemberships` for Owner/Manager.
- `[x]` **QA Gate:** Verify all authentication flows, route protection, and admin permissions.

---

### Sprint 2: Project Workspace & Role-Based Access (RBAC)

**Goal:** Enable project setup, team management, and enforce granular permissions.

#### **Project & Team Management**

- `[x]` Build UI: Dynamic project dashboard page (`/projects/[projectId]`).
- `[x]` Build UI: Member management panel within the project dashboard (view, add, edit role, remove).
- `[x]` Implement API: `GET /api/projects/[projectId]/members`.
- `[x]` Implement API: `POST /api/projects/[projectId]/members` to add a user.
- `[x]` Implement API: `PATCH /api/projects/[projectId]/members/[membershipId]` to change a role.
- `[x]` Implement API: `DELETE /api/projects/[projectId]/members/[membershipId]` to remove a user.

#### **Core Authorization Logic**

- `[x]` Create a reusable server-side function/middleware for project-level RBAC.
- `[x]` Define a permission map (e.g., a constant object) outlining what each project-level role can do.
- `[x]` Integrate this RBAC check into all project-specific API endpoints.

#### **Module Management**

- `[x]` Build UI: "Create Module" form within the project dashboard.
- `[x]` Build UI: List/display of modules within a project.
- `[x]` Implement API: CRUD endpoints for modules (e.g., `/api/projects/[projectId]/modules`).
- `[x]` **QA Gate:** Rigorously test all project-level roles. (e.g., Ensure a 'Developer' cannot add members).

---

### Sprint 3: Core Task Management

**Goal:** Deliver the application's central feature: creating, viewing, and managing tasks.

#### **Task Functionality**

- `[x]` Build UI: "Create Task" form with all fields (Type, Assignee, Priority, Dates, etc.).
- `[x]` Build UI: Task Detail View (as a modal or side panel) to display all task information.
- `[x]` Implement API: `POST /api/modules/[moduleId]/tasks`.
- `[x]` Implement API: `GET /api/tasks/[taskId]`.
- `[x]` Implement API: `PATCH /api/tasks/[taskId]` for updates.
- `[x]` Implement API: `DELETE /api/tasks/[taskId]`.

#### **Module Views**

- `[x]` Implement UI: Waterfall view (a sortable table or list of tasks).
- `[x]` Implement UI: Agile (Kanban) board view with columns for status.
- `[x]` Install and configure `dnd-kit` for drag-and-drop functionality on the Kanban board.
- `[x]` Connect the "onDragEnd" event to the `PATCH` API to update task status.

#### **Dependencies & Conflicts**

- `[x]` Implement UI for selecting and displaying task dependencies in the Task Detail View.
- `[x]` Update `task` schema and API to store dependency relationships.
- `[x]` Add a visual indicator (e.g., a warning icon) to the task UI that appears if `hasConflict` is `true`.
- `[x]` **QA Gate:** Test the entire task lifecycle, both module views, and drag-and-drop.

---

### Sprint 4: Real-Time Collaboration & Communication

**Goal:** Make the application dynamic with live updates, chat, and notifications.

#### **Real-Time Infrastructure**

- `[x]` Set up the Socket.io server and integrate it with the Next.js backend.
- `[x]` Create a utility service to publish events to Redis.
- `[x]` Configure the Socket.io server to subscribe to Redis channels and emit events to clients.

#### **Notifications & Chat**

- `[x]` Build UI: Notification Center (bell icon and dropdown list).
- `[x]` Connect frontend `socket.io-client` to listen for real-time notification events.
- `[x]` Update backend services (e.g., Task assignment) to create `notification` docs and publish events.
- `[x]` Build UI: Chat interface for modules and project channels.
- `[x]` Implement API: `POST /api/chat/messages` to save new messages to MongoDB.
- `[x]` Integrate message saving with publishing the message to the appropriate Redis channel.

#### **File Management**

- `[x]` Build UI: File upload component using a library like `react-dropzone`.
- `[x]` Implement API: Endpoint to handle file uploads via the `StorageService`.
- `[x]` Update Project, Module, and Task UIs to display and allow downloading of attached files.
- `[x]` **QA Gate:** Test all real-time features with multiple concurrent users/browsers.

---

### Sprint 5: User Productivity & Automation

**Goal:** Enhance individual workflows and automate background system processes.

#### **Personal Workspace**

- `[x]` Build UI: Main user dashboard to aggregate "My Tasks" from all projects.
- `[x]` Build UI: Personal To-Do Manager component on the dashboard.
- `[x]` Implement `TodoService` and CRUD API endpoints (`/api/todos`).
- `[x]` Implement the MongoDB aggregation pipeline with `$lookup` for the `GET /api/todos` endpoint to provide context for linked items.

#### **Timesheet & Export**

- `[x]` Build UI: Timesheet page with selectable Calendar and Table views.
- `[x]` Implement API for logging time against specific tasks.
- `[x]` Build UI: "Export to .xlsx" button on the timesheet page.
- `[x]` Implement the export API endpoint using `worker_threads` to offload file generation.

#### **Background Jobs**

- `[x]` Configure `node-cron` to initialize and run a scheduled job.
- `[x]` Implement the Task Conflict Detection logic (aggregation query, flagging tasks, creating notifications).
- `[x]` Integrate an SMTP service (e.g., SendGrid, Nodemailer).
- `[x]` Implement the email sending logic for critical/high-priority notifications.
- `[x]` **QA Gate:** Test the personal dashboard, to-do linking, timesheet export, and manually trigger/verify the cron job.

---

### Sprint 6: Reporting, Polish & Production Readiness

**Goal:** Finalize the application, add reporting, and prepare for a stable production release.

#### **Dashboards & Reporting**

- `[x]` Build UI: Project Dashboard with progress charts and task status summaries.
- `[x]` Build UI: User Dashboard with workload and performance analytics.
- `[x]` Install and configure a charting library (e.g., Recharts).
- `[x]` Implement the complex MongoDB aggregation queries required for dashboard data.
- `[x]` Integrate aggregation data with the frontend charts.

#### **Final Polish & Review**

- `[x]` Conduct a full UI/UX consistency review across the entire application.
- `[x]` Perform an accessibility (a11y) audit using browser tools and fix high-priority issues.
- `[x]` Test and ensure the application is responsive and usable on key screen sizes (desktop, tablet).

#### **Pre-Production**

- `[x]` Add necessary indexes to MongoDB collections to optimize query performance.
- `[x]` Ensure all API endpoints have robust server-side validation using Zod.
- `[x]` Set up the production hosting environment (Vercel, AWS, etc.).
- `[x]` Configure production environment variables and services.
- `[x]` Create a CI/CD pipeline (e.g., GitHub Actions) for automated testing and deployment.
- `[x]` **Final UAT:** Conduct User Acceptance Testing with a pilot group of internal users.
- `[x]` Address all critical feedback and bugs from UAT.
- `[x]` **Deploy to Production!**

#### **Additional UI Enhancements**

- `[x]` Implement side navigation bar with dynamic navigation based on user roles
- `[x]` Create user profile page
- `[x]` Add logout functionality to the navigation bar
- `[x]` Add user management UI
- `[x]` Add theme changing option in side nav
- `[x]` Implement Projects UI/navigation
- `[x]` Implement My Tasks page
- `[x]` Implement Calendar Page
