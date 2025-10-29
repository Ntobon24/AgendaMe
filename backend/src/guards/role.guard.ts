import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.header('authorization');
    if (!authorization) {
      throw new ForbiddenException('Acceso no autorizado');
    }
    const token = this.getToken(authorization);
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload; 
      
      const requiredRoles = this.getRequiredRoles(context);
      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        throw new ForbiddenException('No tienes permisos para realizar esta acción');
      }
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException(error.message || 'Token no valido');
    }
    return true;
  }

  private getToken(authorization: string) {
    let token = authorization.split(' ');
    if (token.length > 1) {
      return token[1];
    }
    return token[0];
  }

  private getRequiredRoles(context: ExecutionContext): string[] | null {
    const handler = context.getHandler();
    const roles = Reflect.getMetadata('roles', handler);
    return roles;
  }
}
