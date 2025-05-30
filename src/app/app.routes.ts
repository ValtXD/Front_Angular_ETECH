import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';

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
      { path: 'consumo-mensal-calcular', component: ConsumoMensalCalcularComponent },
      { path: 'consumo-mensal-listar', component: ConsumoMensalListarComponent },
      { path: 'grafico-contador', component: GraficoContadorComponent },

      //Rotas de OCR
      //{ path: '', redirectTo: 'upload', pathMatch: 'full' },
      { path: 'upload', component: UploadImagemComponent },
      { path: 'leituras', component: ListaLeiturasComponent },
      //{ path: '**', redirectTo: 'upload' },

      //Rotas de QrCode OCR Celular
      { path: 'leitura-qr', component: LeituraQrComponent },

      //Rotas Login_Cadastro_Django

      //Rotas do Leitura_Documento
      { path: 'upload-documento', component: UploadDocumentoComponent },
      { path: 'resultados-documento', component: ResultadosDocumentoComponent },

    ]
  },
  { path: '**', redirectTo: '' }
];
