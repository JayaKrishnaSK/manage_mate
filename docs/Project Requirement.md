## Project Requirement Document: ManageMate

**Version:** 1.0
**Date:** August 16, 2025
**Author:** Senior Business Analyst
**Status:** Draft

### **1. Introduction**

#### **1.1. Project Overview**

ManageMate is a web-based project management application designed to be used by a single organization. It aims to provide a centralized and collaborative platform for managing multiple projects from initiation to completion. The system will streamline workflows, enhance communication, provide clear visibility into project progress, and facilitate efficient resource allocation.

#### **1.2. Business Need**

The organization currently lacks a unified system for project management, leading to inefficiencies, communication gaps, and a lack of transparency regarding project status and resource workload. ManageMate will address these challenges by offering a comprehensive suite of tools for project planning, execution, monitoring, and reporting, tailored to our internal processes.

#### **1.3. Scope**

This document outlines the requirements for the initial release of ManageMate. The scope includes:

- **Core Functionalities:** Project, module, and task management.
- **User and Access Control:** System-level and project-level role-based access.
- **Collaboration:** Integrated chat, file sharing, and notifications.
- **Time and Task Management:** Individual timesheets and to-do managers.
- **Reporting:** User and project-level dashboards and data exports.

**Out of Scope for Version 1.0:**

- Third-party application integrations (e.g., Git, Slack, Google Calendar).
- Client billing and invoicing features.
- Native mobile applications (iOS/Android).

### **2. User Roles and Permissions**

ManageMate will implement a two-tiered role-based access control (RBAC) model to ensure data security and appropriate access levels.

#### **2.1. System-Level Roles**

These roles are assigned at the application level and are independent of any single project.

- **Admin:**
  - **Permissions:** Possesses the highest level of authority over the application. Can manage all user accounts, create new projects, assign Project Owners and Managers, and access system-wide settings and analytics.
- **User:**
  - **Permissions:** Represents a standard employee account. Can be assigned to multiple projects and will have their project-level access defined by their specific role within each project.

#### **2.2. Project-Level Roles**

These roles are specific to a project and are assigned by an Admin or Project Manager.

- **Owner:**
  - **Permissions:** Has ultimate authority over a specific project. Can perform all the actions of a Manager and has the exclusive right to archive or delete the project.
- **Manager:**
  - **Permissions:** Responsible for the day-to-day management of the project. Can add/remove project members, assign project-level roles, manage guest users, and oversee the creation and management of all modules and tasks.
- **Business Analyst (BA):**
  - **Permissions:** Can create, edit, and manage modules and tasks. Defines priorities, deadlines, and dependencies.
- **Developer:**
  - **Permissions:** Can be assigned to tasks, update task status and log time. Views project artifacts relevant to their assignments.
- **QA (Quality Assurance):**
  - **Permissions:** Can be assigned to testing tasks, update their status, and create tasks of type "Issue."
- **Guest:**
  - **Permissions:** An external or temporary user with restricted access. By default, they have read-only access to the specific project or module they are invited to. A Manager can grant them additional, specific permissions as needed.

### **3. Functional Requirements**

#### **3.1. Project & Module Management**

- **3.1.1. Project Creation Flow:**
  1. The Admin initiates the creation of a new project.
  2. The Admin provides a project name, description, and assigns a Project Owner and at least one Manager.
- **3.1.2. Module Creation and Configuration:**
  1. Within a project, a Manager or BA can create modules.
  2. Each module can be assigned a single **Owner** and multiple **Contributors**. The module Owner has full edit rights over the module and its tasks.
  3. Each module must be designated as either **Waterfall** or **Agile** flow, which will determine the visual representation of its tasks (e.g., a list for Waterfall, a Kanban board for Agile).
- **3.1.3. Hierarchy and Attachments:**
  - A project can contain many modules, and each module can contain many tasks.
  - The ability to attach files and URLs must be available at the Project, Module, and Task levels.

#### **3.2. Task Management**

- **3.2.1. Task Attributes:**
  - **Type:** Each task must be assigned a type (e.g., New Feature, Planning, Designing, Research, Development, Review, Test, Issue, Client-Raised Ticket).
  - **Assignment:** A task can be assigned to a single user.
  - **Priority & Order:** Tasks can be assigned a multi-level priority (e.g., Critical, High, Medium, Low) and an order of execution within a module.
  - **Timelines:** Tasks must have fields for `Estimated Time`, `Actual Time`, `Start Date`, and a `Deadline` (end date).
- **3.2.2. Dependencies and Conflicts:**
  - The system must allow for the creation of dependencies between tasks (e.g., Task B cannot start until Task A is complete).
  - The system shall provide a visual indicator (e.g., a warning icon) if a user is assigned to multiple tasks of "High" or "Critical" priority with overlapping deadlines.
- **3.2.3. Task Scheduling:**
  - The system will support various task schedules:
    - **Scheduled Tasks:** Standard tasks with a defined start and end date.
    - **Event-Based Tasks:** Tasks automatically triggered by a predefined event (e.g., completion of a dependent task).
    - **Routine Tasks:** Tasks that recur at specified intervals (daily, weekly, etc.).

#### **3.3. Collaboration & Communication**

- **3.3.1. Chat Functionality:**
  - A real-time chat interface will be available at the **Module** level for context-specific discussions.
  - At the **Project** level, Managers can create multiple chat **channels** for different topics (e.g., "General," "Frontend," "API"). Users can be added to relevant channels.
  - File sharing must be integrated within the chat interface for both module and project-level chats.
- **3.3.2. Notification System:**
  - **In-App Notifications:** Real-time alerts within the application for standard events (e.g., new task assignment, status change, mentions).
  - **Email Notifications:** Automatically triggered for "Critical" or "High" priority events only, such as an approaching deadline for a critical task.

#### **3.4. User Workspace & Time Management**

- **3.4.1. Personal Dashboard:**
  - Each user will have a personalized dashboard aggregating all their assigned tasks from all projects.
  - This dashboard will include a personal **To-Do Manager** for creating and tracking personal, non-project-related tasks.
- **3.4.2. Timesheet:**
  - Each user will maintain their own timesheet, logging hours against specific tasks.
  - The timesheet must be viewable in both a **Calendar** and **Table** format.
  - The table view will include the columns: Project, Module, Task + Description, Status, Estimated Time, Actual Time, Start Date, and End Date.
  - A feature to export the timesheet to an Excel-compatible format (.xlsx or .csv) is required.

#### **3.5. Reporting and Visualization**

- **3.5.1. Dashboards:**
  - **Project Dashboard:** An overview of the project's health, including module progress, milestone tracking, and a summary of task statuses (To-Do, In Progress, Completed).
  - **User Dashboard:** In addition to the personal workspace, this provides analytics on an individual's workload and performance over time.
- **3.5.2. Visual Charts:**
  - The system will generate **heatmap/timeline charts** to visualize data for a selected user, module, or project, providing insights into workload distribution and progress over time.
