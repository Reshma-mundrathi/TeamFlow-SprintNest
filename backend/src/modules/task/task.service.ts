import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private activityLogService: ActivityLogService,
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  async create(userId: string, body: any) {
    const { title, description, priority, status, dueDate, projectId, assigneeId, parentId, dependencyIds } = body;

    // Check project exists
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = await this.taskRepository.create(
      {
        title,
        description,
        priority,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        project: { connect: { id: projectId } },
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
      dependencyIds || [],
    );

    await this.activityLogService.log(
      userId,
      'TASK_CREATED',
      `Task created: "${title}" (ID: ${task.id})`,
    );

    // Notify assignee if assigned
    if (assigneeId) {
      await this.notificationService.createNotification(
        assigneeId,
        'Task Assigned',
        `You have been assigned to task: "${title}"`,
        'TASK_ASSIGNED',
      );
    }

    return this.findById(task.id);
  }

  async findById(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async findByProject(projectId: string) {
    return this.taskRepository.findByProject(projectId);
  }

  async update(id: string, userId: string, role: string, body: any) {
    const task = await this.findById(id);

    // Rule: "Only assigned users can edit their tasks" (for Developers)
    if (role.toLowerCase() === 'developer') {
      if (task.assigneeId !== userId) {
        throw new ForbiddenException('Only the assigned developer can edit this task');
      }
    }

    // Rule: "Completed task cannot move back to Todo"
    if (task.status === 'DONE' && body.status === 'TODO') {
      throw new BadRequestException('A completed task cannot be moved back to Todo');
    }

    const { title, description, priority, status, dueDate, assigneeId, parentId, dependencyIds } = body;

    const updated = await this.taskRepository.update(
      id,
      {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        priority: priority !== undefined ? priority : undefined,
        status: status !== undefined ? status : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        assignee: assigneeId !== undefined ? (assigneeId ? { connect: { id: assigneeId } } : { disconnect: true }) : undefined,
        parent: parentId !== undefined ? (parentId ? { connect: { id: parentId } } : { disconnect: true }) : undefined,
      },
      dependencyIds,
    );

    await this.activityLogService.log(
      userId,
      'TASK_UPDATED',
      `Task updated: "${updated.title}" (ID: ${id})`,
    );

    // Trigger Notification for new assignee
    if (assigneeId && assigneeId !== task.assigneeId) {
      await this.notificationService.createNotification(
        assigneeId,
        'Task Assigned',
        `You have been assigned to task: "${updated.title}"`,
        'TASK_ASSIGNED',
      );
    }

    // Trigger Notification for task completed
    if (status === 'DONE' && task.status !== 'DONE') {
      const project = await this.prisma.project.findUnique({ where: { id: task.projectId } });
      if (project) {
        await this.notificationService.createNotification(
          project.managerId,
          'Task Completed',
          `Task "${updated.title}" has been completed by the assignee`,
          'TASK_COMPLETED',
        );
      }
    }

    // Prepare response and potential warnings
    const taskDetails = await this.findById(id);
    let warning = null;

    // Rule: "Task dependency warning appears if parent task unfinished"
    if (taskDetails.parent && taskDetails.parent.status !== 'DONE') {
      warning = 'Parent task is unfinished.';
    }

    const incompleteDependencies = taskDetails.dependencies.filter(
      (dep: any) => dep.blockingTask.status !== 'DONE',
    );
    if (incompleteDependencies.length > 0) {
      warning = warning
        ? `${warning} Also, there are unfinished blocking task dependencies.`
        : 'There are unfinished blocking task dependencies.';
    }

    return {
      task: taskDetails,
      warning,
    };
  }

  async delete(id: string, userId: string) {
    const task = await this.findById(id);
    await this.taskRepository.delete(id);

    await this.activityLogService.log(
      userId,
      'TASK_DELETED',
      `Task deleted: "${task.title}" (ID: ${id})`,
    );

    return { success: true };
  }

  async addComment(id: string, userId: string, body: { content: string }) {
    const task = await this.findById(id);
    const comment = await this.taskRepository.addComment(id, userId, body.content);

    await this.activityLogService.log(
      userId,
      'TASK_COMMENT_ADDED',
      `Added comment to task "${task.title}"`,
    );

    // Mentions check: e.g. @developer@sprintnest.com
    const mentions = body.content.match(/@\S+/g);
    if (mentions) {
      for (const rawMention of mentions) {
        const email = rawMention.substring(1);
        const mentionedUser = await this.prisma.user.findUnique({ where: { email } });
        if (mentionedUser) {
          await this.notificationService.createNotification(
            mentionedUser.id,
            'Comment Mention',
            `You were mentioned in a comment on task: "${task.title}"`,
            'COMMENT_MENTION',
          );
        }
      }
    }

    return comment;
  }

  async addAttachment(id: string, userId: string, file: any) {
    const task = await this.findById(id);
    const attachment = await this.taskRepository.addAttachment(
      id,
      userId,
      file.originalname,
      file.path,
      file.mimetype,
      file.size,
    );

    await this.activityLogService.log(
      userId,
      'TASK_ATTACHMENT_ADDED',
      `Uploaded file "${file.originalname}" to task "${task.title}"`,
    );

    return attachment;
  }
}
