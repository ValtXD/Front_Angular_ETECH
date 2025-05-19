import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';

import { CalcularComponent } from './calcular/calcular.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';

import { CalcularContadorComponent } from './calcular-contador/calcular-contador.component';
import { ResultadosContadorComponent } from './resultados-contador/resultados-contador.component';
import { GraficoContadorComponent } from './grafico-contador/grafico-contador.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },

      // Rotas originais dos aparelhos
      { path: 'calcular', component: CalcularComponent },
      { path: 'resultados', component: ResultadosComponent },
      { path: 'monitoramento', component: MonitoramentoComponent },

      // Rotas do contador de energia
      { path: 'calcular-contador', component: CalcularContadorComponent },
      { path: 'resultados-contador', component: ResultadosContadorComponent },
      { path: 'grafico-contador', component: GraficoContadorComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
