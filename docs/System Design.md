## System Design Document: ManageMate v1.0

**Version:** 2.0
**Date:** August 16, 2025
**Author:** Senior System Designer
**Status:** Final

### 1. Overview

This document outlines the system architecture for the ManageMate project management application. The design is based on the provided PRD and subsequent clarifications. The architecture is a modular monolith built on Next.js, leveraging MongoDB for data persistence, Redis for caching and messaging, and Next-Auth for streamlined authentication. The system is designed to be robust, maintainable, and provide a real-time collaborative experience, complete with a personalized workspace that includes a private to-do manager.

### 2. High-Level Architecture

The system will be built as a full-stack Next.js application. The backend (API Routes) will house the core business logic, connecting to MongoDB for primary data storage and Redis for caching and real-time message brokering. Real-time communication with the client will be handled by Socket.io, backed by Redis Pub/Sub to ensure messages are broadcast correctly across the system.

#### Architecture Diagram

```mermaid
graph TD
    subgraph "User's Browser"
        A[Next.js Frontend - React/Shadcn]
    end

    subgraph "Server Infrastructure (e.g., Vercel, AWS, Docker)"
        B[Next.js Backend - API Routes]
        C[Socket.io Server]
        D[Job Scheduler - node-cron]
        E[Worker Threads Pool]

        subgraph "Core Services (Modular)"
            F[Authentication Service Next-Auth]
            G[Project/Task Service]
            H[Notification Service]
            I[File Storage Service]
            J[Audit Log Service]
            K[Chat Service]
            L[Todo Service]
        end
    end

    subgraph "Data & External Services"
        L[MongoDB Database]
        M[Redis - Caching & Pub/Sub]
        N[SMTP Service - e.g., SendGrid]
        O[Local Filesystem / S3 Bucket]
    end

    A -- HTTP/S Requests --> B
    A -- WebSocket Connection --> C

    B -- Session/JWT Mgmt --> F
    B -- Business Logic --> G, K & L
    B -- Caching --> M
    B -- File Metadata --> I

    C -- Real-time Events --> A
    C -- Pub/Sub --> M

    D -- Triggers Conflict Detection --> G
    D -- Triggers Notifications --> H
    E -- Processes Heavy Tasks (e.g., Export) for --> B

    G -- CRUD Ops --> L
    F -- User Data --> L
    H -- Notification Data --> L
    J -- Logs --> L
    K -- Message Data --> L
    L -- CRUD Ops --> L

    H -- Sends Email --> N
    I -- Stores/Retrieves Files --> O

    G -- Publishes Events --> M
    K -- Publishes Messages --> M
    H -- Subscribes to Events --> M
```

### 3. Component Breakdown

#### 3.1. Frontend

