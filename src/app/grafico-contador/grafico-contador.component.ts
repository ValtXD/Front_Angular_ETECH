import { Component, OnInit } from '@angular/core';
import { ContadorService } from '../services/contador.service';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { Router } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule} from '@angular/forms';
Chart.register(...registerables);

@Component({
  selector: 'app-grafico-contador',
  templateUrl: './grafico-contador.component.html',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatRadioModule, FormsModule],
  styleUrls: ['./grafico-contador.component.scss']
})
export class GraficoContadorComponent implements OnInit {
  chart?: Chart;
  modo: 'mensal' | 'anual' = 'mensal';

  constructor(private contadorService: ContadorService, private router: Router) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.contadorService.obterDadosGrafico().subscribe(data => {
      if (this.modo === 'mensal') {
        this.criarGrafico(data.labels, data.consumos, data.custos);
      } else {
        const labelsAnual = data.labels.map(label => {
          const [mesStr, anoStr] = label.split('/');
          const anoNum = Number(anoStr) + 1;
          return `${mesStr}/${anoNum}`;
        });

        const consumosAnual = data.consumos.map(c => c * 12);
        const custosAnual = data.custos.map(c => c * 12);

        this.criarGrafico(labelsAnual, consumosAnual, custosAnual);
      }
    });
  }

  criarGrafico(labels: string[], consumos: number[], custos: number[]): void {
    const ctx = (document.getElementById('graficoConsumo') as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Consumo (kWh)',
            data: consumos,
            borderColor: 'blue',
            backgroundColor: 'rgba(0,0,255,0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'y1',
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: 'Custo (R$)',
            data: custos,
            borderColor: 'green',
            backgroundColor: 'rgba(0,255,0,0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'y2',
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: TooltipItem<'line'>) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return typeof value === 'number' ? `${label}: ${value.toFixed(2)}` : `${label}: ${value}`;
              },
              footer: (tooltipItems) => {
                if (tooltipItems.length > 0) {
                  const idx = tooltipItems[0].dataIndex;
                  return `Data: ${labels[idx]}`;
                }
                return '';
              }
            }
          },
          legend: { display: true }
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
            title: { display: true, text: 'Mês/Ano' },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12
            }
          }
        }
      }
    });
  }

  onModoChange(event: any) {
    this.modo = event.value;
    this.carregarDados();
  }

  voltar() {
    this.router.navigate(['/consumo-mensal-listar']);
  }
}
