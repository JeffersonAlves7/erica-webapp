import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  AuthEmailAlreadyExistsError,
  AuthInvalidRefreshTokenError,
  AuthUserNotFoundError,
} from 'src/error/auth.errors';
import { compare } from 'src/utils/crypt-utils';

interface Payload {
  sub: string;
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
    if (!user) throw new AuthUserNotFoundError();
    if (!user.isActive)
      throw new UnauthorizedException(
        'Usuário não está ativo, fale com um técnico.',
      );

    const isPasswordEqual = await compare(pass, user.password);
    if (isPasswordEqual) throw new UnauthorizedException();

    const payload: Payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.generateAccessToken(payload),
      refresh_token: await this.generateRefreshToken(payload),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const completeOldPayload =
        await this.jwtService.verifyAsync(refreshToken);

      const oldPayload: Payload = {
        email: completeOldPayload.email,
        sub: completeOldPayload.sub,
      };

      const user = await this.usersService.findById(oldPayload.sub);
      if (!user) throw new UnauthorizedException();

      const payload: Payload = {
        email: user.email,
        sub: user.id,
      };

      return {
        access_token: await this.generateAccessToken(payload),
      };
    } catch (e) {
      throw new AuthInvalidRefreshTokenError();
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      await this.usersService.create({ name, email, password });

      return 'Registro feito com sucesso!';
    } catch (e) {
      console.log(e);
      throw new AuthEmailAlreadyExistsError();
    }
  }

  private generateAccessToken(payload: Payload) {
    return this.jwtService.signAsync(payload);
  }

  private generateRefreshToken(payload: Payload) {
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }
}
