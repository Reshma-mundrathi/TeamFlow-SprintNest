import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { IncidentReport, Prisma } from '@prisma/client';

@Injectable()
export class IncidentRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.IncidentReportCreateInput, sections: any[]): Promise<IncidentReport> {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.incidentReport.create({
        data,
      });

      if (sections && sections.length > 0) {
        await tx.incidentSection.createMany({
          data: sections.map((sec, index) => ({
            reportId: report.id,
            title: sec.title,
            content: sec.content,
            order: sec.order || index,
          })),
        });
      }

      return report;
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.incidentReport.findMany({
      include: {
        project: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true, email: true } },
        sections: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.incidentReport.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true, email: true } },
        sections: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findByProject(projectId: string): Promise<any[]> {
    return this.prisma.incidentReport.findMany({
      where: { projectId },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        sections: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.IncidentReportUpdateInput, sections?: any[]): Promise<IncidentReport> {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.incidentReport.update({
        where: { id },
        data,
      });

      if (sections) {
        await tx.incidentSection.deleteMany({
          where: { reportId: id },
        });

        await tx.incidentSection.createMany({
          data: sections.map((sec, index) => ({
            reportId: id,
            title: sec.title,
            content: sec.content,
            order: sec.order || index,
          })),
        });
      }

      return report;
    });
  }

  async delete(id: string): Promise<IncidentReport> {
    return this.prisma.incidentReport.delete({
      where: { id },
    });
  }
}
