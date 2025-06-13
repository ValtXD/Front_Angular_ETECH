import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OcrContadorQrService, Estado, Bandeira } from '../services/ocr-contador-qr.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leitura-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leitura-qr.component.html',
  styleUrls: ['./leitura-qr.component.css'],
})
export class LeituraQrComponent implements OnInit {
  qrData = 'http://172.23.80.1:4200/leitura-qr'; // Ajuste para seu IP

  estados: Estado[] = [];
  bandeiras: Bandeira[] = [];

  imagemSelecionada?: File;
  previewUrl: string | ArrayBuffer | null = null;

  textoOCR: string = '';
  valorExtraido: number | null = null;
  valorCorrigido: number | null = null;

  estadoSelecionadoId: number | null = null;
  bandeiraSelecionadaId: number | null = null;
  tarifaSocial: boolean = false;

  mensagem: string = '';

  constructor(private ocrContadorQrService: OcrContadorQrService, private router: Router) {}

  ngOnInit(): void {
    this.ocrContadorQrService.getEstados().subscribe((dados) => (this.estados = dados));
    this.ocrContadorQrService.getBandeiras().subscribe((dados) => (this.bandeiras = dados));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagemSelecionada = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          this.previewUrl = e.target.result;
        }
      };
      reader.readAsDataURL(this.imagemSelecionada);

      this.textoOCR = '';
      this.valorExtraido = null;
      this.valorCorrigido = null;
      this.mensagem = '';
    }
  }

  processarOCR(): void {
    if (!this.imagemSelecionada) {
      this.mensagem = 'Selecione uma imagem para processar.';
      return;
    }

    this.ocrContadorQrService.enviarImagemOCR(this.imagemSelecionada).subscribe({
      next: (res) => {
        if (!res || !res.texto) {
          this.mensagem = 'Nenhum texto retornado pelo OCR.';
          this.textoOCR = '';
          this.valorExtraido = null;
          this.valorCorrigido = null;
          return;
        }

        this.textoOCR = res.texto;
        const match = this.textoOCR.match(/[\d.,]+/);
        if (match) {
          this.valorExtraido = parseFloat(match[0].replace(',', '.'));
          this.valorCorrigido = this.valorExtraido;
          this.mensagem = '';
        } else {
          this.textoOCR = '';
          this.valorExtraido = null;
          this.valorCorrigido = null;
          this.mensagem = 'Nenhum valor numérico encontrado no OCR.';
        }
      },
      error: () => {
        this.mensagem = 'Erro ao processar OCR.';
        this.textoOCR = '';
        this.valorExtraido = null;
        this.valorCorrigido = null;
      },
    });
  }

  salvarLeitura(): void {
    if (!this.podeSalvar) {
      this.mensagem = 'Preencha todos os campos corretamente.';
      return;
    }

    this.ocrContadorQrService
      .salvarLeitura({
        valor_extraido: this.valorExtraido ?? 0,
        valor_corrigido: this.valorCorrigido!,
        estado_id: this.estadoSelecionadoId!,
        bandeira_id: this.bandeiraSelecionadaId!,
        tarifa_social: this.tarifaSocial,
        imagem: this.imagemSelecionada!,
      })
      .subscribe({
        next: () => {
          this.mensagem = 'Leitura salva com sucesso!';
          this.resetarForm();
        },
        error: () => {
          this.mensagem = 'Erro ao salvar leitura.';
        },
      });
  }

  resetarForm(): void {
    this.imagemSelecionada = undefined;
    this.previewUrl = null;
    this.textoOCR = '';
    this.valorExtraido = null;
    this.valorCorrigido = null;
    this.estadoSelecionadoId = null;
    this.bandeiraSelecionadaId = null;
    this.tarifaSocial = false;
    this.mensagem = '';
  }

  get podeSalvar(): boolean {
    return (
      this.valorCorrigido !== null &&
      this.estadoSelecionadoId !== null &&
      this.bandeiraSelecionadaId !== null &&
      this.imagemSelecionada !== undefined
    );
  }
}

