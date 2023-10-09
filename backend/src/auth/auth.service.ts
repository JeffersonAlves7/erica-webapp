import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '120s',
      }),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const { exp, iat, ...payload } =
        await this.jwtService.verifyAsync(refreshToken);
      const user = await this.usersService.findOne(payload.username);

      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}