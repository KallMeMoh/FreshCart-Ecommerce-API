import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

export const ExtractUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const { userId, userRole } = ctx.switchToHttp().getRequest<Request>();
    return { userId, userRole };
  },
);
