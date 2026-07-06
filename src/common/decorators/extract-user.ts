import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

export const ExtractUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<Request>();
    return user;
  },
);