- **Framework:** Next.js (App Router) with React.
- **Language:** TypeScript.
- **UI:** [Shadcn/ui](https://ui.shadcn.com/) with a monochrome design theme, built on top of Tailwind CSS for a clean, modern, and accessible user interface.
- **State Management:**
  - **Server State:** React Query (or SWR) for efficient data fetching, caching, and synchronization with the backend.
  - **Client State:** Zustand managing global UI state (e.g., open sidebars, notification counts).
- **Real-time:** The `socket.io-client` library will connect to the backend server to receive live updates for notifications, chat messages, and task status changes.
- **Key Features:**
  - The **Personal Dashboard** will feature a dedicated "To-Do Manager" component for creating, viewing, and managing personal tasks. This component will include functionality to link items to projects, modules, or tasks.

#### 3.2. Backend

- **Framework:** Next.js API Routes.
- **Language:** TypeScript.
- **Authentication:** **Next-Auth.js** will be used to handle authentication. It will be configured with a Credentials Provider for email/password login and will manage JWT-based sessions, simplifying security implementation.
- **API Style:** A RESTful API will be exposed. Middleware will be used extensively for authentication, authorization (RBAC), and input validation.

#### 3.3. Database

- **System:** MongoDB.
- **Rationale:** Its document model is perfectly suited for the nested structure of Projects -> Modules -> Tasks. It provides the flexibility needed for features like custom fields (in the future) and powerful aggregation capabilities for reporting and dashboards.

#### 3.4. Caching & Messaging Layer

- **System:** Redis.
- **Usage:**
  - **Caching:** To reduce database load and improve response times. Frequently accessed and slowly changing data, such as user profiles, project configurations, and permissions, will be cached. A cache-aside pattern will be implemented.
  - **Pub/Sub:** To facilitate real-time communication in a decoupled manner. When an event occurs (e.g., a new chat message), the server instance that received the request will publish it to a Redis channel. All other server instances subscribe to this channel and will forward the message to their connected clients via Socket.io. This is essential for a scalable real-time architecture.

#### 3.5. Background Processing

- **Job Scheduler (`node-cron`):** A scheduler will run within the Node.js process to trigger periodic tasks.
  - **Primary Use Case:** Initiating the asynchronous task conflict detection process and scanning for upcoming deadlines to queue email notifications.
- **Worker Threads (`worker_threads`):** For offloading CPU-intensive operations from the main event loop.
  - **Primary Use Case:** Generating and exporting user timesheets to `.xlsx` or `.csv` formats without blocking API responses.

### 4. Data Model (MongoDB Schema)

- **`users`**

  ```json
  {
    "_id": "ObjectId",
    "name": "String",
    "email": "String (unique)",
    "password": "String (hashed)",
    "systemRole": "Enum['Admin', 'User']",
    "createdAt": "Date"
  }
  ```

  _(Note: Next-Auth will also create its own collections like `accounts`, `sessions` to manage OAuth and session data)._

- **`projects`**

  ```json
  {
    "_id": "ObjectId",
    "name": "String",
    "description": "String",
    "ownerId": "ObjectId (ref: users)",
    "status": "Enum['Active', 'Archived']", // For soft-deletion
    "createdAt": "Date"
  }
  ```

- **`projectMemberships`** (The source of truth for project-level permissions)

  ```json
  {
    "_id": "ObjectId",
    "projectId": "ObjectId (ref: projects)",
    "userId": "ObjectId (ref: users)",
    "role": "Enum['Manager', 'BA', 'Developer', 'QA', 'Guest']"
  }
  ```

- **`modules`**

  ```json
  {
    "_id": "ObjectId",
    "name": "String",
    "projectId": "ObjectId (ref: projects)",
    "flowType": "Enum['Waterfall', 'Agile']",
    "ownerId": "ObjectId (ref: users)", // For display and assignment purposes
    "contributorIds": ["ObjectId (ref: users)"] // For display and assignment
  }
  ```

- **`tasks`**

  ```json
  {
    "_id": "ObjectId",
    "title": "String",
    "moduleId": "ObjectId (ref: modules)",
    "assigneeId": "ObjectId (ref: users)",
    // ... other fields as per PRD
    "priority": "Enum['Critical', 'High', 'Medium', 'Low']",
    "startDate": "Date",
    "deadline": "Date",
    "hasConflict": "Boolean (default: false)" // Flag for UI indicator
  }
  ```

- **`notifications`**

  ```json
  {
    "_id": "ObjectId",
    "recipientId": "ObjectId (ref: users)",
    "message": "String",
    "type": "Enum['TaskAssigned', 'StatusUpdate', 'ConflictDetected']",
    "isRead": "Boolean (default: false)",
    "link": "String", // URL to the relevant task/module
    "createdAt": "Date"
  }
  ```

- **`personalTodos` (New Collection)**
  This collection stores to-do items private to each user. It uses a polymorphic association to link to other resources within the application.
  ```json
  {
    "_id": "ObjectId",
    "userId": "ObjectId (ref: users, indexed)",
    "content": "String",
    "isCompleted": "Boolean (default: false)",
    "completedAt": "Date (nullable)",
    "linkedResourceType": "Enum['Project', 'Module', 'Task', null]",
    "linkedResourceId": "ObjectId (nullable)",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
  ```

### 5. Key Feature Implementation Details

#### 5.1. Authentication with Next-Auth

Next-Auth will handle the entire authentication lifecycle. The `[...nextauth]` API route will be configured with a Credentials Provider. On successful login, Next-Auth creates a session and provides a JWT that is automatically managed. A server-side hook (`callbacks`) will be used to add the user's `_id` and `systemRole` from our `users` collection to the session object, making it available throughout the application.

#### 5.2. Role-Based Access Control (RBAC)

A custom API middleware will protect endpoints.

1. The Next-Auth session is checked to ensure the user is authenticated.
2. The middleware extracts the `projectId` or `moduleId` from the request parameters.
3. It queries the `projectMemberships` collection (with caching) to retrieve the user's role for that specific project.
4. **Special Logic for Guests:**
   - If the user's role is `Guest`, access is denied by default.
   - For actions on a specific task (e.g., `PATCH /api/tasks/:id`), an additional check is performed: the action is only allowed if the `assigneeId` on the task matches the guest's `userId`. This grants guests the required granular control over their assigned tasks only.
5. For other roles, the middleware checks a predefined permission map (e.g., `{'BA': ['createTask', 'editTask']}`) to authorize or deny the request.

#### 5.3. Asynchronous Task Conflict Detection

This process will run in the background to avoid impacting user-facing performance.

1. **Trigger:** A `node-cron` job runs periodically (e.g., every 30 minutes).
2. **Execution:** The job executes a complex MongoDB aggregation query to find users who have more than one task with `priority` of 'High' or 'Critical' where the `startDate` and `deadline` ranges overlap.
3. **Action:** For each detected conflict, the system:
   - Sets the `hasConflict: true` flag on the conflicting tasks.
   - Creates a `notification` in the database for the relevant Project Manager(s).
   - Publishes a `conflict.detected` event to a Redis channel, which pushes a real-time notification to the Manager's UI via Socket.io.

#### 5.4. File Storage Service (Abstracted)

An abstract `StorageService` class will define a contract (`upload`, `delete`). The initial implementation will use the server's local filesystem (`LocalFsProvider`). This design allows for a seamless future transition to a cloud-based solution like AWS S3 by simply creating an `S3Provider` and updating the service injector, with no changes to the business logic.

#### 5.5. Real-Time Notification & Chat Service

This service will be heavily reliant on Redis Pub/Sub.

1. A user action (e.g., posting a message) triggers an API call.
2. The backend API route saves the message to MongoDB.
3. It then publishes the message payload to a specific Redis channel (e.g., `chat:module-id-123`).
4. All running instances of the application are subscribed to this channel. They receive the message from Redis.
5. Each instance then uses its Socket.io server to emit the message to the specific clients connected to that module's chat room. This ensures all users receive the message instantly, regardless of which server instance they are connected to.

#### 5.6. Personal To-Do Manager

This feature provides each user with a private task list integrated into their personal dashboard.

- **Backend (`TodoService`):** A new service will be created to handle the business logic for personal to-dos. All operations will be strictly scoped to the authenticated user making the request.
- **API Logic:**
  - **Creation (`POST /api/todos`):** The endpoint will accept `content` and optional `linkedResourceType` and `linkedResourceId` fields.
  - **Retrieval (`GET /api/todos`):** This is a key endpoint. To provide context without requiring multiple frontend requests, the API will use a MongoDB aggregation pipeline with `$lookup`. It will conditionally join with the `projects`, `modules`, or `tasks` collection based on the `linkedResourceType` to fetch the name/title of the linked item.
  - **Example API Response for a linked to-do:**
    ```json
    {
      "_id": "...",
      "userId": "...",
      "content": "Follow up on the login page design",
      "isCompleted": false,
      "linkedResourceType": "Task",
      "linkedResourceId": "...",
      "linkedResource": {
        "title": "FE-101: Design Login Page",
        "url": "/projects/proj-abc/modules/mod-def/tasks/task-123"
      }
    }
    ```
- **Frontend Implementation:**
  - The UI will provide a simple text input for creating to-dos.
  - An "Add Link" button will open a modal where the user can search for and select a project, module, or task to associate with the to-do.
  - When a to-do with a `linkedResource` is displayed, it will render as a clickable badge or link, allowing the user to navigate directly to that item for context.
