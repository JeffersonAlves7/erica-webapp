import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  constructor(private prismaService: PrismaService) {}

  async findOne(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: { email: string; name: string; password: string }) {
    return this.prismaService.user.create({
      data,
    });
  }
}
