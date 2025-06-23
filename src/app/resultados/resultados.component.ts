import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { marked } from 'marked';

@Component({
  standalone: true,
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDivider,
    MatProgressSpinner,
  ]
})
export class ResultadosComponent implements OnInit {
  dataSelecionada: string = '';
  datasDisponiveis: string[] = [];
  aparelhosDia: any[] = [];
  consumoTotalDia = 0;
  custoTotalNormal = 0;
  custoTotalSocial = 0;

  modalAberto = false;
  loadingDica = false;
  dicaGerada = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.carregarResultados();
  }

  carregarResultados(data?: string) {
    this.api.getResultados(data).subscribe({
      next: (res: any) => {
        this.datasDisponiveis = res.datas_disponiveis || [];
        this.dataSelecionada = res.data_selecionada || (this.datasDisponiveis.length > 0 ? this.datasDisponiveis[0] : '');
        this.aparelhosDia = res.aparelhos || [];
        this.consumoTotalDia = res.consumo_total_dia || 0;
        this.custoTotalNormal = res.custo_total_normal || 0;
        this.custoTotalSocial = res.custo_total_social || 0;
      },
      error: (err) => {
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
# CONTEXTO DE CONSUMO ENERGÉTICO
# Estes são os dados de uma residência para sua análise.

# DADOS DOS APARELHOS
${JSON.stringify(dadosParaIA, null, 2)}

# TOTAIS
- Consumo diário TOTAL: ${this.consumoTotalDia.toFixed(2)} kWh
- Custo diário TOTAL: R$ ${this.custoTotalNormal.toFixed(2)}

---

# SUA TAREFA
Com base no contexto fornecido, gere de 3 a 5 dicas práticas de economia de energia.

# REGRAS DE FORMATAÇÃO E ESTILO (Siga estritamente)
1.  **Introdução:** Escreva uma introdução curta (1 a 2 frases) explicando o objetivo das dicas.
2.  **Corpo das Dicas:** Apresente cada dica como um item de uma lista não ordenada (usando um asterisco '*' no início de cada dica).
3.  **Destaque:** Em cada dica, use negrito (**palavra**) para destacar o aparelho ou a ação principal.
4.  **Linguagem:** Use português do Brasil, de forma clara, objetiva e encorajadora, como se estivesse falando com um usuário comum.
5.  **Análise:** Baseie as dicas nos aparelhos que mais consomem e na bandeira tarifária, se for relevante.
`;

    this.api.gerarDicaIA(mensagem).subscribe({
      next: res => {
        this.loadingDica = false;
        const texto = res?.candidates?.[0]?.content?.parts?.[0]?.text || '<p>Nenhuma dica gerada.</p>';

        this.dicaGerada = marked(texto) as string;

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
