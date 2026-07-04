# SprintNest – Smart Team Workspace

SprintNest is a modern, collaborative team workspace and project management platform built to optimize team productivity, track tasks, and investigate system incidents in real time. It implements an isolated backend structure paired with a glassmorphic React frontend.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Features Implemented](#-features-implemented)
3. [Setup Instructions](#-setup-instructions)
4. [Environment Variables Required](#-environment-variables-required)
5. [Assumptions Made During Implementation](#-assumptions-made-during-implementation)
6. [Known Limitations](#-known-limitations)

---

## 🔍 Project Overview
SprintNest is designed to solve common team collaboration and software development management problems. It offers a structured way to handle sprints, tasks, and real-time incident report tracking. Unlike generic task managers, SprintNest integrates:
*   **A strict task dependency model** (e.g., tasks cannot be marked complete if they have unresolved blocking dependencies).
*   **Incident Investigation timelines** where bugs or outages are systematically analyzed (Draft -> Submitted -> Approved -> Closed) with manager controls.
*   **Live updates** across the workspace utilizing socket-driven event triggers.

---

## ✨ Features Implemented

### 🛡️ Authentication & RBAC
*   Role-Based Access Control (RBAC) with predefined roles: **Admin**, **Manager**, and **Developer**.
*   JWT token-based authentication with automatic refresh rotation and storage client-side.
*   Route protection guards preventing unauthenticated access.

### 📊 Dashboard & Metrics
*   Real-time analytics showcasing Active Projects, Tasks count, and active Outage Logs.
*   Interactive progress charts plotting weekly completions, workflow status distribution, and top developer workloads via **Recharts**.
*   Recent activity feed tracking user actions within the workspace.

### 📂 Projects & Tasks Board
*   **Kanban Board & List Views** representing task progression (Todo, In Progress, In Review, Completed).
*   **Task Details & Checklist:** Subtask list, document attachments (via Multer), and a conversation section with email-pattern notifications.
*   **Task Dependencies:** Ability to block tasks by other tasks and check warning cues if blockers are outstanding.

### 🚨 Incident Investigation Module
*   Timeline builder tracking incident events, root cause details, resolution status, and prevention measures.
*   Ability to add custom dynamic sections.
*   State control: Reports go through a formal workflow (Draft -> Submitted -> Approved -> Closed). Only managers/admins can submit, approve, and close incidents.

### 📈 Exporter
*   Instant CSV generation compiling tasks status and workloads for project planning.

---

## 🛠️ Setup Instructions

### Prerequisites
*   **Node.js** (v18 or higher)
*   **npm** or **yarn**
*   **PostgreSQL** (running locally or via docker-compose)

### Database Setup
1. Enter the backend workspace:
   ```bash
   cd backend
   ```
2. Set up your `.env` file (see [Environment Variables Required](#-environment-variables-required)).
3. Run migrations and seed database roles/users:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

### Running Backend
```bash
npm run start:dev
```
The NestJS API service will boot on `http://localhost:3001`.

### Running Frontend
1. Open a new terminal in the project root:
   ```bash
   cd frontend
   ```
2. Build or start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables Required

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory with the following variables:
```env
# Database connection URI
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sprintnest?schema=public"

# Secret key used for JWT signing and verification
JWT_SECRET="sprintnest-super-secret-jwt-key"

# Port number for the backend NestJS service
PORT=3001
```

---

## 💡 Assumptions Made During Implementation
1.  **Local Development Isolation**: File uploads (attachments) are stored inside local static folders (`backend/uploads/`) instead of AWS S3 to ensure standard offline local setups.
2.  **Role Heirarchy**:
    *   *Managers* and *Admins* have permission to create projects, assign workloads, and approve/close incident reports.
    *   *Developers* can assign themselves to tasks, add comments, build subtasks, upload attachments, and log incident drafts.
3.  **Single Monolith Database**: Both modules utilize a unified PostgreSQL schema with modular code separation inside NestJS to simplify schema operations.

---

## ⚠️ Known Limitations
1.  **Local Static Storage**: Attachments uploaded locally will not persist across clean container environments without mount points.
2.  **Strict Token Lifetimes**: Access tokens expire in 15 minutes; while automatic refreshing is implemented, highly active networks might see brief delays during rotation.
3.  **Basic Dependency Tree**: The system checks single-level blocking task dependencies; nested recursive dependency loop prevention is left to user configuration.
