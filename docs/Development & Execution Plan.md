## ManageMate: Phased Development & Execution Plan

### Guiding Principles

- **Foundation First:** We will begin by establishing a robust, well-configured project skeleton. This includes setting up authentication, core services, and database models before building any complex UI.
- **Incremental Feature Development:** Each sprint builds upon the last, delivering a tangible, testable set of features. This allows for continuous feedback and reduces integration risks.
- **Quality Gates:** Each sprint concludes with a dedicated "Pre-Release QA" phase. No feature proceeds without thorough testing, including permissions, functionality, and UI consistency.
- **Component-Driven UI:** We will leverage the power of Shadcn/ui to build a reusable, consistent, and accessible component library from day one.

---

### Sprint 0: The Foundation & Project Bootstrap

**Goal:** To create a fully configured, developer-ready application skeleton. No user-facing features will be built, but the core plumbing will be in place, enabling rapid development in subsequent sprints.

#### **1. Initial Project Setup**

- Initialize a new Next.js project using the App Router.
  - `npx create-next-app@latest --typescript --tailwind --eslint`
- Establish the project structure:
  - `src/app/` (API Routes & Pages)
  - `src/app/(auth)` (Authentication Pages)
  - `src/app/(protected)` (Protected Pages)
  - `src/api` (API Routes)
  - `src/components/` (UI Components: shared, ui)
  - `src/lib/` (Core utilities: db, redis, auth options)
  - `src/models/` (Mongoose Schemas)
  - `src/services/` (Backend business logic modules)
  - `src/hooks/` (Custom React hooks)
  - `src/utils/` (Helper functions)

#### **2. Package Installation & Configuration**

- **Core Backend:**
  - `mongoose`: For MongoDB object modeling.
  - `next-auth`: For authentication.
  - `bcryptjs`: For password hashing.
  - `redis`: For caching and Pub/Sub.
  - `socket.io`: For real-time server.
  - `node-cron`: For scheduled background tasks.
- **Core Frontend:**
  - `@tanstack/react-query` (React Query): For server state management.
  - `zustand`: For lightweight global client state.
  - `socket.io-client`: For real-time client.
  - `shadcn-ui`: Initialize using its CLI, which will set up Radix UI and Tailwind CSS.
  - `lucide-react`: For icons.
  - `react-hook-form` & `zod`: For robust, type-safe form handling and validation.
- **Utilities:** `date-fns` (date handling), `xlsx` (for export).
- **Dev Dependencies:** `husky` & `lint-staged` (for pre-commit hooks to enforce code quality).

#### **3. Core Service & Database Configuration**

- Implement a singleton pattern for MongoDB and Redis connections in `src/lib/`.
- Define all Mongoose schemas as specified in the System Design: `users`, `projects`, `projectMemberships`, `modules`, `tasks`, `notifications`, and `personalTodos`.
- Set up environment variables (`.env.local`) for database credentials, JWT secrets, and other sensitive keys.
- Configure the abstract `StorageService` with the initial `LocalFsProvider`.

#### **Definition of Done for Sprint 0**

- The project can be run locally (`npm run dev`).
- The application successfully connects to the MongoDB and Redis instances.
- All required packages are installed, and basic configurations (ESLint, Prettier, TypeScript) are finalized.
- Pre-commit hooks are active.
- Mongoose schemas are defined and validated.

---

### Sprint 1: User Authentication & System Administration

**Goal:** Implement the complete user lifecycle and the foundational administrative capability to create projects. This sprint focuses on securing the application and creating the top-level containers for all future work.

#### **1. Authentication Flow**

- Configure Next-Auth with a Credentials Provider.
- Build the UI for Login and Registration pages using Shadcn/ui components (`Input`, `Button`, `Card`).
- Implement the backend logic for user registration (hashing passwords) and login.
- Use Next-Auth callbacks to inject the user's `_id` and `systemRole` into the session token.
- Create a global `SessionProvider` to make authentication state available throughout the app.

#### **2. API & Route Protection**

- Implement a middleware (`middleware.ts`) to protect all application routes by default, redirecting unauthenticated users to the login page.
- Create an initial API middleware that checks for a valid session on protected API endpoints.

