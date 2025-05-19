import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
  ]
})
export class ResultadosComponent implements OnInit {
  dataSelecionada: string = '';
  datasDisponiveis: string[] = [];
  aparelhosDia: any[] = [];
  consumoTotalDia = 0;
  custoTotalNormal = 0;
  custoTotalSocial = 0;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.carregarResultados();
  }

  carregarResultados(data?: string) {
    this.api.getResultados(data).subscribe({
      next: (res: any) => {
        console.log('Dados recebidos da API:', res);  // Para depurar os dados no console

        this.datasDisponiveis = res.datas_disponiveis || [];
        this.dataSelecionada = res.data_selecionada || (this.datasDisponiveis.length > 0 ? this.datasDisponiveis[0] : '');
        this.aparelhosDia = res.aparelhos || [];
        this.consumoTotalDia = res.consumo_total_dia || 0;
        this.custoTotalNormal = res.custo_total_normal || 0;
        this.custoTotalSocial = res.custo_total_social || 0;
      },
      error: (err) => {
        console.error('Erro ao carregar resultados:', err);
        this.aparelhosDia = [];
        this.consumoTotalDia = 0;
        this.custoTotalNormal = 0;
        this.custoTotalSocial = 0;
      }
    });
  }

  onDataChange() {
    if (this.dataSelecionada) {
      this.carregarResultados(this.dataSelecionada);
    } else {
      this.aparelhosDia = [];
      this.consumoTotalDia = 0;
      this.custoTotalNormal = 0;
      this.custoTotalSocial = 0;
    }
  }

  voltar() {
    this.router.navigate(['/calcular']);
  }

  irParaGrafico() {
    this.router.navigate(['/monitoramento']);
  }
}
