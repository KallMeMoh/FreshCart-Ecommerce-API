import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export function extractBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    throw new UnauthorizedException('Invalid Authorization Header');

  const token = header.split(' ')[1]?.trim();
  if (!token) throw new UnauthorizedException('Invalid Authorization Header');

  return token;
}
