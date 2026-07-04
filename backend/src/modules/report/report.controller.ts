import { Controller, Get, Query, Response, UseGuards } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('stats')
  async getStats(@Query('projectId') projectId?: string) {
    return this.reportService.getCompletionStats(projectId);
  }

  @Get('workload')
  async getWorkload(@Query('projectId') projectId?: string) {
    return this.reportService.getDeveloperWorkload(projectId);
  }

  @Get('csv')
  async downloadCSV(@Response() res: any, @Query('projectId') projectId?: string) {
    const csvContent = await this.reportService.generateCSV(projectId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sprintnest-tasks-report.csv');
    return res.status(200).send(csvContent);
  }
}
