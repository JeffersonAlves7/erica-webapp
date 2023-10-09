import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

interface Payload {
  sub: number | string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.usersService.findOne(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload: Payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.generateAccessToken(payload),
      refresh_token: await this.generateRefreshToken(payload),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const { exp, iat, ...rest } =
        await this.jwtService.verifyAsync(refreshToken);
      const payload: Payload = rest;
      const user = await this.usersService.findOne(payload.email);

      if (!user) throw new UnauthorizedException();

      return {
        access_token: await this.generateAccessToken(payload),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      const user = await this.usersService.create({ name, email, password });
      const payload: Payload = { sub: user.id, email: user.email };

      return {
        access_token: await this.generateAccessToken(payload),
        refresh_token: await this.generateRefreshToken(payload),
      };
    } catch (e) {
      throw new UnauthorizedException('Email already exists');
    }
  }

  private generateAccessToken(payload: Payload) {
    return this.jwtService.signAsync(payload);
  }

  private generateRefreshToken(payload: Payload) {
    return this.jwtService.signAsync(payload, { expiresIn: '120s' });
  }
}
