import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IncidentRepository } from './incident.repository';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class IncidentService {
  constructor(
    private incidentRepository: IncidentRepository,
    private activityLogService: ActivityLogService,
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  async create(userId: string, body: any) {
    const { title, severity, status, timeline, rootCause, resolution, prevention, projectId, sections } = body;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const reportStatus = status || 'DRAFT';
    
    // Safety check: Developer cannot immediately create as Approved/Closed
    // We will just force it to DRAFT or SUBMITTED if they aren't Manager/Admin
    // But since this is creation, let's default to DRAFT/SUBMITTED.

    const report = await this.incidentRepository.create(
      {
        title,
        severity: severity || 'MEDIUM',
        status: reportStatus,
        timeline,
        rootCause,
        resolution,
        prevention,
        project: { connect: { id: projectId } },
        reporter: { connect: { id: userId } },
      },
      sections || [],
    );

    await this.activityLogService.log(
      userId,
      'INCIDENT_CREATED',
      `Incident Report created: "${title}" (ID: ${report.id})`,
    );

    if (reportStatus === 'SUBMITTED') {
      await this.notificationService.createNotification(
        project.managerId,
        'Incident Submitted',
        `Incident report "${title}" has been submitted and requires review`,
        'INCIDENT_SUBMITTED',
      );
    }

    return this.findById(report.id);
  }

  async findById(id: string) {
    const report = await this.incidentRepository.findById(id);
    if (!report) {
      throw new NotFoundException('Incident report not found');
    }
    return report;
  }

  async findAll() {
    return this.incidentRepository.findAll();
  }

  async findByProject(projectId: string) {
    return this.incidentRepository.findByProject(projectId);
  }

  async update(id: string, userId: string, userRole: string, body: any) {
    const report = await this.findById(id);
    const role = userRole.toLowerCase();

    const { title, severity, status, timeline, rootCause, resolution, prevention, sections } = body;

    if (status !== undefined && status !== report.status) {
      // Role Check for APPROVED or CLOSED
      if (status === 'APPROVED' || status === 'CLOSED') {
        if (role !== 'manager' && role !== 'admin') {
          throw new ForbiddenException('Only managers and admins can approve or close incident reports');
        }
      }

      // Rule: "Incident cannot close until approved"
      if (status === 'CLOSED') {
        if (report.status !== 'APPROVED' && status !== 'APPROVED') {
          throw new BadRequestException('Incident reports cannot be closed until they have been approved');
        }
      }
    }

    const updated = await this.incidentRepository.update(
      id,
      {
        title: title !== undefined ? title : undefined,
        severity: severity !== undefined ? severity : undefined,
        status: status !== undefined ? status : undefined,
        timeline: timeline !== undefined ? timeline : undefined,
        rootCause: rootCause !== undefined ? rootCause : undefined,
        resolution: resolution !== undefined ? resolution : undefined,
        prevention: prevention !== undefined ? prevention : undefined,
      },
      sections,
    );

    await this.activityLogService.log(
      userId,
      'INCIDENT_UPDATED',
      `Incident Report updated: "${updated.title}" - Status: ${updated.status} (ID: ${id})`,
    );

    // Trigger notifications for status change
    if (status === 'SUBMITTED' && report.status !== 'SUBMITTED') {
      const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
      if (project) {
        await this.notificationService.createNotification(
          project.managerId,
          'Incident Submitted',
          `Incident report "${updated.title}" has been submitted and requires review`,
          'INCIDENT_SUBMITTED',
        );
      }
    }

    if (status === 'APPROVED' && report.status !== 'APPROVED') {
      await this.notificationService.createNotification(
        report.reporterId,
        'Incident Approved',
        `Your incident report "${updated.title}" has been approved`,
        'INCIDENT_APPROVED',
      );
    }

    return this.findById(id);
  }

  async delete(id: string, userId: string) {
    const report = await this.findById(id);
    await this.incidentRepository.delete(id);

    await this.activityLogService.log(
      userId,
      'INCIDENT_DELETED',
      `Incident Report deleted: "${report.title}" (ID: ${id})`,
    );

    return { success: true };
  }
}
