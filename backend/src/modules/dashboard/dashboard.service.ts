import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string, role: string) {
    const isDev = role.toLowerCase() === 'developer';

    const projectCount = await this.prisma.project.count({
      where: isDev ? { members: { some: { userId } } } : {},
    });

    const taskWhere = isDev
      ? { project: { members: { some: { userId } } } }
      : {};

    const totalTasks = await this.prisma.task.count({ where: taskWhere });
    const completedTasks = await this.prisma.task.count({
      where: { ...taskWhere, status: 'DONE' },
    });
    const pendingTasks = totalTasks - completedTasks;

    const incidentCount = await this.prisma.incidentReport.count({
      where: isDev ? { project: { members: { some: { userId } } } } : {},
    });

    const upcomingDeadlines = await this.prisma.task.findMany({
      where: {
        ...taskWhere,
        dueDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: { not: 'DONE' },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: {
        assignee: { select: { name: true } },
        project: { select: { name: true, themeColor: true } },
      },
    });

    const recentActivity = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const todo = await this.prisma.task.count({ where: { ...taskWhere, status: 'TODO' } });
    const inProgress = await this.prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } });
    const review = await this.prisma.task.count({ where: { ...taskWhere, status: 'REVIEW' } });

    const taskDistribution = [
      { name: 'Todo', value: todo },
      { name: 'In Progress', value: inProgress },
      { name: 'Review', value: review },
      { name: 'Done', value: completedTasks },
    ];

    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const count = await this.prisma.task.count({
        where: {
          ...taskWhere,
          status: 'DONE',
          updatedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyProgress.push({ day: dayLabel, completed: count });
    }

    const developers = (await this.prisma.user.findMany({
      where: { roleId: 3 }, // Developer role ID
      include: {
        assignedTasks: true,
      },
      take: 5,
    })) as any[];

    const teamWorkload = developers.map((dev) => {
      const devTasks = dev.assignedTasks || [];
      return {
        name: dev.name,
        tasks: devTasks.length,
        done: devTasks.filter((t: any) => t.status === 'DONE').length,
      };
    });

    return {
      cards: {
        activeProjects: projectCount,
        totalTasks,
        completedTasks,
        pendingTasks,
        incidents: incidentCount,
      },
      upcomingDeadlines,
      recentActivity,
      charts: {
        taskDistribution,
        weeklyProgress,
        teamWorkload,
      },
    };
  }
}
