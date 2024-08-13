import { ExecutionContext } from '@nestjs/common';

export const RowHeaders = (data: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const headers = req.headers;
  return headers[data];
};
