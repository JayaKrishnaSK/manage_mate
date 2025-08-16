## Agentic AI Guidance Protocol: Project ManageMate

**Version:** 1.0
**Objective:** To serve as the complete, step-by-step instruction set for an autonomous AI development agent tasked with building the ManageMate application.

### 1. Directive & Operating Principles

You are the primary development agent for **Project ManageMate**. Your goal is to build and deliver the application as specified in the provided project documents. Adherence to these principles is mandatory for all operations.

**Prime Directives:**

1. **Source of Truth:** The `Project Requirement.md`, `System Design.md`, and `Development & Execution Plan.md` documents are your immutable sources of truth. All implementation details must align with them. The `System Design.md` takes precedence in case of technical conflicts.
2. **State Management:** The `todo.md` file is your state file and task list. You will read it to determine the next task and update it immediately upon task completion by changing `[ ]` to `[x]`. This is your primary method of reporting progress.
3. **Documentation First (The "MCP" Mandate):** Before using any new library or framework feature use **context7** mcp (e.g., Next-Auth callbacks, `dnd-kit` events, React Query mutations), you **must** perform a targeted search for its _latest official documentation_ or trusted community guides. Your implementation must conform to current best practices. State the library and version you are consulting in your internal monologue.
4. **Contextual Awareness:** Maintain full context of the entire project directory. Before modifying a file, read its current content. Before creating a new file, verify it doesn't already exist. Understand how your changes will impact other parts of the application.
5. **Incremental & Verifiable Steps:** Each task in `todo.md` should be treated as an atomic unit of work. After completing each task, you must perform a verification step to ensure the application remains in a functional state.
6. **Code Quality:** All generated code must be clean, well-commented, strongly-typed (TypeScript), and adhere to the configured ESLint and Prettier rules.

### 2. The Core Execution Loop

For every task you undertake, you will follow this precise loop:

1. **Read State:** Parse the `todo.md` file. Identify the first task item with a `[ ]` status. This is your current objective.
2. **Gather Context:**
   - Read the task description.
   - Cross-reference the task with the relevant sections in the `Development & Execution Plan.md`, `System Design.md`, and `Project Requirement.md` documents to understand the _why_ and the _what_.
3. **Formulate a Plan:** In your internal monologue, detail your plan of action.
   - Which files will you create or modify? (Specify exact paths).
   - What specific functions, components, or logic will you implement?
   - What dependencies or imports are needed?
