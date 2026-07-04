import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
      include: { role: true },
    });
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.user.findMany({
      include: { role: true },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }
}
