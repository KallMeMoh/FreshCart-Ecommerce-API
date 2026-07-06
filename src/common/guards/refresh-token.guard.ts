import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { type Request } from 'express';
import { ConfigService } from '../../modules/config/config.service';
import { JwtService } from '../../modules/token/jwt.service';
import { extractBearerToken } from '../utils/extract-bearer-token';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private extractRefreshToken(req: Request): string {
    const cookieToken = req.cookies?.refreshToken as unknown;
    if (typeof cookieToken === 'string' && cookieToken) return cookieToken;

    return extractBearerToken(req);
  }

  async canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http')
      throw new UnauthorizedException('Unsupported transport');

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractRefreshToken(req);

    const { sub, jti, role } = await this.jwtService.validate(
      token,
      this.configService.refreshSecret,
    );

    req.user = {
      id: sub,
      role,
      tokenId: jti,
    };

    return true;
  }
}
