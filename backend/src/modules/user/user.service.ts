import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '../../common/services/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private prisma: PrismaService,
  ) {}

  async create(data: any) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    // Resolve role id from role name
    const roleName = data.roleName || 'Developer';
    const role = await this.prisma.role.findFirst({
      where: { name: { equals: roleName, mode: 'insensitive' } },
    });
    if (!role) {
      throw new BadRequestException(`Role '${roleName}' does not exist`);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({
      email: data.email,
      name: data.name,
      password: passwordHash,
      role: { connect: { id: role.id } },
    });
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async updateProfile(id: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new BadRequestException('Email is already in use');
      }
    }
    return this.userRepository.update(id, data);
  }

  async updatePassword(id: string, data: { oldPassword?: string; newPassword?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.oldPassword && data.newPassword) {
      const valid = await bcrypt.compare(data.oldPassword, user.password);
      if (!valid) {
        throw new BadRequestException('Incorrect old password');
      }
      const newHash = await bcrypt.hash(data.newPassword, 10);
      await this.userRepository.update(id, { password: newHash });
      return { success: true };
    }
    throw new BadRequestException('Invalid password data provided');
  }
}
