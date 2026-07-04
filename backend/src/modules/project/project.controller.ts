import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('project')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  @Roles('Admin', 'Manager')
  async create(@Request() req: any, @Body() body: any) {
    return this.projectService.create(req.user.sub, body);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.projectService.findAll(req.user.sub, req.user.role);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.projectService.findById(id);
  }

  @Put(':id')
  @Roles('Admin', 'Manager')
  async update(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.projectService.update(id, req.user.sub, body);
  }

  @Delete(':id')
  @Roles('Admin', 'Manager')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.projectService.delete(id, req.user.sub);
  }
}
