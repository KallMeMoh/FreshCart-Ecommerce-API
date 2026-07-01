import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

export const ExtractTokenId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest<Request>().tokenId;
  },
);
