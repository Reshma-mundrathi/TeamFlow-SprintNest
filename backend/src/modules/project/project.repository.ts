import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { Project, Prisma } from '@prisma/client';

@Injectable()
export class ProjectRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProjectCreateInput, memberIds: string[]): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data,
      });

      if (memberIds && memberIds.length > 0) {
        await tx.projectMember.createMany({
          data: memberIds.map((userId) => ({
            projectId: project.id,
            userId,
          })),
        });
      }

      const managerId = data.manager.connect?.id;
      const managerExists = memberIds.includes(managerId || '');
      if (!managerExists && managerId) {
        await tx.projectMember.create({
          data: {
            projectId: project.id,
            userId: managerId,
          },
        });
      }

      return project;
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.project.findMany({
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });
  }

  async findByMember(userId: string): Promise<any[]> {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any, memberIds?: string[]): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id },
        data,
      });

      if (memberIds) {
        await tx.projectMember.deleteMany({
          where: { projectId: id },
        });

        await tx.projectMember.createMany({
          data: memberIds.map((userId) => ({
            projectId: id,
            userId,
          })),
        });

        const managerId = project.managerId;
        const managerExists = memberIds.includes(managerId);
        if (!managerExists) {
          await tx.projectMember.create({
            data: {
              projectId: id,
              userId: managerId,
            },
          });
        }
      }

      return project;
    });
  }

  async delete(id: string): Promise<Project> {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
