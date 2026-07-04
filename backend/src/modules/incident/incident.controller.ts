import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('incident')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentController {
  constructor(private incidentService: IncidentService) {}

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    return this.incidentService.create(req.user.sub, body);
  }

  @Get()
  async findAll() {
    return this.incidentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.incidentService.findById(id);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.incidentService.findByProject(projectId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.incidentService.update(id, req.user.sub, req.user.role, body);
  }

  @Delete(':id')
  @Roles('Admin', 'Manager')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.incidentService.delete(id, req.user.sub);
  }
}
