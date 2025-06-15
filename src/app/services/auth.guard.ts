import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const loggedIn = auth.isLoggedIn();
  console.log('[AuthGuard] isLoggedIn:', loggedIn);

  if (!loggedIn) {
    console.log('[AuthGuard] Usuário NÃO autenticado. Redirecionando para /login');
    router.navigate(['/login']);
    return false;
  }

  console.log('[AuthGuard] Usuário autenticado. Permitindo acesso.');
  return true;
};
