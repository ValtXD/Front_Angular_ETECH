import { Component, OnInit } from '@angular/core';
import { DocumentoService, CalculoResponse } from '../services/documento.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resultados-documento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resultados-documento.component.html',
  styleUrls: ['./resultados-documento.component.css']
})
export class ResultadosDocumentoComponent implements OnInit {
  tipoDocumento = '';
  dados: any[] = [];

  estados: any[] = [];
  bandeiras: any[] = [];

  estadoSelecionado: number | null = null;
  bandeiraSelecionada: number | null = null;
  tarifaSocialAtiva = false;

  resultadosCalculo?: CalculoResponse;
  carregando = false;

  dicaIA = '';
  carregandoDica = false;
  mostrarDica = false;

  constructor(private docService: DocumentoService, private router: Router) {}

  ngOnInit() {
    const state = window.history.state;
    console.log('Estado recebido em ResultadosDocumentoComponent:', state);

    this.tipoDocumento = state.tipoDocumento || '';
    this.dados = state.dados || [];

    if (this.dados.length > 0) {
      this.docService.listarEstados().subscribe(estados => this.estados = estados);
      this.docService.listarBandeiras().subscribe(bandeiras => this.bandeiras = bandeiras);
    }
  }

  getConsumoPorData(data: string): number | null {
    if (!this.resultadosCalculo || !this.resultadosCalculo.resultados) return null;

    const resultado = this.resultadosCalculo.resultados.find(r => r.data === data);
    return resultado ? resultado.consumo : null;
  }

  calcularCustos() {
    if (!this.estadoSelecionado || !this.bandeiraSelecionada) {
      alert('Selecione o Estado e a Bandeira tarifária antes de calcular.');
      return;
    }

    this.carregando = true;
    this.docService.calcularCustos(
      this.tipoDocumento,
      this.dados,
      this.estadoSelecionado,
      this.bandeiraSelecionada,
      this.tarifaSocialAtiva
    ).subscribe({
      next: (res) => {
        this.resultadosCalculo = res;
        this.carregando = false;
      },
      error: () => {
        alert('Erro ao calcular custos');
        this.carregando = false;
      }
    });
  }
  gerarDica() {
    if (!this.resultadosCalculo || !this.resultadosCalculo.resultados || this.resultadosCalculo.resultados.length === 0) {
      alert('Calcule os custos antes de gerar a dica.');
      return;
    }
    //Mensagem para a IA Gemini
    let mensagem = `Analise os dados abaixo e forneça dicas personalizadas para economia de energia:\n\n`;

    mensagem += `Tipo de documento: ${this.tipoDocumento}\n\nDados do documento:\n`;
    this.dados.forEach((item, i) => {
      if (this.tipoDocumento === 'aparelho') {
        mensagem += `- Aparelho: ${item.aparelho}, Potência(W): ${item.potencia_w}, Horas por dia: ${item.horas_por_dia}\n`;
      } else if (this.tipoDocumento === 'contador') {
        mensagem += `- Data: ${item.data}, Leitura kWh: ${item.leitura_kwh}\n`;
      }
    });

    mensagem += `\nResultados do cálculo:\n`;
    this.resultadosCalculo.resultados.forEach((item, i) => {
      if (this.tipoDocumento === 'aparelho') {
        mensagem += `- Aparelho: ${item.aparelho}, Consumo mensal (kWh): ${item.consumo_mensal_kwh.toFixed(2)}, Custo normal: R$${item.custo_normal.toFixed(2)}, Custo com tarifa social: R$${item.custo_social.toFixed(2)}\n`;
      } else if (this.tipoDocumento === 'contador') {
        mensagem += `- Data: ${item.data}, Leitura (kWh): ${item.leitura_kwh.toFixed(2)}, Consumo: ${item.consumo.toFixed(2)}, Custo normal: R$${item.custo_normal.toFixed(2)}, Custo com tarifa social: R$${item.custo_social.toFixed(2)}\n`;
      }
    });

    this.carregandoDica = true;
    this.docService.gerarDicaIA(mensagem).subscribe({
      next: (res) => {
        this.carregandoDica = false;
        if (res.candidates && res.candidates.length > 0) {
          this.dicaIA = res.candidates[0].content.parts[0].text;
        } else {
          this.dicaIA = 'Nenhuma resposta obtida da IA.';
        }
        this.mostrarDica = true;
      },
      error: (err) => {
        this.carregandoDica = false;
        this.dicaIA = 'Erro ao gerar dica. Verifique o console.';
        this.mostrarDica = true;
        console.error('Erro na API Gemini:', err);
      }
    });
  }

  fecharDica() {
    this.mostrarDica = false;
    this.dicaIA = '';
  }
}
