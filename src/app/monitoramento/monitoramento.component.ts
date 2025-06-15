import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  TooltipItem,
  registerables,
  ChartDataset
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// Registra todos os componentes do Chart.js
Chart.register(...registerables);

// --- Interfaces para Tipagem Forte ---

// Resposta da API que busca as datas disponíveis
interface DatasResponse {
  datas_disponiveis: string[];
  data_selecionada: string;
}

// Estrutura de um único dado de monitoramento vindo da API
interface MonitoramentoData {
  ambiente: string;
  consumo: number;
  custo_normal: number;
  aparelhos: string[];
  estados: string[];
  bandeiras: string[];
}

// Resposta completa da API de monitoramento
interface MonitoramentoResponse {
  dados: MonitoramentoData[];
}

// Interface customizada para o nosso dataset, incluindo os dados extras
interface CustomChartDataset extends ChartDataset<'line'> {
  dadosExtras?: {
    aparelhos: string[];
    estados: string[];
    bandeiras: string[];
  }[];
}


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

  // Tipagem forte para os dados dos gráficos
  consumoTotalPorAmbienteChartData?: ChartData<'line'>;
  custoTotalPorAmbienteChartData?: ChartData<'line'>;

  // Opções de configuração para os gráficos
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
<<<<<<< HEAD
          // --- FUNÇÃO DO TOOLTIP CORRIGIDA ---
          label: (context: TooltipItem<'line'>) => {
            // Acessa nosso dataset customizado de forma segura
            const customDataset = context.dataset as CustomChartDataset;
            const extras = customDataset.dadosExtras?.[context.dataIndex];

            // Formata o label principal (Ex: "Consumo Diário (kWh): 15.2")
            let label = `${context.dataset.label}: ${context.formattedValue}`;

            // Adiciona a lista de aparelhos se existirem
            if (extras && extras.aparelhos && extras.aparelhos.length > 0) {
              // Adiciona uma quebra de linha e a lista de aparelhos
=======
          label: (context: TooltipItem<'line'>) => {
            const dataset = context.dataset as any;
            const index = context.dataIndex;
            const extras = dataset.dadosExtras?.[index]; // Access dadosExtras

            let label = `${dataset.label}: ${context.formattedValue}`;
            if (extras && extras.aparelhos && extras.aparelhos.length > 0) {
>>>>>>> main
              label += `\nAparelhos: ${extras.aparelhos.join(', ')}`;
            }
            return label;
          },
<<<<<<< HEAD
=======
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
>>>>>>> main
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

  carregarDatas(): void {
    this.http.get<DatasResponse>('/api/resultados/').subscribe({
      next: (res) => {
        this.datasDisponiveis = res.datas_disponiveis || [];
        // Define a data selecionada ou usa a primeira da lista como padrão
        this.dataSelecionada = res.data_selecionada || this.datasDisponiveis[0] || '';

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

  carregarDados(): void {
    if (!this.dataSelecionada) return;

<<<<<<< HEAD
    // Constrói os parâmetros da requisição de forma segura
    let params = new HttpParams().set('periodo', this.dataSelecionada);
    if (this.modo === '30dias') {
      params = params.set('modo', '30dias');
=======
    const params: any = { periodo: this.dataSelecionada };
    if (this.modo === '30dias') {
      params.modo = '30dias';
>>>>>>> main
    }

    this.http.get<MonitoramentoResponse>('/api/monitoramento/', { params }).subscribe({
      next: (res) => {
        let dados = res.dados || [];

<<<<<<< HEAD
        // Ajusta os dados se o modo for '30dias'
        if (this.modo === '30dias') {
          dados = dados.map((d) => ({
=======
        if (this.modo === '30dias') {
          dados = dados.map((d: any) => ({
>>>>>>> main
            ...d,
            consumo: d.consumo * 30,
            custo_normal: d.custo_normal * 30,
          }));
        }

        const labels = dados.map((d) => d.ambiente);

        // Mapeia os dados extras para o tooltip
        const dadosExtras = dados.map((d) => ({
          aparelhos: d.aparelhos || [],
          estados: d.estados || [],
          bandeiras: d.bandeiras || []
        }));

        // Monta os dados para o gráfico de consumo
        this.consumoTotalPorAmbienteChartData = {
          labels,
          datasets: [
            {
              label: this.modo === '30dias' ? 'Consumo Mensal (kWh)' : 'Consumo Diário (kWh)',
<<<<<<< HEAD
              data: dados.map((d) => d.consumo),
=======
              data: dados.map((d: any) => d.consumo),
>>>>>>> main
              borderColor: 'blue',
              backgroundColor: 'rgba(0,0,255,0.1)',
              fill: true,
              tension: 0.3,
              yAxisID: 'y1',
              pointRadius: 5,
              pointHoverRadius: 7,
<<<<<<< HEAD
              dadosExtras: dadosExtras, // Adiciona os dados extras de forma limpa
            } as CustomChartDataset
=======
              ...( { dadosExtras } as any )
            }
>>>>>>> main
          ]
        };

        // Monta os dados para o gráfico de custo
        this.custoTotalPorAmbienteChartData = {
          labels,
          datasets: [
            {
              label: this.modo === '30dias' ? 'Custo Mensal (R$)' : 'Custo Diário (R$)',
<<<<<<< HEAD
              data: dados.map((d) => d.custo_normal),
=======
              data: dados.map((d: any) => d.custo_normal),
>>>>>>> main
              borderColor: 'green',
              backgroundColor: 'rgba(0,255,0,0.1)',
              fill: true,
              tension: 0.3,
              yAxisID: 'y2',
              pointRadius: 5,
              pointHoverRadius: 7,
<<<<<<< HEAD
              dadosExtras: dadosExtras, // Adiciona os dados extras de forma limpa
            } as CustomChartDataset,
=======
              ...( { dadosExtras } as any )
            },
>>>>>>> main
          ]
        };
      },
      error: (err) => {
        console.error('Erro ao carregar dados do monitoramento', err);
      }
    });
  }

  // Chamado quando o usuário muda a data no select
  onDataChange(): void {
    this.carregarDados();
  }

<<<<<<< HEAD
  // Chamado quando o usuário muda o modo (Diário / 30 dias)
  onModoChange(event: Event): void {
=======
  onModoChange(event: Event) {
>>>>>>> main
    const input = event.target as HTMLInputElement;
    this.modo = input.value as 'diario' | '30dias';
    this.carregarDados();
  }

<<<<<<< HEAD
  voltar(): void {
=======
  voltar() {
>>>>>>> main
    this.router.navigate(['/resultados']);
  }
}
