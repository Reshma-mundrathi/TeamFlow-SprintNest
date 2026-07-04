import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Ensure uploads folder exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    return this.taskService.create(req.user.sub, body);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.taskService.findById(id);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.taskService.findByProject(projectId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.taskService.update(id, req.user.sub, req.user.role, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.taskService.delete(id, req.user.sub);
  }

  @Post(':id/comment')
  async addComment(@Param('id') id: string, @Request() req: any, @Body() body: { content: string }) {
    return this.taskService.addComment(id, req.user.sub, body);
  }

  @Post(':id/attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async addAttachment(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFile() file: any,
  ) {
    return this.taskService.addAttachment(id, req.user.sub, file);
  }
}
