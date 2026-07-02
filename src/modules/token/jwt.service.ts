import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { isUserRoleEnum } from '../user/enums/user-role.enum';

export type JwtPayload = {
  sub: string | undefined;
  jti: string | undefined;
  role: string | undefined;
};

@Injectable()
export class JwtService extends NestJwtService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {
    super();
  }

  async validate(token: string, secret: string) {
    let payload: JwtPayload;
    try {
      payload = this.verify<JwtPayload>(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or malformed token');
    }

    const { jti, sub, role } = payload;
    if (
      !jti ||
      !sub ||
      !role ||
      !isUserRoleEnum(role) ||
      (await this.redisClient.get(`jwt:blacklist:${jti}`))
    ) {
      throw new UnauthorizedException('Invalid or malformed token');
    }

    return { jti, sub, role };
  }
}
