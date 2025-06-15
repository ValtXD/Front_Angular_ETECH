import { Component, OnInit, OnDestroy } from '@angular/core';
import { OcrContadorService, LeituraOCR } from '../services/ocr-contador.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {Router, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-lista-leituras',
  templateUrl: './lista-leituras.component.html',
  styleUrls: ['./lista-leituras.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    DatePipe,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ]
})
export class ListaLeiturasComponent implements OnInit, OnDestroy {
  leituras: LeituraOCR[] = [];
  estados: { id: number; nome: string }[] = [];
  filtroMes: string = '';
  filtroAno: string = '';
  filtroEstadoId: number | null = null;
  anos: string[] = [];
  meses = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  // Colunas a serem exibidas na tabela Angular Material
  displayedColumns: string[] = ['data', 'estado', 'valorExtraido', 'valorCorrigido', 'custoEstimado', 'imagem', 'acoes'];

  medias = {
    valorExtraidoMedia: 0,
    valorCorrigidoMedia: 0,
    diferencaValorCorrigidoMedia: null as number | null,
    diferencaCustoEstimadoMedia: null as number | null,
  };

  private pollingSubscription?: Subscription;
  baseUrl = 'http://localhost:8000'; // Ajuste esta URL se seu backend não estiver em localhost:8000

  constructor(
    private ocrContadorService: OcrContadorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual; i >= anoAtual - 5; i--) {
      this.anos.push(i.toString());
    }

    this.carregarLeituras();
    this.carregarEstados();

    this.pollingSubscription = interval(5000)
      .pipe(switchMap(() => this.ocrContadorService.listarLeituras(this.filtroMes, this.filtroAno, this.filtroEstadoId)))
      .subscribe(data => {
        this.leituras = data;
        this.calcularMediasPorEstado();
      });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  carregarLeituras(): void {
    this.ocrContadorService.listarLeituras(this.filtroMes, this.filtroAno, this.filtroEstadoId).subscribe(data => {
      this.leituras = data;
      this.calcularMediasPorEstado();
    });
  }

  carregarEstados(): void {
    this.ocrContadorService.getEstados().subscribe(data => {
      this.estados = data;
    });
  }

  aplicarFiltro(): void {
    this.carregarLeituras();
  }

  calcularMediasPorEstado(): void {
    if (this.filtroEstadoId === null || this.leituras.length === 0) {
      this.medias = {
        valorExtraidoMedia: 0,
        valorCorrigidoMedia: 0,
        diferencaValorCorrigidoMedia: null,
        diferencaCustoEstimadoMedia: null,
      };
      return;
    }

    const leiturasEstado = this.leituras
      .filter(l => l.estado?.id === this.filtroEstadoId)
      .sort((a, b) => new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime());

    if (leiturasEstado.length === 0) {
      this.medias = {
        valorExtraidoMedia: 0,
        valorCorrigidoMedia: 0,
        diferencaValorCorrigidoMedia: null,
        diferencaCustoEstimadoMedia: null,
      };
      return;
    }

    const valorExtraidoTotal = leiturasEstado.reduce((acc, cur) => acc + cur.valor_extraido, 0);
    const valorCorrigidoTotal = leiturasEstado.reduce((acc, cur) => acc + cur.valor_corrigido, 0);
    const custoEstimadoTotal = leiturasEstado.reduce((acc, cur) => acc + (cur.custo_total || 0), 0);

    const valorExtraidoMedia = valorExtraidoTotal / leiturasEstado.length;
    const valorCorrigidoMedia = valorCorrigidoTotal / leiturasEstado.length;

    const primeiraLeitura = leiturasEstado[0];
    const ultimaLeitura = leiturasEstado[leiturasEstado.length - 1];
    const diferencaValorCorrigidoMedia = ultimaLeitura.valor_corrigido - primeiraLeitura.valor_corrigido;
    const diferencaCustoEstimadoMedia = (ultimaLeitura.custo_total || 0) - (primeiraLeitura.custo_total || 0);

    this.medias = {
      valorExtraidoMedia,
      valorCorrigidoMedia,
      diferencaValorCorrigidoMedia,
      diferencaCustoEstimadoMedia,
    };
  }

  getImagemUrl(imagemUrl?: string): string | null {
    if (!imagemUrl) return null;
    if (imagemUrl.startsWith('http://') || imagemUrl.startsWith('https://')) {
      return imagemUrl;
    }
    return `${this.baseUrl}${imagemUrl}`;
  }


  voltarParaUpload(): void {
    this.router.navigate(['/upload']);
  }

  confirmarRemocao(id: number): void {
    if (confirm('Tem certeza que deseja remover esta leitura? Essa ação não pode ser desfeita.')) {
      this.ocrContadorService.removerLeitura(id).subscribe({
        next: () => {
          alert('Leitura removida com sucesso!');
          this.carregarLeituras();
        },
        error: (err) => {
          const errorMessage = err.error?.message || err.error?.detail || 'Erro ao remover leitura.';
          alert(errorMessage);
        }
      });
    }
  }
}