#### **3. Admin - User Management**

- Create an admin-only page to view a list of all users in the system.
- Implement the logic to enforce `systemRole: 'Admin'` access to this page.

#### **4. Admin - Project Creation**

- Build the UI form for an Admin to create a new project (Name, Description).
- Implement the API endpoint (`POST /api/projects`) that:
  1. Validates the Admin's session.
  2. Creates the `projects` document.
  3. Allows assigning a Project Owner and Manager(s) from a list of existing users.
  4. Creates the corresponding `projectMemberships` documents for the assigned Owner and Manager(s).

#### **Pre-Release QA (Sprint 1)**

- **Testing:** Verify login/logout works. Ensure password hashing is irreversible. Confirm that protected pages are inaccessible without logging in. Test that only Admins can access the user management page and create new projects.

---

### Sprint 2: Project Workspace & Role-Based Access (RBAC)

**Goal:** Empower Project Managers to build out their teams and create the primary organizational units (modules) within a project. The core RBAC logic will be fully implemented in this sprint.

#### **1. Project Dashboard & Membership Management**

- Create a dynamic route for the project dashboard (e.g., `/projects/[projectId]`).
- Build the UI for Project Managers to view, invite, and manage project members and their roles (`BA`, `Developer`, `QA`, `Guest`).
- Implement the API endpoints for adding, updating, and removing users from a project, which will manipulate the `projectMemberships` collection.

#### **2. Advanced RBAC Middleware**

- Enhance the API middleware to perform project-level authorization.
- For any request targeting a specific project resource (e.g., `PATCH /api/projects/[projectId]`), the middleware must:
  1. Verify authentication.
  2. Query the `projectMemberships` collection to find the user's role for that `projectId`.
  3. Authorize or deny the request based on a predefined permission map (e.g., only a `Manager` can add members).

#### **3. Module Management**

- Inside the project dashboard, build the UI for creating and viewing modules.
- The creation form must include fields for `name`, `flowType` ('Waterfall' or 'Agile'), `owner`, and `contributors`.
- Implement the API endpoints for module CRUD, ensuring they are protected by the new RBAC middleware (e.g., only a `Manager` or `BA` can create modules).

#### **Pre-Release QA (Sprint 2)**

- **Testing:** Rigorously test the RBAC rules. Can a `Developer` add another user to the project? (Should fail). Can a `Manager`? (Should succeed). Can a user not on the project access its dashboard? (Should fail). Verify module creation and assignment logic.

---

### Sprint 3: Core Task Management

**Goal:** Deliver the central functionality of the application: creating, viewing, and managing tasks within a module.

#### **1. Task Creation & Details**

- Develop the "Create Task" modal/form with all attributes specified in the PRD (Type, Assignee, Priority, Timelines, etc.).
- Create a "Task Detail View" (modal or side panel) that displays all task information, including attachments and dependencies.

#### **2. Module Views: Waterfall & Agile**

- **Waterfall View:** Implement a clean, sortable list/table view for tasks within a Waterfall module.
- **Agile (Kanban) View:** This is a major UI task.
  - Use a library like **`dnd-kit`** for a modern, accessible drag-and-drop experience.
  - Columns should represent task statuses (To-Do, In Progress, etc.).
  - Dragging a task to a new column should trigger an API call to update its status.

#### **3. Task Dependencies & Conflict Indicators**

- In the Task Detail View, add a UI element to select other tasks as dependencies.
- Implement the API logic to store these relationships.
- The UI should visually represent dependencies (e.g., a link or icon).
- Implement the visual indicator for `hasConflict: true` on the task card/row. The background job will be created later, but the UI part is done here.

#### **Pre-Release QA (Sprint 3)**

- **Testing:** Test task creation with all possible attributes. Verify that the Kanban board's drag-and-drop functionality correctly updates the task status in the database. Test the dependency creation flow.

---

### Sprint 4: Real-Time Collaboration & Communication

**Goal:** Transform the static application into a dynamic, collaborative environment with real-time updates, chat, and notifications.

