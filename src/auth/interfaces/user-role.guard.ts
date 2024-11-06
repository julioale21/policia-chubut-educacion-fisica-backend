import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role_protected.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from './valid_roles';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedRoles: string[] = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );

    if (!allowedRoles) return true;
    if (allowedRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new BadRequestException('User not found');

    if (user.roles.includes(ValidRoles.supeUser)) return true;

    for (const role of user.roles) {
      if (allowedRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.name} does not have permission. Needs to be one of the next roles: [${allowedRoles}]`,
    );
  }
}
