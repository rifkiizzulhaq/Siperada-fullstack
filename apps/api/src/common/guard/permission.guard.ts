import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorator/permission.decorator';
import { AuthenticatedRequest } from '../Interfaces/authenticated-request.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // Jika tidak ada decorator @Permissions(), izinkan akses
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Anda harus login terlebih dahulu');
    }

    const userPermissions = user.permissions || [];

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Anda tidak memiliki permission: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
