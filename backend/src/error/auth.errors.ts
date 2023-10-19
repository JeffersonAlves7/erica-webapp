import { UnauthorizedException } from '@nestjs/common';

export class AuthInvalidRefreshTokenError extends UnauthorizedException {
  constructor() {
    super('Invalid refresh token');
  }
}

export class AuthEmailAlreadyExistsError extends UnauthorizedException {
  constructor() {
    super('Email already exists');
  }
}

export class AuthUserNotFoundError extends UnauthorizedException {
  constructor() {
    super('Usuário não encontrado');
  }
}