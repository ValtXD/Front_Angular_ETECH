import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-contador',
  templateUrl: './grafico-contador.component.html',
  standalone: true,
  styleUrls: ['./grafico-contador.component.css']
})
export class GraficoContadorComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:8000/api/monitoramento-contador/').subscribe(data => {
      const ctx = document.getElementById('graficoContador') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.estados,
          datasets: [
            {
              label: 'Consumo (kWh)',
              data: data.consumos,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              tension: 0.3,
              yAxisID: 'y'
            },
            {
              label: 'Total Pago (R$)',
              data: data.totais,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 128, 0, 0.1)',
              tension: 0.3,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Consumo (kWh)'
              }
            },
            y1: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Total (R$)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    });
  }
}
