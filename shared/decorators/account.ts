import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Account = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
