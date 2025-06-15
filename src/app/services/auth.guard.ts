// src/app/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthCacheService} from './auth-cache.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authCacheService: AuthCacheService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authCacheService.isLoggedIn()) {
      // Se o usuário estiver logado, permite o acesso à rota
      return true;
    } else {
      // Se não estiver logado, redireciona para a página de login
      // E retorna um UrlTree para o Angular entender a navegação
      return this.router.createUrlTree(['/login']);
    }
  }
}
