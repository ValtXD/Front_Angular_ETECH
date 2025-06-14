// src/app/resultados/resultados.component.ts

import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service'; // Mantenha ApiService
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
  // Adicionais para modal da IA
  modalAberto = false;
  loadingDica = false;
  dicaGerada = '';

  constructor(private api: ApiService, private router: Router) {} // Injete ApiService

  ngOnInit() {
    this.carregarResultados();
  }

  carregarResultados(data?: string) {
    this.api.getResultados(data).subscribe({
      next: (res: any) => {
        console.log('Dados recebidos da API:', res);

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

  gerarDica() {
    this.modalAberto = true;
    this.loadingDica = true;
    this.dicaGerada = '';
    const dadosParaIA = this.aparelhosDia.map(ap => ({
      nome: ap.nome,
      ambiente: ap.ambiente?.nome,
      estado: ap.estado?.nome,
      bandeira: ap.bandeira?.cor,
      consumo_diario_kwh: ap.consumo_diario_kwh,
      custo_diario: ap.custo_diario
    }));
    const mensagem = `
  Aqui estão os dados de consumo energético atuais para análise:

  Aparelhos cadastrados:
  ${JSON.stringify(dadosParaIA, null, 2)}

  TOTAL consumo diário: ${this.consumoTotalDia.toFixed(2)} kWh
  TOTAL custo normal diário: R$ ${this.custoTotalNormal.toFixed(2)}

  Gere de 3 a 5 DICAS de economia de energia, considerando:
  - Quais aparelhos mais consomem
  - Sugestões de substituição por modelos mais eficientes ou econômicos
  - Tecnologias inteligentes que ajudam na economia (como timers, sensores, etc.)
  - Alertas sobre bandeiras tarifárias
  - Dicas práticas para reduzir o custo e consumo

  Escreva de forma clara e objetiva, em português, para usuários comuns.
  `;

    this.api.gerarDicaIA(mensagem).subscribe({ // Usa ApiService para gerar a dica
      next: res => {
        this.loadingDica = false;
        const texto = res?.candidates?.[0]?.content?.parts?.[0]?.text || 'Nenhuma dica gerada.';
        this.dicaGerada = texto.split('\n').map((p: string) => `<p>${p}</p>`).join('');

        // Salvar a dica gerada no backend (para dicas de aparelhos)
        this.api.saveApplianceAiTip({ text: texto }).subscribe({
          next: (savedTip) => {
            console.log('Dica de aparelho salva com sucesso:', savedTip);
          },
          error: (saveErr) => {
            console.error('Erro ao salvar dica de aparelho IA:', saveErr);
          }
        });

      },
      error: err => {
        this.loadingDica = false;
        this.dicaGerada = `<p>Erro ao gerar dica: ${err.message || err.statusText}</p>`;
        console.error('Erro na dica IA:', err);
      }
    });
  }

  fecharModal() {
    this.modalAberto = false;
  }
}
