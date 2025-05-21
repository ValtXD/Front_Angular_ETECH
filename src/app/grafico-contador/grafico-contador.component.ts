import { Component, OnInit } from '@angular/core';
import { ContadorService } from '../services/contador.service';
import { Chart, registerables, TooltipItem } from 'chart.js';
import {Router} from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-contador',
  templateUrl: './grafico-contador.component.html',
  standalone: true,
  styleUrls: ['./grafico-contador.component.css']
})
export class GraficoContadorComponent implements OnInit {
  chart: Chart | undefined;

  constructor(private contadorService: ContadorService, private router: Router) {}

  ngOnInit(): void {
    this.contadorService.obterDadosGrafico().subscribe(data => {
      this.criarGrafico(data.labels, data.consumos, data.custos);
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
            yAxisID: 'y1'
          },
          {
            label: 'Custo (R$)',
            data: custos,
            borderColor: 'green',
            backgroundColor: 'rgba(0,255,0,0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // deixa o CSS controlar o tamanho
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: TooltipItem<'line'>) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y !== null ? context.parsed.y : '';
                return `${label}: ${value}`;
              },
              footer: (tooltipItems) => {
                if (tooltipItems.length > 1) {
                  const idx = tooltipItems[0].dataIndex;
                  return `Data: ${labels[idx]}`;
                }
                return '';
              }
            }
          },
          legend: {
            display: true
          }
        },
        scales: {
          y1: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Consumo (kWh)'
            }
          },
          y2: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'Custo (R$)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Mês/Ano'
            }
          }
        }
      }
    });
  }

  voltar() {
    this.router.navigate(['/consumo-mensal-listar']);
  }

  dica() {
    alert('Aqui vai aparecer a dica que você quer mostrar ao usuário.');
  }
}
