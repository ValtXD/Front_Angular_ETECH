import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { ContadorService, AiTip } from '../services/contador.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCard, MatCardActions, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {marked} from 'marked';
import {MatProgressSpinner} from '@angular/material/progress-spinner';


export interface ResultadosEvent {
  consumo: number;
  custo: number;
}

@Component({
  selector: 'app-consumo-mensal-listar',
  templateUrl: './consumo-mensal-listar.component.html',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule, MatIcon, MatCard, MatCardTitle, MatCardContent, MatDivider],
  styleUrls: ['./consumo-mensal-listar.component.scss']
})
export class ConsumoMensalListarComponent implements OnInit {
  @Output() resultadosProntos = new EventEmitter<ResultadosEvent>();

  // Suas propriedades originais (sem alterações)
  registros: any[] = [];
  consumoTotal = 0;
  custoTotal = 0;
  consumoAnualTotal = 0;
  custoAnualTotal = 0;
  anosDisponiveis: number[] = [];
  mesesDisponiveis = Array.from({length: 12}, (_, i) => i + 1);
  anoSelecionado: number | null = null;
  mesSelecionado: number | null = null;
  dicaIA: string = '';
  carregandoDica = false;
  modalAberto = false;

  constructor(private contadorService: ContadorService, private router: Router) {
  }

  ngOnInit() {
    this.carregarAnos();
    this.carregarRegistros();
  }

  carregarAnos() {
    const anoAtual = new Date().getFullYear();
    this.anosDisponiveis = [];
    for (let i = anoAtual; i >= anoAtual - 10; i--) {
      this.anosDisponiveis.push(i);
    }
  }

  carregarRegistros() {
    const params: any = {};
    if (this.anoSelecionado) params.ano = this.anoSelecionado.toString();
    if (this.mesSelecionado) params.mes = this.mesSelecionado.toString();

    this.contadorService.listarConsumos(params).subscribe(res => {
      // A SUA LÓGICA DE NEGÓCIO CONTINUA EXATAMENTE IGUAL
      this.registros = res.registros;
      this.consumoTotal = res.consumo_total;
      this.custoTotal = res.custo_total;
      this.consumoAnualTotal = this.registros.reduce((acc, r) => acc + this.calcularConsumoAnual(r), 0);
      this.custoAnualTotal = this.registros.reduce((acc, r) => acc + ((r.total_pagar ?? 0) * 12), 0);

      // 3. NO FINAL, AVISE O PAI COM OS RESULTADOS
      this.resultadosProntos.emit({consumo: this.consumoTotal, custo: this.custoTotal});
    });
  }

  onFiltroAlterado() {
    this.carregarRegistros();
  }

  calcularConsumoAnual(registro: any): number {
    return Number(registro.consumo_kwh ?? 0) * 12;
  }

  voltar() {
    this.router.navigate(['/consumo-mensal-calcular']);
  }

  irParaGrafico() {
    this.router.navigate(['/grafico-contador']);
  }

  novo() {
    this.router.navigate(['/consumo-mensal-calcular']);
  }

  abrirModal() {
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  gerarDica() {
    if (this.registros.length === 0) {
      alert('Nenhum registro para gerar dica.');
      return;
    }

    const consumos = this.registros.map(r => r.consumo_kwh);
    const custos = this.registros.map(r => r.total_pagar);
    const mediaConsumo = consumos.reduce((a, b) => a + b, 0) / consumos.length;
    const mediaCusto = custos.reduce((a, b) => a + b, 0) / custos.length;
    const maxConsumo = Math.max(...consumos);
    const minConsumo = Math.min(...consumos);

    const mensagemParaIA = `
INFORMAÇÕES PARA ANÁLISE DE CONSUMO DE ENERGIA ELÉTRICA

Por favor, analise os dados a seguir e forneça recomendações detalhadas para economizar energia.

##DADOS:
- Período analisado: ${this.registros.length} meses
- Consumo médio mensal: ${mediaConsumo.toFixed(2)} kWh
- Custo médio mensal: R$ ${mediaCusto.toFixed(2)}
- Maior consumo: ${maxConsumo} kWh
- Menor consumo: ${minConsumo} kWh

DETALHES POR MÊS:
${this.registros.map(r =>
      `- ${r.mes}/${r.ano}: ${r.consumo_kwh} kWh (R$ ${r.total_pagar}) ${r.bandeira_cor ? '| Bandeira: ' + r.bandeira_cor : ''}`
    ).join('\n')}

---

## REQUISITOS PARA A ANÁLISE E RECOMENDAÇÕES:
1.  **Identificar padrões:** Analise o consumo ao longo dos meses para encontrar tendências ou picos.
2.  **Impacto das bandeiras:** Avalie como as bandeiras tarifárias afetaram os custos totais.
3.  **Comparação:** Compare os meses de maior e menor consumo para entender as diferenças.
4.  **Medidas para meses críticos:** Sugira ações específicas para reduzir o consumo nos períodos de maior gasto.
5.  **Estimativa de economia:** Calcule o potencial de economia com as medidas propostas.
6.  **Hábitos de economia:** Recomende hábitos gerais para reduzir o uso de energia.
7.  **Horários de consumo:** Inclua dicas sobre os melhores horários para usar energia, se aplicável.

## FORMATO DA RESPOSTA DESEJADO:
A resposta deve ser clara, organizada em tópicos e conter pelo menos 5 recomendações específicas.
`;

    this.carregandoDica = true;
    this.contadorService.gerarDicaIA(mensagemParaIA).subscribe({
      next: async (res) => { // Make the 'next' callback async
        this.carregandoDica = false;
        if (res.candidates && res.candidates.length > 0) {
          const dicaBrutaIA = res.candidates[0].content.parts[0].text;

          // AWAIT the result of marked.parse() as it might return a Promise
          try {
            this.dicaIA = await marked.parse(dicaBrutaIA);
          } catch (parseError) {
            console.error('Erro ao parsear Markdown com marked.js:', parseError);
            this.dicaIA = 'Erro ao formatar a dica. Detalhes no console.';
            // Fallback to raw text if parsing fails
            // this.dicaIA = dicaBrutaIA;
          }

          // Salvar a dica gerada no backend (salve a versão bruta ou a HTML, dependendo da sua necessidade)
          this.contadorService.saveAiTip({text: dicaBrutaIA}).subscribe({
            next: (savedTip) => {
              console.log('Dica salva com sucesso:', savedTip);
            },
            error: (saveErr) => {
              console.error('Erro ao salvar dica IA:', saveErr);
            }
          });
        } else {
          this.dicaIA = 'Nenhuma resposta obtida da IA.';
        }
        this.abrirModal();
      },
      error: (err) => {
        console.error('Erro ao gerar dica IA:', err);
        this.carregandoDica = false;
        this.dicaIA = 'Erro ao gerar dica. Verifique o console para detalhes.';
        this.abrirModal();
      }
    });
  }
}
