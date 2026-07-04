import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ActivityLogService } from '../../common/services/activity-log.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private activityLogService: ActivityLogService,
  ) {}

  async register(body: any) {
    const user = await this.userService.create(body);
    await this.activityLogService.log(user.id, 'USER_REGISTERED', `User registered with email: ${user.email}`);
    const { password, ...result } = user;
    return result;
  }

  async login(body: any) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name, name: user.name };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'sprintnest_jwt_secret_key_123!',
      expiresIn: '1d',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'sprintnest_jwt_refresh_secret_key_456!',
      expiresIn: '7d',
    });

    await this.activityLogService.log(user.id, 'USER_LOGIN', `User logged in`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'sprintnest_jwt_refresh_secret_key_456!',
      });
      const newPayload = { sub: payload.sub, email: payload.email, role: payload.role, name: payload.name };
      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_SECRET || 'sprintnest_jwt_secret_key_123!',
        expiresIn: '1d',
      });
      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET || 'sprintnest_jwt_refresh_secret_key_456!',
        expiresIn: '7d',
      });
      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.activityLogService.log(userId, 'USER_LOGOUT', `User logged out`);
    return { success: true };
  }
}
