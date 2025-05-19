import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  TooltipItem,
  registerables
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  standalone: true,
  imports: [BaseChartDirective, CommonModule, FormsModule, RouterModule],
  selector: 'app-monitoramento',
  templateUrl: './monitoramento.component.html',
  styleUrls: ['./monitoramento.component.css']
})
export class MonitoramentoComponent implements OnInit {
  datasDisponiveis: string[] = [];
  dataSelecionada: string = '';
  modo30dias = false;

  consumoTotalPorAmbienteChartData?: ChartData<'line'>;
  custoTotalPorAmbienteChartData?: ChartData<'line'>;

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            const dataset = context.dataset as any;
            const index = context.dataIndex;
            const extras = dataset.dadosExtras?.[index];

            let label = `${dataset.label}: ${context.formattedValue}`;
            if (extras) {
              label += `\nAparelhos: ${extras.aparelhos.join(', ')}`;
              label += `\nEstados: ${extras.estados.join(', ')}`;
              label += `\nBandeiras: ${extras.bandeiras.join(', ')}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  modalAberto = false;
  loadingDicas = false;
  dicasHtml = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.carregarDatas();
  }

  carregarDatas() {
    this.http.get<any>('/api/resultados/').subscribe({
      next: (res) => {
        this.datasDisponiveis = res.datas_disponiveis || [];
        this.dataSelecionada = res.data_selecionada ?? this.datasDisponiveis[0] ?? '';

        if (!this.dataSelecionada) {
          console.warn('Nenhuma data válida disponível.');
          return;
        }

        this.carregarDados();
      },
      error: (err) => {
        console.error('Erro ao carregar datas disponíveis', err);
      }
    });
  }

  carregarDados() {
    if (!this.dataSelecionada) return;

    const params: any = { periodo: this.dataSelecionada };
    if (this.modo30dias) {
      params.modo = '30dias';
    }

    this.http.get<any>('/api/monitoramento/', { params }).subscribe({
      next: (res) => {
        let dados = res.dados;

        if (this.modo30dias) {
          dados = dados.map((d: any) => ({
            ...d,
            consumo: d.consumo * 30,
            custo_normal: d.custo_normal * 30,
            custo_social: d.custo_social * 30
          }));
        }

        const labels = dados.map((d: any) => d.ambiente);

        const dadosExtras = dados.map((d: any) => ({
          aparelhos: d.aparelhos || [],
          estados: d.estados || [],
          bandeiras: d.bandeiras || []
        }));

        this.consumoTotalPorAmbienteChartData = {
          labels,
          datasets: [
            {
              label: this.modo30dias ? 'Consumo Mensal (kWh)' : 'Consumo Diário (kWh)',
              data: dados.map((d: any) => d.consumo),
              borderColor: 'blue',
              fill: false,
              tension: 0.1,
              ...( { dadosExtras } as any )
            }
          ]
        };

        this.custoTotalPorAmbienteChartData = {
          labels,
          datasets: [
            {
              label: this.modo30dias ? 'Custo Mensal Normal (R$)' : 'Custo Diário Normal (R$)',
              data: dados.map((d: any) => d.custo_normal),
              borderColor: 'red',
              fill: false,
              tension: 0.1,
              ...( { dadosExtras } as any )
            },
            {
              label: this.modo30dias ? 'Custo Mensal Social (R$)' : 'Custo Diário Social (R$)',
              data: dados.map((d: any) => d.custo_social),
              borderColor: 'green',
              fill: false,
              tension: 0.1,
              ...( { dadosExtras } as any )
            }
          ]
        };
      },
      error: (err) => {
        console.error('Erro ao carregar dados do monitoramento', err);
      }
    });
  }

  onDataChange() {
    this.carregarDados();
  }

  onModoChange() {
    this.carregarDados();
  }

  gerarDicas() {
    this.modalAberto = true;
    this.loadingDicas = true;
    this.dicasHtml = '';

    const payload = {
      dataSelecionada: this.dataSelecionada,
      modo30dias: this.modo30dias
    };

    this.http.post<{ dicas: string }>('/api/dicas-economia/', payload).subscribe({
      next: res => {
        this.loadingDicas = false;
        this.dicasHtml = this.formatarDicas(res.dicas);
      },
      error: err => {
        this.loadingDicas = false;
        this.dicasHtml = `<p>Erro ao gerar dicas: ${err.message || err.statusText}</p>`;
      }
    });
  }

  fecharModal() {
    this.modalAberto = false;
  }

  voltar() {
    this.router.navigate(['/resultados']);
  }

  private formatarDicas(texto: string): string {
    const paragrafos = texto.split('\n').filter(p => p.trim() !== '');
    return paragrafos.map(p => `<p>${p}</p>`).join('');
  }
}
