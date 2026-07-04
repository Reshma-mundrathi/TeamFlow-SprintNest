# SprintNest – Video Demonstration & Pitch Guide

This document provides a step-by-step walkthrough script to record the **3-to-5-minute application video** required for your project submission.

---

## ⏱️ Video Timeline Outline (Total: ~4 Minutes)

| Segment | Duration | Focus Area | On-Screen Action |
| :--- | :--- | :--- | :--- |
| **1. Introduction** | 30s | High-Level Value Pitch | Login Screen -> Dashboard |
| **2. Projects & Task Board** | 60s | Kanban / List & Dependency check | Projects Page -> Kanban Board -> Task Details |
| **3. Incident Workflow** | 60s | Incident timeline & approvals | Incidents Page -> View Reports -> Status change |
| **4. Analytics & Exporters** | 45s | Recharts dashboard & CSV Download | Reports Page -> Select project -> CSV download |
| **5. Settings & Theme** | 15s | UI customizability | Settings Page -> Dark mode toggle |
| **6. Architecture Summary** | 30s | Code hygiene & backend structure | Brief view of README/ARCHITECTURE.md diagrams |

---

## 🎙️ Step-by-Step Recording Script

### Segment 1: Introduction (0:00 - 0:30)
*   **On-Screen:** Show the login page (`http://localhost:5173/login`). Log in using the manager credentials:
    *   **Email:** `manager@sprintnest.com`
    *   **Password:** `password123`
*   **Talk Track:**
    > "Hi, I'm presenting SprintNest—a smart team workspace built for modern software engineering teams. I'll log in as a Manager. Upon logging in, we're greeted by a glassmorphic dashboard showcasing real-time aggregate statistics like active projects, total tasks, and active incident reports. Below, we see recent activities pushed via WebSockets, upcoming deadlines, and interactive completion charts powered by Recharts."

---

### Segment 2: Projects & Task Board (0:30 - 1:30)
*   **On-Screen:**
    1. Click on **Projects** in the sidebar.
    2. Click on the project **"SprintNest Smart Workspace"** to enter its Kanban board.
    3. Toggle between the **Kanban view** and **List view** to show preferences.
    4. Click on **"Task Dependency Flow Validation"** to open its details modal. Point to the **Warning Alert** indicating it is blocked by the JWT Auth Service task.
*   **Talk Track:**
    > "Let's head into our Projects. SprintNest supports both Kanban board columns and list views. Let's look at the Task details modal. When I open the 'Task Dependency Flow Validation' task, you'll immediately see a colored alert warning us that it is blocked by 'Implement JWT Auth Service'. The system validates task dependencies, preventing users from closing tasks when blocking items are outstanding."

---

### Segment 3: Incident Investigation (1:30 - 2:30)
*   **On-Screen:**
    1. Click on **Incidents** in the sidebar.
    2. View the closed incident: **"Database Connection Pool Exhaustion"**. Highlight the Timeline, Root Cause, and dynamic Custom Sections.
    3. Click on the **"CSS Layout Overflow"** incident report (currently in `SUBMITTED` status).
    4. Since you are logged in as a Manager, change its status to **APPROVED** or **CLOSED** to show the workflow progression.
*   **Talk Track:**
    > "One of SprintNest's unique modules is the Incident Investigation board. Outages or critical bugs can be formally reported, complete with event timelines, root causes, prevention measures, and dynamic sections. Because I am logged in as a Manager, I can move this CSS Layout Incident from 'Submitted' to 'Approved' or 'Closed' status. Developers can log drafts, but only managers and admins can approve or close incidents."

---

### Segment 4: Analytics & Exporter (2:30 - 3:15)
*   **On-Screen:**
    1. Click on **Reports** in the sidebar.
    2. Show the **Task Completion Rate** pie chart and the **Developer Workload** stats table.
    3. Click **"Export Task CSV Report"** to download the CSV spreadsheet.
*   **Talk Track:**
    > "Under Reports, we see advanced metrics: a completion rate pie chart and a developer workload productivity table summarizing task assignments. Clicking the 'Export Task CSV Report' button instantly generates a CSV containing all current task states and workloads."

---

### Segment 5: Settings & Theme (3:15 - 3:30)
*   **On-Screen:**
    1. Click on **Settings** in the sidebar.
    2. Click **"Switch to Light Theme"**, then click **"Switch to Dark Theme"**.
*   **Talk Track:**
    > "In Settings, users can update profiles, change credentials, or switch preferences between light and dark modes."

---

### Segment 6: Technical Recap & Conclusion (3:30 - 4:00)
*   **On-Screen:** Show the `README.md` or `ARCHITECTURE.md` file in VS Code or in the browser, showing the Mermaid system structure.
*   **Talk Track:**
    > "Under the hood, SprintNest is built on a clean modular monolith NestJS backend, Prisma ORM, and PostgreSQL, paired with a React 19 and TypeScript frontend. Thank you for watching!"

---

## 💡 Pro-Tips for Recording

1.  **Keep it moving:** Don't linger on forms; copy-paste details or have seed data ready (which our seeder has already populated!).
2.  **Audio Quality:** Record in a quiet room using a dedicated microphone if possible.
3.  **Resolution:** Record in standard `1080p` (1920x1080) for clarity.
