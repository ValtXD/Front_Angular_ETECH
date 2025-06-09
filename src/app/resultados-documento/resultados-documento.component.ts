// src/app/resultados-documentos/resultados-documentos.component.ts

import { Component, OnInit } from '@angular/core';
import { DocumentoService, CalculoResponse } from '../services/documento.service';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resultados-documento',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe],
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

  // --- CORREÇÃO AQUI ---
  getConsumoPorData(data: string): number | null {
    if (!this.resultadosCalculo || !this.resultadosCalculo.resultados) return null;

    const resultadoEncontrado = this.resultadosCalculo.resultados.find(item => item.data === data);
    return resultadoEncontrado ? resultadoEncontrado.consumo : null;
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
      error: (err) => {
        console.error('Erro ao calcular custos:', err);
        alert(`Erro ao calcular custos: ${err.error?.error || err.statusText || 'Erro desconhecido.'}`);
        this.carregando = false;
      }
    });
  }

  gerarDica() {
    if (!this.resultadosCalculo || !this.resultadosCalculo.resultados || this.resultadosCalculo.resultados.length === 0) {
      alert('Calcule os custos antes de gerar a dica.');
      return;
    }

    const payloadParaBackend = {
      tipo_documento: this.tipoDocumento,
      dados_originais: this.dados,
      resultados_calculo: this.resultadosCalculo,
      estado_id: this.estadoSelecionado,
      bandeira_id: this.bandeiraSelecionada,
      tarifa_social_ativa: this.tarifaSocialAtiva
    };

    this.carregandoDica = true;
    this.docService.gerarDicaIA(payloadParaBackend).subscribe({
      next: (res) => {
        this.carregandoDica = false;
        this.dicaIA = res?.dica || 'Nenhuma resposta obtida da IA.';
        this.mostrarDica = true;
      },
      error: (err) => {
        console.error('Erro ao gerar dica IA:', err);
        this.carregandoDica = false;
        this.dicaIA = `Erro ao gerar dica. Detalhes: ${err.error?.details || err.error?.error || 'Erro desconhecido.'}`;
        this.mostrarDica = true;
      }
    });
  }

  fecharDica() {
    this.mostrarDica = false;
    this.dicaIA = '';
  }
}
