# SprintNest – Smart Team Workspace

SprintNest is a modern, full-stack collaborative team workspace and project management platform built to optimize team productivity, track tasks, and investigate system incidents in real time. It features a **NestJS** (Node.js) REST API backend paired with a **React + Vite** glassmorphic frontend, backed by a **PostgreSQL** database.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Features Implemented](#-features-implemented)
4. [Prerequisites](#-prerequisites)
5. [Running from ZIP (Quick Start)](#-running-from-zip-quick-start)
6. [Step-by-Step Setup](#-step-by-step-setup)
7. [Environment Variables](#-environment-variables)
8. [Default Login Credentials](#-default-login-credentials)
9. [Project Structure](#-project-structure)
10. [Assumptions & Design Decisions](#-assumptions--design-decisions)
11. [Known Limitations](#-known-limitations)

---

## 🔍 Project Overview

SprintNest is designed to solve common team collaboration and software development management problems. It offers a structured way to handle sprints, tasks, and real-time incident report tracking. Unlike generic task managers, SprintNest integrates:

- **A strict task dependency model** — tasks cannot be marked complete if they have unresolved blocking dependencies.
- **Incident Investigation timelines** — bugs or outages are systematically analyzed through a formal workflow: `Draft → Submitted → Approved → Closed`.
- **Live updates** — real-time notifications across the workspace via WebSockets (Socket.io).
- **Role-Based Access Control** — distinct permissions for Admins, Managers, and Developers.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS (Node.js), TypeScript |
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS |
| **Database** | PostgreSQL 15+ (via Docker) |
| **ORM** | Prisma |
| **Auth** | JWT (Access + Refresh tokens) |
| **Real-time** | WebSockets via Socket.io |
| **File Uploads** | Multer (local disk storage) |
| **Charts** | Recharts |

---

## ✨ Features Implemented

### 🛡️ Authentication & RBAC
- Role-Based Access Control with predefined roles: **Admin**, **Manager**, and **Developer**
- JWT token-based authentication with automatic refresh rotation
- Route protection guards preventing unauthenticated access

### 📊 Dashboard & Metrics
- Real-time analytics: Active Projects, Task counts, Active Incidents
- Interactive charts: weekly completions, workflow status distribution, top developer workloads (Recharts)
- Recent activity feed powered by WebSocket events

### 📂 Projects & Tasks Board
- **Kanban Board & List Views** — task progression: Todo → In Progress → In Review → Done
- **Task Details:** Subtask checklists, document attachments (Multer), comments/notifications
- **Task Dependencies:** Block tasks by other tasks with visual warning cues

### 🚨 Incident Investigation Module
- Timeline builder tracking incident events, root cause, resolution, and prevention
- Custom dynamic sections per incident report
- Formal state workflow: `Draft → Submitted → Approved → Closed` (Manager/Admin controlled)

### 📈 Reports & Export
- Instant CSV generation for task status and developer workload reports

---

## ✅ Prerequisites

Before running the project, install the following on your machine:

### 1. Node.js v20+
Download from **[nodejs.org](https://nodejs.org)** — choose the **LTS (v20 or v22)** version.

Verify installation:
```bash
node --version   # should print v20.x.x or higher
npm --version    # should print 10.x.x or higher
```

### 2. Docker Desktop *(for PostgreSQL database)*
Download from **[docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)**

> **Why Docker?** SprintNest uses PostgreSQL as its database. Docker runs PostgreSQL in an isolated container — no manual PostgreSQL installation needed.

Verify Docker is running:
```bash
docker --version        # e.g. Docker version 27.x.x
docker compose version  # e.g. Docker Compose version v2.x.x
```

> ⚠️ **Make sure Docker Desktop is open and running** before proceeding to the database step.

---

## 🚀 Running from ZIP (Quick Start)

### 1. Download & Extract
1. Go to the GitHub repository
2. Click **Code** → **Download ZIP**
3. Extract the ZIP to any folder, e.g. `C:\Projects\TeamFlow-SprintNest\`

### 2. Create the Backend Environment File
Inside the extracted folder, navigate to `backend/` and create a file named **`.env`**:

```
backend/
└── .env    ← create this file
```

Paste the following contents into `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sprintnest?schema=public"
JWT_SECRET="sprintnest_jwt_secret_key_123!"
JWT_REFRESH_SECRET="sprintnest_jwt_refresh_secret_key_456!"
PORT=3001
```

### 3. Start the PostgreSQL Database (Docker)
Open a terminal in the **root** of the extracted folder and run:
```bash
docker compose up -d
```

This downloads and starts a PostgreSQL 15 container on port `5432`.

Verify it's running:
```bash
docker ps
# You should see a container named "sprintnest-db" or similar
```

### 4. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 5. Set Up the Database (First Time Only)
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```
This creates all database tables and seeds default roles and users.

### 6. Run the Application

Open **two separate terminals**:

**Terminal 1 — Backend API:**
```bash
cd backend
npm run start:dev
```
> ✅ API is ready at: `http://localhost:3001/api`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
> ✅ App is ready at: `http://localhost:5173`

**OR** run both with a single command from the root:
```bash
# From the root folder (install root deps first)
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create `backend/.env` with the following variables:

```env
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sprintnest?schema=public"

# JWT signing secrets — use strong random strings in production
JWT_SECRET="sprintnest_jwt_secret_key_123!"
JWT_REFRESH_SECRET="sprintnest_jwt_refresh_secret_key_456!"

# Port for the NestJS backend (default: 3001)
PORT=3001
```

> 🔒 **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 👤 Default Login Credentials

After running `npx prisma db seed`, the following accounts are created:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@sprintnest.com` | `password123` |
| **Manager** | `manager@sprintnest.com` | `password123` |
| **Developer** | `developer@sprintnest.com` | `password123` |

---

## 📁 Project Structure

```
TeamFlow-SprintNest/
├── backend/                  # NestJS REST API
│   ├── src/
│   │   ├── modules/          # Feature modules (auth, projects, tasks, incidents...)
│   │   ├── common/           # Guards, filters, decorators, middleware
│   │   └── main.ts           # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # SQL migration history
│   │   └── seed.ts           # Database seeder
│   ├── uploads/              # Local file upload storage
│   └── package.json
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Dashboard, Projects, Tasks, Incidents, Reports, Settings
│   │   ├── components/       # Sidebar, Header
│   │   ├── context/          # AuthContext
│   │   └── utils/            # API client
│   └── package.json
├── docker-compose.yml        # PostgreSQL container configuration
├── railway.json              # Railway deployment config
├── nixpacks.toml             # Nixpacks build config (Node 20)
└── README.md
```

---

## 💡 Assumptions & Design Decisions

1. **Local File Storage** — File uploads are stored in `backend/uploads/` (local disk). No cloud storage (AWS S3) is required for local development.
2. **Role Hierarchy:**
   - *Admins & Managers* — create projects, assign workloads, approve/close incidents
   - *Developers* — create tasks, add comments, upload attachments, draft incident reports
3. **Single Unified Database** — All modules share one PostgreSQL schema with modular NestJS separation.
4. **Docker for PostgreSQL** — PostgreSQL runs via Docker Compose to avoid requiring a manual local installation.

---

## ⚠️ Known Limitations

1. **Ephemeral File Uploads** — Attachments stored locally will not persist across Docker container restarts unless a volume is mounted.
2. **Token Lifetime** — Access tokens expire in 15 minutes; automatic refresh is implemented but may cause brief delays on slow networks.
3. **Single-Level Dependencies** — Task blocking checks single-level dependencies; recursive loop prevention is not implemented.

---

## 🐳 Docker Reference

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start PostgreSQL in background |
| `docker compose down` | Stop the database container |
| `docker compose down -v` | Stop and delete all data (clean reset) |
| `docker ps` | List running containers |
| `docker compose logs db` | View PostgreSQL logs |