#### **1. Socket.io & Redis Pub/Sub Integration**

- Set up the Socket.io server and integrate it with the Next.js custom server or API routes.
- Implement the Redis Pub/Sub layer as designed. When an event occurs, the API will publish to Redis. The Socket.io server will subscribe to Redis channels and emit events to the appropriate clients. This ensures scalability.

#### **2. Real-Time In-App Notifications**

- Create the UI for the notification center (e.g., a bell icon with a dropdown).
- When a user is assigned a task, mentioned, etc., the backend will create a `notifications` document and publish an event to a user-specific channel (e.g., `user:userId`).
- The frontend will listen for these events and display real-time notifications.

#### **3. Chat Functionality**

- Build the chat UI for Module-level and Project-level channels.
- Implement the backend logic: on receiving a new message, save it to the database and publish it to the relevant Redis channel (e.g., `chat:moduleId`).
- Clients subscribed to that room will receive and display the message instantly.

#### **4. File Attachments**

- Integrate a file upload component (e.g., using `react-dropzone`).
- Implement the backend API to handle file uploads via the `StorageService`. It will store the file and link its metadata to the corresponding Project, Module, or Task.

#### **Pre-Release QA (Sprint 4)**

- **Testing:** This requires multiple users/browsers. Does a chat message from User A appear instantly for User B? Does User B get a real-time notification when assigned a task by User A? Test file upload/download functionality.

---

### Sprint 5: User Productivity & Automation

**Goal:** Focus on features that enhance individual user productivity and automate background processes.

#### **1. Personal Workspace**

- Build the main user dashboard that aggregates all tasks assigned to the logged-in user across all projects.
- Implement the **Personal To-Do Manager**.
  - Create the dedicated UI component on the dashboard.
  - Build the backend `TodoService` and API endpoints.
  - Crucially, implement the `$lookup` aggregation pipeline on the `GET /api/todos` endpoint to enrich to-dos with context from linked resources (projects, tasks).

#### **2. Timesheet Management**

- Develop the timesheet UI with both Calendar and Table views.
- Implement the logic for users to log time against their assigned tasks.
- Create the **Timesheet Export** feature.
  - This is a perfect use case for `worker_threads`. The API endpoint will spawn a worker to generate the CSV/XLSX file, preventing the main event loop from being blocked. It will return a job ID, and the client can poll for completion.

#### **3. Background Jobs & Email Notifications**

- Set up the `node-cron` scheduler.
- Implement the **Asynchronous Task Conflict Detection** job that runs periodically, performs the aggregation query, flags tasks, and generates notifications for managers.
- Integrate an SMTP service (e.g., SendGrid, Nodemailer) and implement the logic to send email notifications for critical events.

#### **Pre-Release QA (Sprint 5)**

- **Testing:** Verify that the personal dashboard correctly aggregates tasks. Test the full lifecycle of the Personal To-Do manager, including linking. Test the timesheet export. Manually trigger the cron job to verify conflict detection and notification creation. Check email delivery.

---

### Sprint 6: Reporting, Polish & Production Readiness

**Goal:** Finalize the application with high-level reporting features, conduct comprehensive testing, and prepare for deployment.

#### **1. Dashboards & Visualizations**

- Build the Project and User dashboards with the required analytics.
- Integrate a charting library like **Recharts** or **Visx** to create the heatmap/timeline charts and other visualizations.
- Write the complex MongoDB aggregation queries needed to feed data to these charts efficiently.

#### **2. System-Wide Polish**

- **UI/UX Review:** Conduct a full application walkthrough to ensure consistency, fix layout issues, and improve user experience.
- **Accessibility (a11y):** Audit the application for accessibility issues using tools like Lighthouse and Axe.
- **Responsive Design:** Ensure the application is fully usable on various screen sizes.

#### **3. Performance & Security**

- **Performance Optimization:** Implement strategic caching with React Query and Redis. Analyze database query performance and add indexes where necessary.
- **Security Hardening:** Review all API endpoints for proper authorization. Ensure all user input is validated with Zod on the server side. Implement rate limiting if necessary.
