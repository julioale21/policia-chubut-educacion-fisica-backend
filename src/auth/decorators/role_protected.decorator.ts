import { Logger, SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {
  const logger = new Logger('RoleProtected');
  logger.log('RoleProtected decorator args: ', args);

  return SetMetadata(META_ROLES, args);
};
