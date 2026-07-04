import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = await this.userService.findById(req.user.sub);
    const { password, ...result } = user;
    return result;
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: { name?: string; email?: string }) {
    const user = await this.userService.updateProfile(req.user.sub, body);
    const { password, ...result } = user;
    return result;
  }

  @Put('password')
  async updatePassword(
    @Request() req: any,
    @Body() body: { oldPassword?: string; newPassword?: string },
  ) {
    return this.userService.updatePassword(req.user.sub, body);
  }

  @Get()
  async getAllUsers() {
    const users = await this.userService.findAll();
    return users.map(({ password, ...user }) => user);
  }
}
