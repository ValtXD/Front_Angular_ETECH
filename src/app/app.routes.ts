// src/app/routes.ts

import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/auth.guard';

import { CalcularComponent } from './calcular/calcular.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import {ConsumoMensalListarComponent} from './consumo-mensal-listar/consumo-mensal-listar.component';
import {GraficoContadorComponent} from './grafico-contador/grafico-contador.component';
import {ConsumoMensalCalcularComponent} from './consumo-mensal-calcular/consumo-mensal-calcular.component';
import {UploadImagemComponent} from './upload-imagem/upload-imagem.component';
import {ListaLeiturasComponent} from './lista-leituras/lista-leituras.component';
import {LeituraQrComponent} from './leitura-qr/leitura-qr.component';
import {UploadDocumentoComponent} from './upload-documento/upload-documento.component';
import {ResultadosDocumentoComponent} from './resultados-documento/resultados-documento.component';

import { AuthCacheService } from './services/auth-cache.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [() => {
      const authService = inject(AuthCacheService);
      const router = inject(Router);
      if (authService.isLoggedIn()) {
        return router.createUrlTree(['/home']);
      }
      return true;
    }]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [() => {
      const authService = inject(AuthCacheService);
      const router = inject(Router);
      if (authService.isLoggedIn()) {
        return router.createUrlTree(['/home']);
      }
      return true;
    }]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },

      // Rotas originais dos aparelhos
      { path: 'calcular', component: CalcularComponent },
      { path: 'resultados', component: ResultadosComponent },
      { path: 'monitoramento', component: MonitoramentoComponent },

      // Rotas do contador de energia
      { path: 'consumo-mensal-calcular', component: ConsumoMensalCalcularComponent },
      { path: 'consumo-mensal-listar', component: ConsumoMensalListarComponent },
      { path: 'grafico-contador', component: GraficoContadorComponent },

      // Rotas de OCR
      { path: 'upload', component: UploadImagemComponent },
      { path: 'leituras', component: ListaLeiturasComponent },

      // Rotas de QrCode OCR Celular
      { path: 'leitura-qr', component: LeituraQrComponent },

      // Rotas do Leitura_Documento
      { path: 'upload-documento', component: UploadDocumentoComponent },
      { path: 'resultados-documento', component: ResultadosDocumentoComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
