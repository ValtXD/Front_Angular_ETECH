// src/app/consumo-mensal-listar/consumo-mensal-listar.component.ts

import { Component, OnInit } from '@angular/core';
import { ContadorService, ConsumoMensal } from '../services/contador.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consumo-mensal-listar',
  templateUrl: './consumo-mensal-listar.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./consumo-mensal-listar.component.css']
})
export class ConsumoMensalListarComponent implements OnInit {
  registros: ConsumoMensal[] = [];
  consumoTotal = 0;
  custoTotal = 0;
  consumoAnualTotal = 0;
  custoAnualTotal = 0;

  anosDisponiveis: number[] = [];
  mesesDisponiveis = Array.from({ length: 12 }, (_, i) => i + 1);

  anoSelecionado: number | null = null;
  mesSelecionado: number | null = null;

  dicaIA: string = '';
  carregandoDica = false;

  modalAberto = false; // controle do modal

  constructor(private contadorService: ContadorService, private router: Router) {}

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

    this.contadorService.listarConsumosComFiltro(params).subscribe(res => {
        this.registros = res.registros;

        this.consumoTotal = res.consumo_total;
        this.custoTotal = res.custo_total;

        this.consumoAnualTotal = this.registros.reduce((acc, r) => acc + this.calcularConsumoAnual(r), 0);
        this.custoAnualTotal = this.registros.reduce((acc, r) => acc + ((r.total_pagar ?? 0) * 12), 0);
      },
      error => {
        console.error('Erro ao carregar registros:', error);
        // Opcional: Tratar o erro no frontend (ex: exibir mensagem para o usuário)
        this.registros = [];
        this.consumoTotal = 0;
        this.custoTotal = 0;
        this.consumoAnualTotal = 0;
        this.custoAnualTotal = 0;
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

    // Certifique-se de que os valores numéricos são tratados como números
    const consumos = this.registros.map(r => Number(r.consumo_kwh));
    const custos = this.registros.map(r => Number(r.total_pagar));

    const mediaConsumo = consumos.length > 0 ? consumos.reduce((a, b) => a + b, 0) / consumos.length : 0;
    const mediaCusto = custos.length > 0 ? custos.reduce((a, b) => a + b, 0) / custos.length : 0;
    const maxConsumo = consumos.length > 0 ? Math.max(...consumos) : 0;
    const minConsumo = consumos.length > 0 ? Math.min(...consumos) : 0;

    // Prepare os dados para enviar ao backend.
    const registrosFormatadosParaBackend = this.registros.map(r => ({
      mes: r.mes,
      ano: r.ano,
      consumo_kwh: r.consumo_kwh,
      total_pagar: r.total_pagar,
      bandeira_cor: r.bandeira_cor,
      estado_nome: r.estado_nome,
    }));


    const payloadParaBackend = {
      registros: registrosFormatadosParaBackend,
      consumo_total: this.consumoTotal,
      custo_total: this.custoTotal,
      media_consumo: mediaConsumo,
      media_custo: mediaCusto,
      max_consumo: maxConsumo,
      min_consumo: minConsumo,
    };

    this.carregandoDica = true;
    this.contadorService.gerarDicaIA(payloadParaBackend).subscribe({
      next: (res) => {
        this.carregandoDica = false;
        // A resposta do backend já deve vir com a dica formatada em 'dica'
        this.dicaIA = res?.dica || 'Nenhuma resposta obtida da IA.';
        this.abrirModal();
      },
      error: (err) => {
        console.error('Erro ao gerar dica IA:', err);
        this.carregandoDica = false;
        // Exiba a mensagem de erro que vem do backend para o usuário
        this.dicaIA = `Erro ao gerar dica. Detalhes: ${err.error?.details || err.error?.error || 'Erro desconhecido.'}`;
        this.abrirModal();
      }
    });
  }
}
