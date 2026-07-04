import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { Task, Prisma, Comment, Attachment } from '@prisma/client';

@Injectable()
export class TaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TaskCreateInput, dependencyIds?: string[]): Promise<Task> {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data,
      });

      if (dependencyIds && dependencyIds.length > 0) {
        await tx.taskDependency.createMany({
          data: dependencyIds.map((blockingTaskId) => ({
            blockedTaskId: task.id,
            blockingTaskId,
          })),
        });
      }

      return task;
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: {
          select: { id: true, name: true, email: true },
        },
        parent: true,
        subTasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        dependencies: {
          include: {
            blockingTask: true,
          },
        },
        blocking: {
          include: {
            blockedTask: true,
          },
        },
      },
    });
  }

  async findByProject(projectId: string): Promise<any[]> {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        dependencies: {
          include: {
            blockingTask: true,
          },
        },
        subTasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput, dependencyIds?: string[]): Promise<Task> {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id },
        data,
      });

      if (dependencyIds !== undefined) {
        await tx.taskDependency.deleteMany({
          where: { blockedTaskId: id },
        });

        if (dependencyIds.length > 0) {
          await tx.taskDependency.createMany({
            data: dependencyIds.map((blockingTaskId) => ({
              blockedTaskId: id,
              blockingTaskId,
            })),
          });
        }
      }

      return task;
    });
  }

  async delete(id: string): Promise<Task> {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async addComment(taskId: string, userId: string, content: string): Promise<Comment> {
    return this.prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async addAttachment(
    taskId: string,
    uploadedById: string,
    filename: string,
    path: string,
    mimeType: string,
    size: number,
  ): Promise<Attachment> {
    return this.prisma.attachment.create({
      data: {
        filename,
        path,
        mimeType,
        size,
        taskId,
        uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  }
}
