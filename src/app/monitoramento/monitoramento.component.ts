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
  modo: 'diario' | '30dias' = 'diario';

  consumoTotalPorAmbienteChartData?: ChartData<'line'>;
  custoTotalPorAmbienteChartData?: ChartData<'line'>;

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const dataset = context.dataset as any;
            const index = context.dataIndex;
            const extras = dataset.dadosExtras?.[index]; // Access dadosExtras

            let label = `${dataset.label}: ${context.formattedValue}`;
            if (extras && extras.aparelhos && extras.aparelhos.length > 0) {
              label += `\nAparelhos: ${extras.aparelhos.join(', ')}`;
            }
            return label;
          },
          // You can add a footer callback here if you want to show other info like 'estados' or 'bandeiras'
          // footer: (tooltipItems) => {
          //   if (tooltipItems.length > 0) {
          //     const dataset = tooltipItems[0].dataset as any;
          //     const index = tooltipItems[0].dataIndex;
          //     const extras = dataset.dadosExtras?.[index];
          //     if (extras && extras.estados && extras.estados.length > 0) {
          //       return `Estados: ${extras.estados.join(', ')}`;
          //     }
          //   }
          //   return '';
          // }
        }
      }
    },
    scales: {
      y1: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: { display: true, text: 'Consumo (kWh)' }
      },
      y2: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Custo (R$)' }
      },
      x: {
        title: { display: true, text: 'Ambiente' },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12
        }
      }
    }
  };

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
    if (this.modo === '30dias') {
      params.modo = '30dias';
    }

    this.http.get<any>('/api/monitoramento/', { params }).subscribe({
      next: (res) => {
        let dados = res.dados;

        if (this.modo === '30dias') {
          dados = dados.map((d: any) => ({
            ...d,
            consumo: d.consumo * 30,
            custo_normal: d.custo_normal * 30,
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
              label: this.modo === '30dias' ? 'Consumo Mensal (kWh)' : 'Consumo Diário (kWh)',
              data: dados.map((d: any) => d.consumo),
              borderColor: 'blue',
              backgroundColor: 'rgba(0,0,255,0.1)',
              fill: true,
              tension: 0.3,
              yAxisID: 'y1',
              pointRadius: 5,
              pointHoverRadius: 7,
              ...( { dadosExtras } as any )
            }
          ]
        };

        this.custoTotalPorAmbienteChartData = {
          labels,
          datasets: [
            {
              label: this.modo === '30dias' ? 'Custo Mensal (R$)' : 'Custo Diário (R$)',
              data: dados.map((d: any) => d.custo_normal),
              borderColor: 'green',
              backgroundColor: 'rgba(0,255,0,0.1)',
              fill: true,
              tension: 0.3,
              yAxisID: 'y2',
              pointRadius: 5,
              pointHoverRadius: 7,
              ...( { dadosExtras } as any )
            },
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

  onModoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.modo = input.value as 'diario' | '30dias';
    this.carregarDados();
  }

  voltar() {
    this.router.navigate(['/resultados']);
  }
}
