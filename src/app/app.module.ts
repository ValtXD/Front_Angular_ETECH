import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';

// Importando os módulos do ng2-charts
//import { NgChartsModule } from 'ng2-charts';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';

// Componentes
import { AppComponent } from './app.component';
import { CalcularComponent } from './calcular/calcular.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import {ConsumoMensalListarComponent} from './consumo-mensal-listar/consumo-mensal-listar.component';
import {GraficoContadorComponent} from './grafico-contador/grafico-contador.component';
import {ConsumoMensalCalcularComponent} from './consumo-mensal-calcular/consumo-mensal-calcular.component';
import {UploadImagemComponent} from './upload-imagem/upload-imagem.component';
import {ListaLeiturasComponent} from './lista-leituras/lista-leituras.component';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {LeituraQrComponent} from './leitura-qr/leitura-qr.component';

@NgModule({
  declarations: [
    AppComponent,


  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    CalcularComponent,
    ResultadosComponent,
    CommonModule,
    MonitoramentoComponent,
    ConsumoMensalCalcularComponent,
    ConsumoMensalListarComponent,
    GraficoContadorComponent,
    UploadImagemComponent,
    ListaLeiturasComponent,
    ZXingScannerModule,
    NgxQRCodeModule,
    LeituraQrComponent,
    // Certifique-se de ter adicionado o ChartsModule aqui
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  bootstrap: [AppComponent]
})
export class AppModule { }
