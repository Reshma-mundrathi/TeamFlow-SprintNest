# SprintNest – Architecture & Design Documentation

This document explains the technical architecture, design decisions, and system blueprints behind the SprintNest platform.

---

## 🏛️ System Architecture

SprintNest uses a **decoupled Client-Server Architecture** built with modern developer workflows in mind.

```mermaid
graph TD
    subgraph Client Application (React)
        A[React UI Components] --> B[AuthContext & State]
        B --> C[API Client Wrapper Axios]
        C --> D[Socket.io Client]
    end

    subgraph Backend Server (NestJS Monolith)
        E[NestJS Controllers] --> F[NestJS Services]
        F --> G[Prisma Repositories]
        H[Socket.io Gateway] --> F
    end

    subgraph Database
        I[(PostgreSQL DB)]
    end

    C -->|HTTP REST + JWT| E
    D <-->|WebSockets| H
    G -->|Prisma Client| I
```

### 1. Backend Architecture (NestJS)
The backend is structured as a **Modular Monolith** using NestJS, ensuring domain isolation and scalability.
*   **Modules**: Each business capability (Auth, Projects, Tasks, Incidents, Reports, Dashboard, Notifications) is encapsulated in its own module directory.
*   **Controller-Service-Repository Pattern**:
    *   **Controllers**: Handle client HTTP requests, validate query parameters, and enforce JWT security filters.
    *   **Services**: Implement business logic, manage transaction workflows, and assert rule validations.
    *   **Repositories**: Encapsulate database interactions using **Prisma ORM**, keeping database queries isolated.

### 2. Frontend Architecture (React)
*   **State Management**: Context-based state management (`AuthContext`) tracks current user profiles, JWT storage, theme setups, and active configurations.
*   **Vite Pipeline**: Provides near-instant hot module replacement (HMR) and optimized minified code bundling.
*   **Tailwind CSS v4 & Styling**: Styled using light/dark glassmorphic design systems with utility classes and custom layout properties.

---

## 🗄️ Database Design (Entity Relationship Diagram)

SprintNest uses PostgreSQL as its main database, modeled via Prisma schema declarations.

```mermaid
erDiagram
    ROLE {
        int id PK
        string name
    }
    USER {
        string id PK
        string email
        string password
        string name
        int roleId FK
        datetime createdAt
    }
    PROJECT {
        string id PK
        string name
        string description
        string themeColor
        datetime dueDate
        string managerId FK
    }
    PROJECT_MEMBER {
        string id PK
        string projectId FK
        string userId FK
    }
    TASK {
        string id PK
        string title
        string description
        string priority
        string status
        datetime dueDate
        string projectId FK
        string assigneeId FK
        string parentId FK
    }
    TASK_DEPENDENCY {
        string id PK
        string blockedTaskId FK
        string blockingTaskId FK
    }
    COMMENT {
        string id PK
        string content
        string taskId FK
        string userId FK
        datetime createdAt
    }
    ATTACHMENT {
        string id PK
        string filename
        string path
        string mimeType
        int size
        string taskId FK
    }
    INCIDENT_REPORT {
        string id PK
        string title
        string severity
        string status
        string timeline
        string rootCause
        string resolution
        string prevention
        string projectId FK
        string reporterId FK
    }
    INCIDENT_SECTION {
        string id PK
        string reportId FK
        string title
        string content
        int order
    }
    NOTIFICATION {
        string id PK
        string title
        string message
        boolean isRead
        string userId FK
    }

    ROLE ||--o{ USER : "has role"
    USER ||--o{ PROJECT_MEMBER : "is member"
    PROJECT ||--o{ PROJECT_MEMBER : "has members"
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ PROJECT : "manages"
    TASK ||--o{ TASK : "parent/subtask"
    TASK ||--o{ TASK_DEPENDENCY : "blocked/blocking"
    TASK ||--o{ COMMENT : "has"
    TASK ||--o{ ATTACHMENT : "has"
    PROJECT ||--o{ INCIDENT_REPORT : "has"
    INCIDENT_REPORT ||--o{ INCIDENT_SECTION : "has"
```

---

## 🔑 Key Design Decisions & Tradeoffs

### 1. Token Refresh Interceptor Flow
To maintain secure session management without forcing frequent logins, the application uses an Axios HTTP interceptor:

```mermaid
sequenceDiagram
    participant React Client
    participant Axios Interceptor
    participant NestJS API
    
    React Client->>Axios Interceptor: Make API Call (Expired JWT)
    Axios Interceptor->>NestJS API: GET /api/resource (Headers: Expired Token)
    NestJS API-->>Axios Interceptor: Return 401 Unauthorized
    Note over Axios Interceptor: Catch 401 & Pause Queue
    Axios Interceptor->>NestJS API: POST /api/auth/refresh (Body: Refresh Token)
    NestJS API-->>Axios Interceptor: Return 201 (New Access Token)
    Note over Axios Interceptor: Update LocalStorage & Resume Queue
    Axios Interceptor->>NestJS API: GET /api/resource (Headers: New Token)
    NestJS API-->>React Client: Return Data Success
```

### 2. Task Dependency Business Rules
*   **Decision**: Block task status transitions to `DONE` if parent tasks or dependency blocking tasks are in a non-completed state (`TODO`, `IN_PROGRESS`, `REVIEW`).
*   **Tradeoff**: This limits absolute user freedom in updating Kanban boards, but enforces strict milestone compliance necessary for software engineering workflows.

### 3. Isolated Incident Workflows
*   **Decision**: Only Managers or Admins can submit drafts, approve files, or close incident reports. Developers can log draft reports but cannot self-approve.
*   **Rationale**: Enforces SOX compliance and ensures proper incident resolution and root cause logs.