4. **Execute Code Generation:** Write or modify the code according to your plan.
5. **Verify & Self-Correct:**
   - After file modifications, run the linter and type checker (`npm run lint`, `npm run typecheck` or equivalent).
   - Run the development server (`npm run dev`).
   - Check for any compilation errors in the terminal.
   - If the change is verifiable in a browser, formulate a mental "test case" (e.g., "Navigate to `/login`. The new input field should be visible.").
   - If verification fails, analyze the error, re-consult the documentation (Prime Directive #3), and re-execute until the code is correct and the application is stable.
6. **Update State:** Once the task is complete and verified, modify `todo.md` by changing the corresponding `[ ]` to `[x]`.
7. **Loop:** Return to Step 1 to begin the next task.

---

### 3. Granular Task Execution Protocol

You will now begin the project. Execute the following tasks in strict order, following the **Core Execution Loop** for each one.

#### **Sprint 0: The Foundation & Project Bootstrap**

**Objective:** Create a stable, configured project skeleton.

1. **`[ ]` Initialize Next.js project:**
   - Execute the command: `npx create-next-app@latest managemate --typescript --tailwind --eslint --app --src-dir`.
   - Navigate into the `managemate` directory. This is now your root.
2. **`[ ]` Create canonical directory structure:**
   - Execute commands to create the following directories if they don't exist: `src/components/shared`, `src/components/ui`, `src/lib`, `src/models`, `src/services`, `src/hooks`, `src/utils`.
3. **`[ ]` Install backend dependencies:**
   - Execute: `npm install mongoose next-auth bcryptjs redis socket.io node-cron`.
4. **`[ ]` Install frontend dependencies:**
   - Execute: `npm install @tanstack/react-query zustand socket.io-client lucide-react react-hook-form zod @hookform/resolvers`.
5. **`[ ]` Initialize `shadcn-ui`:**
   - Execute: `npx shadcn-ui@latest init`. Accept the defaults.
   - Execute: `npx shadcn-ui@latest add button input card form label toast`.
6. **`[ ]` Install utility & dev dependencies:**
   - Execute: `npm install date-fns xlsx`.
   - Execute: `npm install -D husky lint-staged`.
7. **`[ ]` Configure Husky and lint-staged:**
   - Execute `npx husky init`.
   - Create a pre-commit hook: `npx husky add .husky/pre-commit "npx lint-staged"`.
   - In `package.json`, add the `lint-staged` configuration to run Prettier and ESLint.
8. **`[ ]` Implement MongoDB connection singleton:**
   - Create `src/lib/db.ts`.
   - Implement a cached, singleton connection function as per modern Next.js best practices to avoid multiple connections in a serverless environment.
9. **`[ ]` Implement Redis connection singleton:**
   - Create `src/lib/redis.ts`.
   - Implement a similar singleton pattern for the Redis client.
10. **`[ ]` Define all Mongoose schemas:**
    - For each schema in the `System Design.md` (`users`, `projects`, etc.), create a corresponding file (e.g., `src/models/user.model.ts`).
    - Translate the JSON definition from the System Design document into a Mongoose Schema. Pay close attention to types, references (`ref`), enums, and indexes. Start with `users`. Then `projects`, `projectMemberships`, `modules`, `tasks`, `notifications`, and finally `personalTodos`.
11. **`[ ]` Create and document environment variables:**
    - Create a file named `.env.example`.
    - Add keys for `MONGODB_URI`, `REDIS_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Add placeholder values.
    - Create a `.env.local` file and add real development values.
12. **`[ ]` Implement the abstract `StorageService`:**
    - Create `src/services/storage.service.ts`.
    - Define an abstract class `StorageService` with `upload` and `delete` methods.
    - Create an implementation `LocalFsProvider` that extends `StorageService` and writes files to the local filesystem (`./uploads`).

#### **Sprint 1: User Authentication & System Administration**

**Objective:** Secure the application and build core admin functions.

1. **`[ ]` Configure Next-Auth `[...nextauth]` route:**
   - Create `src/app/api/auth/[...nextauth]/route.ts`. Import `NextAuth` and define your `authOptions`.
   - Configure a `CredentialsProvider` with `email` and `password` fields.
2. **`[ ]` Build UI: Registration page (`/register`):**
   - Create `src/app/register/page.tsx`. Use `Card`, `Input`, `Button`, `Form` components from Shadcn/ui.
   - Use `react-hook-form` and `zod` for client-side form state management and validation.
3. **`[ ]` Implement API: `POST /api/register`:**
   - Create `src/app/api/register/route.ts`. Handle `POST` requests. Read `name`, `email`, `password`.
   - Check if the user already exists. Hash the password using `bcryptjs`. Create a new `User` document with `systemRole: 'User'`.
4. **`[ ]` Implement Next-Auth `authorize` logic:**
   - In `[...nextauth]/route.ts`, implement the `authorize` function. Find user by email, compare hashed password using `bcrypt.compare`, and return the user object (without password) if successful.
5. **`[ ]` Build UI: Login page (`/login`):**
   - Create `src/app/login/page.tsx`. Build the login form.
   - On submit, call the `signIn` function from `next-auth/react` with `'credentials'`.
6. **`[ ]` Configure Next-Auth callbacks:**
   - In `authOptions`, implement `jwt` and `session` callbacks. In the `jwt` callback, add `user._id` and `user.systemRole` to the `token`. In the `session` callback, transfer these properties to `session.user`.
7. **`[ ]` Wrap the root layout in a `SessionProvider`:**
   - Create a client component `src/components/providers/SessionProvider.tsx`.
   - In `src/app/layout.tsx`, wrap the children with this provider.
8. **`[ ]` Create root `middleware.ts`:**
   - Create `src/middleware.ts` at the root of the `src` directory. Use the default export from `next-auth/middleware`.
   - Configure the `matcher` to protect all routes except for `/login` and `/register`.
9. **`[ ]` Build UI: Admin-only user management page:**
   - Create `src/app/admin/users/page.tsx`. Check for `session.user.systemRole === 'Admin'`. If not, render "Access Denied". Otherwise, fetch and display a list of users.
10. **`[ ]` Implement API: `GET /api/users`:**
    - Create `src/app/api/users/route.ts`. Protect this route by checking the session token for `systemRole: 'Admin'`. If authorized, return all users.
11. **`[ ]` Build UI: "Create Project" form/modal for Admins:**
    - On an admin dashboard page (`/admin`), add a "Create Project" button that opens a modal.
    - The form should include Name, Description, and a user selection component to assign Owner and Managers.
12. **`[ ]` Implement API: `POST /api/projects`:**
    - Create `src/app/api/projects/route.ts`. Protect for Admins only.
    - The `POST` handler will create the `projects` document and the initial `projectMemberships` documents for the assigned Owner and Managers.
13. **`[ ]` **QA Gate:** Verify all authentication flows, route protection, and admin permissions.**
    - Mentally simulate: Can a non-logged-in user access `/dashboard`? (No, redirect). Can a regular 'User' access `/admin/users`? (No, access denied). Does creating a project correctly create memberships? (Yes). Mark complete.

#### **Sprint 2: Project Workspace & Role-Based Access (RBAC)**

**Objective:** Enable project setup, team management, and enforce granular permissions.

1. **`[ ]` Build UI: Dynamic project dashboard page:**
   - Create `src/app/projects/[projectId]/page.tsx`. This page will be the main view for a single project.
2. **`[ ]` Build UI: Member management panel:**
   - Within the project dashboard, create a component to manage members. It should display a table of current members and their roles.
   - Include buttons for "Add Member", "Edit Role", and "Remove Member".
3. **`[ ]` Implement API: `GET /api/projects/[projectId]/members`:**
   - Create this route. It will perform a MongoDB aggregation to join `projectMemberships` with the `users` collection to get member details for the given `projectId`.
4. **`[ ]` Implement API: `POST /api/projects/[projectId]/members`:**
   - This route adds a `userId` to a project by creating a new `projectMemberships` document with a default role (e.g., 'Guest').
5. **`[ ]` Implement API: `PATCH /api/projects/[projectId]/members/[membershipId]`:**
   - This route updates the `role` field in a specific `projectMemberships` document.
6. **`[ ]` Implement API: `DELETE /api/projects/[projectId]/members/[membershipId]`:**
   - This route deletes a `projectMemberships` document.
7. **`[ ]` Create a reusable server-side function/middleware for project-level RBAC:**
   - Create a utility function, e.g., `src/lib/auth/utils.ts`, called `hasProjectPermission(userId, projectId, requiredRole)`. This function will query the `projectMemberships` collection and return true or false.
8. **`[ ]` Define a permission map:**
   - Create a constant object, e.g., `src/lib/permissions.ts`, that maps roles to allowed actions (e.g., `Manager: ['addMember', 'createModule']`).
9. **`[ ]` Integrate this RBAC check into all project-specific API endpoints:**
   - At the beginning of each API route handler from this sprint, call your new permission checking utility to authorize the action.
10. **`[ ]` Build UI: "Create Module" form:**
    - Inside the project dashboard, add a button to open a form for creating a new module (Name, flowType, Owner, Contributors).
11. **`[ ]` Build UI: List/display of modules:**
    - On the project dashboard, display the list of modules belonging to the project.
12. **`[ ]` Implement API: CRUD endpoints for modules:**
    - Create `src/app/api/projects/[projectId]/modules/route.ts` for creating and listing modules.
    - Create `src/app/api/modules/[moduleId]/route.ts` for updating and deleting specific modules. Apply RBAC checks.
13. **`[ ]` **QA Gate:** Rigorously test all project-level roles.**
    - Mental simulation: Log in as a 'Developer'. Attempt to access the member management panel (should be hidden/disabled). Attempt to call the 'add member' API directly (should fail with 403 Forbidden). Mark complete.

#### **Sprint 3: Core Task Management**

**Objective:** Deliver the application's central feature: creating, viewing, and managing tasks.

1. **`[ ]` Build UI: "Create Task" form:**
   - Create a reusable task form component using Shadcn/ui and `react-hook-form`. It must include all fields from the PRD: Type, Assignee, Priority, Dates, etc.
2. **`[ ]` Build UI: Task Detail View:**
   - Create a modal or side panel component that displays all information for a single task.
3. **`[ ]` Implement API: `POST /api/modules/[moduleId]/tasks`:**
   - Create a route to add a new task to a module.
4. **`[ ]` Implement API: `GET /api/tasks/[taskId]`:**
   - Create a route to fetch details for a single task.
5. **`[ ]` Implement API: `PATCH /api/tasks/[taskId]`:**
   - Create a route to update any attribute of a task.
6. **`[ ]` Implement API: `DELETE /api/tasks/[taskId]`:**
   - Create a route to delete a task.
7. **`[ ]` Implement UI: Waterfall view:**
   - Within a module view page, if `flowType` is 'Waterfall', render tasks in a sortable table (e.g., using `@tanstack/react-table`).
8. **`[ ]` Implement UI: Agile (Kanban) board view:**
   - If `flowType` is 'Agile', render a Kanban board with columns representing task statuses.
9. **`[ ]` Install and configure `dnd-kit`:**
   - Execute `npm install @dnd-kit/core @dnd-kit/sortable`.
   - Wrap your Kanban board components with the necessary `DndContext` and providers.
10. **`[ ]` Connect the "onDragEnd" event to the `PATCH` API:**
    - Implement the `handleDragEnd` function. When a task is dropped into a new column, extract its ID and the new status. Trigger a call to `PATCH /api/tasks/[taskId]` to update the status in the database.
11. **`[ ]` Implement UI for selecting and displaying task dependencies:**
    - In the Task Detail View, add a component that allows searching for and selecting other tasks within the project to mark as dependencies.
12. **`[ ]` Update `task` schema and API to store dependency relationships:**
    - Add a `dependencies: [{ type: ObjectId, ref: 'Task' }]` array to the `tasks` schema. Update the PATCH API to handle adding/removing dependencies.
13. **`[ ]` Add a visual indicator for `hasConflict`:**
    - In the task card/row component, add a conditional UI element (e.g., a red warning icon) that is displayed only when `task.hasConflict` is `true`.
14. **`[ ]` **QA Gate:** Test the entire task lifecycle, both module views, and drag-and-drop.**
    - Verify that creating a task works, updating it works, and dragging it on the Kanban board correctly persists the new status.

#### **Sprint 4: Real-Time Collaboration & Communication**

**Objective:** Make the application dynamic with live updates, chat, and notifications.

1. **`[ ]` Set up the Socket.io server:**
   - Create a custom server file or a new API route to initialize and run the Socket.io server instance.
2. **`[ ]` Create a utility service to publish events to Redis:**
   - In `src/lib/redis.ts`, create a `publish` function that takes a channel and a payload.
3. **`[ ]` Configure the Socket.io server to subscribe to Redis channels:**
   - When the Socket.io server starts, create a subscriber Redis client. Use it to subscribe to relevant channels (e.g., `chat:*`, `notifications:*`). On receiving a message, emit it to the appropriate client room.
4. **`[ ]` Build UI: Notification Center:**
   - Create a component with a bell icon. When clicked, it opens a dropdown that lists notifications for the user.
5. **`[ ]` Connect frontend `socket.io-client` to listen for real-time notification events:**
   - In a global layout component, initialize the socket client and listen for events on a user-specific channel (e.g., `user:userId`). On receiving a notification, update the UI state.
6. **`[ ]` Update backend services to create `notification` docs and publish events:**
   - In the task assignment logic (e.g., `PATCH /api/tasks/[taskId]`), when an `assigneeId` is added or changed, create a new `notifications` document and publish the notification to Redis.
7. **`[ ]` Build UI: Chat interface:**
   - Create a chat component with a message display area, a text input, and a send button.
8. **`[ ]` Implement API: `POST /api/chat/messages`:**
   - This route will save a new chat message to a `chatMessages` collection (you may need to create this schema) and then publish it to the relevant Redis channel (e.g., `chat:moduleId`).
9. **`[ ]` Build UI: File upload component:**
   - Create a component using `react-dropzone` that allows users to drag-and-drop or select files for upload.
10. **`[ ]` Implement API: Endpoint to handle file uploads:**
    - Create an API route that accepts `multipart/form-data`. Use the `StorageService` to save the file. Create a corresponding metadata document and link it to the project/module/task.
11. **`[ ]` Update UIs to display and allow downloading of attached files.**
12. **`[ ]` **QA Gate:** Test all real-time features with multiple concurrent users/browsers.**
    - Mental simulation: User A assigns a task to User B. Does User B see a notification instantly? User A posts a chat message. Does User B see it instantly?

#### **Sprint 5: User Productivity & Automation**

**Objective:** Enhance individual workflows and automate background system processes.

1. **`[ ]` Build UI: Main user dashboard ("My Tasks"):**
   - Create `/dashboard/page.tsx`. This page will fetch and display a list of all tasks where `assigneeId` is the current user's ID.
2. **`[ ]` Build UI: Personal To-Do Manager component:**
   - On the dashboard, create a dedicated component for the personal to-do list with an input field to add new to-dos and a list of existing ones.
3. **`[ ]` Implement `TodoService` and CRUD API endpoints:**
   - Create `src/services/todo.service.ts` for business logic. Create `src/app/api/todos/route.ts` and `.../[todoId]/route.ts` for full CRUD functionality, ensuring all queries are scoped to the logged-in user.
4. **`[ ]` Implement the MongoDB aggregation pipeline with `$lookup` for `GET /api/todos`:**
   - In the `GET` handler for `/api/todos`, use an aggregation pipeline. Based on the `linkedResourceType`, perform a `$lookup` to the correct collection to enrich the to-do item with the name/title of the linked resource.
5. **`[ ]` Build UI: Timesheet page:**
   - Create `/timesheet/page.tsx`. Include UI controls (e.g., tabs) to switch between a Calendar view and a Table view.
6. **`[ ]` Implement API for logging time against tasks:**
   - Create a new schema for `timeLogs`. Create an API endpoint (`POST /api/timelogs`) that allows a user to submit hours against a specific `taskId`.
7. **`[ ]` Build UI: "Export to .xlsx" button:**
   - On the timesheet page, add an export button.
8. **`[ ]` Implement the export API endpoint using `worker_threads`:**
   - Create an API route for exports. When called, it should spawn a worker thread, passing it the user ID. The worker will fetch the data, generate an XLSX file using the `xlsx` library, and save it. The API returns a job ID for polling.
9. **`[ ]` Configure `node-cron`:**
   - Create a file, e.g., `src/lib/cron.ts`, to define and schedule your cron jobs. Ensure this is initialized with the server.
10. **`[ ]` Implement the Task Conflict Detection logic:**
    - Write the complex MongoDB aggregation query as described in the System Design. The job will find overlapping high/critical priority tasks, update their `hasConflict` flag to `true`, and create notifications.
11. **`[ ]` Integrate an SMTP service:**
    - Execute `npm install nodemailer`. Configure it with an SMTP provider's credentials.
12. **`[ ]` Implement email sending logic:**
    - Create a background job that checks for critical notifications and sends emails.
13. **`[ ]` **QA Gate:** Test the personal dashboard, to-do linking, timesheet export, and manually trigger/verify the cron job.**

#### **Sprint 6: Reporting, Polish & Production Readiness**

**Objective:** Finalize the application, add reporting, and prepare for deployment.

1. **`[ ]` Build UI: Project Dashboard with charts:**
   - On `/projects/[projectId]`, add a section for analytics.
2. **`[ ]` Build UI: User Dashboard with analytics.**
   - On a user's profile page or `/dashboard`, add charts for their workload.
3. **`[ ]` Install and configure a charting library:**
   - Execute `npm install recharts`.
4. **`[ ]` Implement complex MongoDB aggregation queries for dashboards:**
   - Create new API endpoints (e.g., `/api/reports/project-summary/[projectId]`) that run aggregations to count tasks by status, calculate total time logged, etc.
5. **`[ ]` Integrate aggregation data with frontend charts.**
6. **`[ ]` Conduct a full UI/UX consistency review.**
   - Systematically navigate the entire application. Ensure consistent use of components, spacing, and terminology. Fix any inconsistencies.
7. **`[ ]` Perform an accessibility (a11y) audit.**
   - Use browser developer tools (Lighthouse) to audit key pages. Fix issues like missing alt tags, improper aria labels, and low contrast ratios.
8. **`[ ]` Test and ensure the application is responsive.**
   - Resize the browser window to mobile and tablet sizes. Fix any layout issues.
9. **`[ ]` Add necessary indexes to MongoDB collections:**
   - Review all common query patterns (e.g., finding memberships by `userId` and `projectId`). Add indexes in your Mongoose schemas to optimize these queries.
10. **`[ ]` Ensure all API endpoints have robust server-side validation using Zod:**
    - Create Zod schemas for the request bodies of all `POST` and `PATCH` endpoints. Parse and validate the incoming data before processing.
11. **`[ ]` Set up the production hosting environment.** (Simulated)
12. **`[ ]` Configure production environment variables and services.** (Simulated)
13. **`[ ]` Create a CI/CD pipeline.** (Simulated)
14. **`[ ]` **Final UAT:** Conduct User Acceptance Testing.** (Simulated)
15. **`[ ]` Address all critical feedback and bugs from UAT.** (Simulated)
16. **`[ ]` **Deploy to Production!** (Simulated - Final task)**
