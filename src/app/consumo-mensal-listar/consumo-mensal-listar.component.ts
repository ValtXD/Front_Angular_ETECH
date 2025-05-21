import { Component, OnInit } from '@angular/core';
import { ContadorService } from '../services/contador.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-consumo-mensal-listar',
  templateUrl: './consumo-mensal-listar.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./consumo-mensal-listar.component.css']
})
export class ConsumoMensalListarComponent implements OnInit {
  registros: any[] = [];
  consumoTotal = 0;
  custoTotal = 0;
  consumoAnualTotal = 0;
  custoAnualTotal = 0;

  anosDisponiveis: number[] = [];
  mesesDisponiveis = Array.from({length: 12}, (_, i) => i + 1);

  anoSelecionado: number | null = null;
  mesSelecionado: number | null = null;

  constructor(private contadorService: ContadorService, private router: Router) {}

  ngOnInit() {
    this.carregarAnos();
    this.carregarRegistros();
  }

  carregarAnos() {
    const anoAtual = new Date().getFullYear();
    this.anosDisponiveis = [];
    for(let i = anoAtual; i >= anoAtual - 10; i--) {
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
}
