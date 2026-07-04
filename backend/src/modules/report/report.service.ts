import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getCompletionStats(projectId?: string) {
    const whereClause = projectId ? { projectId } : {};

    const totalTasks = await this.prisma.task.count({ where: whereClause });
    const doneTasks = await this.prisma.task.count({
      where: { ...whereClause, status: 'DONE' },
    });
    const todoTasks = await this.prisma.task.count({
      where: { ...whereClause, status: 'TODO' },
    });
    const inProgressTasks = await this.prisma.task.count({
      where: { ...whereClause, status: 'IN_PROGRESS' },
    });
    const reviewTasks = await this.prisma.task.count({
      where: { ...whereClause, status: 'REVIEW' },
    });

    const completionRate = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      doneTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      completionRate,
    };
  }

  async getDeveloperWorkload(projectId?: string) {
    const users = await this.prisma.user.findMany({
      include: {
        assignedTasks: projectId ? { where: { projectId } } : true,
      },
    });

    return users.map((user) => {
      const tasks = user.assignedTasks || [];
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        totalTasks: tasks.length,
        todo: tasks.filter((t) => t.status === 'TODO').length,
        inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        review: tasks.filter((t) => t.status === 'REVIEW').length,
        done: tasks.filter((t) => t.status === 'DONE').length,
      };
    });
  }

  async generateCSV(projectId?: string): Promise<string> {
    const whereClause = projectId ? { projectId } : {};
    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: true,
        project: true,
      },
    });

    const csvRows = [];
    csvRows.push(['Task ID', 'Title', 'Description', 'Priority', 'Status', 'Due Date', 'Assignee', 'Project'].join(','));

    for (const task of tasks) {
      const row = [
        `"${task.id}"`,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        `"${task.priority}"`,
        `"${task.status}"`,
        `"${task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'N/A'}"`,
        `"${task.assignee ? task.assignee.name : 'Unassigned'}"`,
        `"${task.project.name.replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}
