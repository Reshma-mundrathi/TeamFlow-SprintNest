import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to avoid unique constraint or foreign key violations on re-run
  console.log('Cleaning up existing database records...');
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.taskDependency.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.incidentSection.deleteMany({});
  await prisma.incidentReport.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // 1. Create Roles
  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Developer' },
  ];

  for (const role of roles) {
    await prisma.role.create({
      data: role,
    });
  }
  console.log('Roles seeded successfully.');

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@sprintnest.com',
      name: 'Alice Admin',
      password: passwordHash,
      roleId: 1,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@sprintnest.com',
      name: 'Bob Manager',
      password: passwordHash,
      roleId: 2,
    },
  });

  const developer = await prisma.user.create({
    data: {
      email: 'developer@sprintnest.com',
      name: 'Charlie Dev',
      password: passwordHash,
      roleId: 3,
    },
  });

  console.log('Default users seeded successfully (password: password123).');

  // 3. Create Projects
  const projectA = await prisma.project.create({
    data: {
      name: 'SprintNest Smart Workspace',
      description: 'Main project for scaffolding full-stack engineering workspace collaboration features.',
      themeColor: '#6366f1', // Indigo
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      managerId: manager.id,
    },
  });

  const projectB = await prisma.project.create({
    data: {
      name: 'Apollo Service Migration',
      description: 'Infrastructure project focusing on migrating backend services to AWS EKS clusters.',
      themeColor: '#3b82f6', // Blue
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days from now
      managerId: manager.id,
    },
  });

  console.log('Projects seeded successfully.');

  // 4. Create Project Memberships
  // Both Bob (Manager) and Charlie (Developer) are members of both projects
  await prisma.projectMember.createMany({
    data: [
      { projectId: projectA.id, userId: manager.id },
      { projectId: projectA.id, userId: developer.id },
      { projectId: projectB.id, userId: manager.id },
      { projectId: projectB.id, userId: developer.id },
    ],
  });

  console.log('Project memberships seeded successfully.');

  // 5. Create Tasks for Project A
  const task1 = await prisma.task.create({
    data: {
      title: 'Design System Definition',
      description: 'Choose typography, spacing, and glassmorphic colors matching high-end SaaS applications.',
      priority: 'LOW',
      status: 'DONE',
      projectId: projectA.id,
      assigneeId: developer.id,
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Setup NestJS & Prisma Architecture',
      description: 'Configure standard repository structures, database connections, and middleware filters.',
      priority: 'HIGH',
      status: 'DONE',
      projectId: projectA.id,
      assigneeId: developer.id,
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Implement JWT Auth Service',
      description: 'Create endpoints for registering, logging in, and rotating refresh tokens securely.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      projectId: projectA.id,
      assigneeId: developer.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Build Frontend Dashboard Charts',
      description: 'Hook up Recharts to visual analytics statistics on developer workload and sprint completions.',
      priority: 'MEDIUM',
      status: 'TODO',
      projectId: projectA.id,
      assigneeId: developer.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Task Dependency Flow Validation',
      description: 'Verify backend rules that prevent finishing tasks when outstanding blocking tasks remain.',
      priority: 'HIGH',
      status: 'TODO',
      projectId: projectA.id,
      assigneeId: developer.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days from now
    },
  });

  // Task 6 (Subtask of Task 1)
  await prisma.task.create({
    data: {
      title: 'Define Glassmorphic Borders & Background Colors',
      description: 'Create standard .glass-card CSS tokens.',
      priority: 'LOW',
      status: 'DONE',
      projectId: projectA.id,
      assigneeId: developer.id,
      parentId: task1.id,
    },
  });

  // Task 7 (Subtask of Task 1)
  await prisma.task.create({
    data: {
      title: 'Select Typography Scales',
      description: 'Import Outfit font family from Google Fonts.',
      priority: 'LOW',
      status: 'DONE',
      projectId: projectA.id,
      assigneeId: developer.id,
      parentId: task1.id,
    },
  });

  // 6. Create Task Dependencies
  // Task 5 (Dependency flow validation) is blocked by Task 3 (JWT Auth Service)
  await prisma.taskDependency.create({
    data: {
      blockedTaskId: task5.id,
      blockingTaskId: task3.id,
    },
  });

  console.log('Tasks and dependencies seeded successfully.');

  // 7. Create Comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'Design system is set up. Added standard border shadows to index.css.',
        taskId: task1.id,
        userId: developer.id,
      },
      {
        content: '@developer@sprintnest.com make sure to use tailwind v4 transparency modifiers.',
        taskId: task1.id,
        userId: manager.id,
      },
      {
        content: 'Working on authentication controller endpoints today.',
        taskId: task3.id,
        userId: developer.id,
      },
    ],
  });

  console.log('Comments seeded successfully.');

  // 8. Create Incident Reports (Draft, Submitted, Approved, Closed)
  // Closed Incident Report
  const incident1 = await prisma.incidentReport.create({
    data: {
      title: 'Database Connection Pool Exhaustion',
      severity: 'CRITICAL',
      status: 'CLOSED',
      timeline: '10:15 AM - Alerts triggered. 10:20 AM - Inspected connection graphs. 10:35 AM - Set pool limit to 20 and restarted application.',
      rootCause: 'Connection leak caused by nested task query loops forgetting to release clients.',
      resolution: 'Refactored UserRepository to reuse connection contexts.',
      prevention: 'Enable connection timeout limits in Prisma configuration and active logging.',
      projectId: projectA.id,
      reporterId: manager.id,
    },
  });

  // Add sections to Closed Incident Report
  await prisma.incidentSection.createMany({
    data: [
      {
        reportId: incident1.id,
        title: 'Context & Impact',
        content: 'On July 2nd, the backend API stopped responding to requests, throwing database client timeout exceptions. This affected approximately 15% of active user sessions.',
        order: 1,
      },
      {
        reportId: incident1.id,
        title: 'Diagnostic Timeline',
        content: 'Checked PostgreSQL logs to verify active query counts. Verified connection pool was capped at 5 instead of 20.',
        order: 2,
      },
    ],
  });

  // Submitted Incident Report
  const incident2 = await prisma.incidentReport.create({
    data: {
      title: 'CSS Layout Overflow in Mobile Navigation Menu',
      severity: 'LOW',
      status: 'SUBMITTED',
      timeline: 'Discovered during UI review of the mobile layout on phone views.',
      rootCause: 'Main container element did not specify overflow-hidden properties.',
      resolution: 'Apply proper classes to parent containers.',
      projectId: projectA.id,
      reporterId: developer.id,
    },
  });

  await prisma.incidentSection.create({
    data: {
      reportId: incident2.id,
      title: 'Steps to Reproduce',
      content: '1. Resize browser width to 360px.\n2. Tap the hamburger icon to slide out the sidebar.\n3. Scroll horizontally.',
      order: 1,
    },
  });

  // Draft Incident Report
  const incident3 = await prisma.incidentReport.create({
    data: {
      title: 'Staging Environment Webpack Build Failures',
      severity: 'HIGH',
      status: 'DRAFT',
      projectId: projectB.id,
      reporterId: developer.id,
    },
  });

  await prisma.incidentSection.create({
    data: {
      reportId: incident3.id,
      title: 'Log Output',
      content: 'Module parse failed: Unexpected character "@" in tailwindcss imports.',
      order: 1,
    },
  });

  console.log('Incident reports and sections seeded successfully.');
  console.log('Database seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
