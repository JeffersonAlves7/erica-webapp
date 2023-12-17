import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { encrypt } from 'src/utils/crypt-utils';

@Injectable()
export class UsersService {
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
    const encyptedPassword = await encrypt(data.password);

    return this.prismaService.user.create({
      data: {
        ...data,
        password: encyptedPassword,
      },
    });
  }
}
