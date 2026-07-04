import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { ActivityLogService } from '../../common/services/activity-log.service';

@Injectable()
export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private activityLogService: ActivityLogService,
  ) {}

  async create(userId: string, body: any) {
    const { name, description, themeColor, dueDate, memberIds } = body;
    const project = await this.projectRepository.create(
      {
        name,
        description,
        themeColor,
        dueDate: dueDate ? new Date(dueDate) : null,
        manager: { connect: { id: userId } },
      },
      memberIds || [],
    );

    await this.activityLogService.log(
      userId,
      'PROJECT_CREATED',
      `Project created: "${name}" (ID: ${project.id})`,
    );

    return this.findById(project.id);
  }

  async findAll(userId: string, role: string) {
    if (role.toLowerCase() === 'admin' || role.toLowerCase() === 'manager') {
      return this.projectRepository.findAll();
    }
    return this.projectRepository.findByMember(userId);
  }

  async findById(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, userId: string, body: any) {
    const project = await this.findById(id);
    const { name, description, themeColor, dueDate, memberIds } = body;

    const updated = await this.projectRepository.update(
      id,
      {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        themeColor: themeColor !== undefined ? themeColor : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
      memberIds,
    );

    await this.activityLogService.log(
      userId,
      'PROJECT_UPDATED',
      `Project updated: "${updated.name}" (ID: ${id})`,
    );

    return this.findById(id);
  }

  async delete(id: string, userId: string) {
    const project = await this.findById(id);
    await this.projectRepository.delete(id);

    await this.activityLogService.log(
      userId,
      'PROJECT_DELETED',
      `Project deleted: "${project.name}" (ID: ${id})`,
    );

    return { success: true };
  }
}
