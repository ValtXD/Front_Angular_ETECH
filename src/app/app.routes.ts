import {LayoutComponent} from './layout/layout.component';
import {Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {AuthGuard} from './services/auth.guard';
import {HomeComponent} from './pages/home/home.component';
import {CalcularComponent} from './calcular/calcular.component';
import {ResultadosComponent} from './resultados/resultados.component';
import {MonitoramentoComponent} from './monitoramento/monitoramento.component';
import {ConsumoMensalCalcularComponent} from './consumo-mensal-calcular/consumo-mensal-calcular.component';
import {ConsumoMensalListarComponent} from './consumo-mensal-listar/consumo-mensal-listar.component';
import {GraficoContadorComponent} from './grafico-contador/grafico-contador.component';
import {UploadImagemComponent} from './upload-imagem/upload-imagem.component';
import {ListaLeiturasComponent} from './lista-leituras/lista-leituras.component';
import {LeituraQrComponent} from './leitura-qr/leitura-qr.component';
import {UploadDocumentoComponent} from './upload-documento/upload-documento.component';
import {ResultadosDocumentoComponent} from './resultados-documento/resultados-documento.component';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rotas protegidas dentro do layout
  {
    path: 'app', // <- alterado aqui para 'app'
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },

      { path: 'calcular', component: CalcularComponent },
      { path: 'resultados', component: ResultadosComponent },
      { path: 'monitoramento', component: MonitoramentoComponent },

      { path: 'consumo-mensal-calcular', component: ConsumoMensalCalcularComponent },
      { path: 'consumo-mensal-listar', component: ConsumoMensalListarComponent },
      { path: 'grafico-contador', component: GraficoContadorComponent },

      { path: 'upload', component: UploadImagemComponent },
      { path: 'leituras', component: ListaLeiturasComponent },

      { path: 'leitura-qr', component: LeituraQrComponent },

      { path: 'upload-documento', component: UploadDocumentoComponent },
      { path: 'resultados-documento', component: ResultadosDocumentoComponent },
    ]
  },

  // Redirecionamentos padrão
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
