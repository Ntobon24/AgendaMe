import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.checkIsLogged() || authService.isTokenExpired()) {
    router.navigateByUrl('/login');
    return false;
  }
  
  const user = authService.getUserLogged();
  console.log('Usuario autenticado:', user);
  return true;
};
