import { Component, OnInit } from '@angular/core';
import { OcrContadorService, Estado, Bandeira } from '../services/ocr-contador.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-upload-imagem',
  templateUrl: './upload-imagem.component.html',
  styleUrls: ['./upload-imagem.component.css'],
  imports: [
    FormsModule
  ],
  standalone: true
})
export class UploadImagemComponent implements OnInit {
  estados: Estado[] = [];
  bandeiras: Bandeira[] = [];

  imagemSelecionada?: File;
  textoOCR: string = '';
  valorExtraido: number | null = null;
  valorCorrigido: number | null = null;
  estadoSelecionadoId?: number;
  bandeiraSelecionadaId?: number;
  tarifaSocial: boolean = false;
  mensagem: string = '';

  constructor(private ocrContadorService: OcrContadorService) {}

  ngOnInit(): void {
    this.ocrContadorService.getEstados().subscribe((estados) => (this.estados = estados));
    this.ocrContadorService.getBandeiras().subscribe((bandeiras) => (this.bandeiras = bandeiras));
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.imagemSelecionada = event.target.files[0];
      this.mensagem = '';
      this.textoOCR = '';
      this.valorExtraido = null;
      this.valorCorrigido = null;
      this.processarOCR();
    }
  }

  processarOCR(): void {
    if (!this.imagemSelecionada) return;

    this.ocrContadorService.enviarImagemOCR(this.imagemSelecionada).subscribe({
      next: (res) => {
        this.textoOCR = res.texto;
        const match = this.textoOCR.match(/[\d.,]+/);
        if (match) {
          this.valorExtraido = parseFloat(match[0].replace(',', '.'));
          this.valorCorrigido = this.valorExtraido;
        } else {
          this.valorExtraido = null;
          this.valorCorrigido = null;
        }
      },
      error: () => {
        this.mensagem = 'Erro ao processar OCR.';
      },
    });
  }

  salvarLeitura(): void {
    if (!this.valorCorrigido || !this.estadoSelecionadoId || !this.bandeiraSelecionadaId || !this.imagemSelecionada) {
      this.mensagem = 'Preencha todos os campos e certifique-se que o OCR extraiu o valor.';
      return;
    }

    this.ocrContadorService
      .salvarLeitura({
        valor_extraido: this.valorExtraido ?? 0,
        valor_corrigido: this.valorCorrigido,
        estado_id: this.estadoSelecionadoId,
        bandeira_id: this.bandeiraSelecionadaId,
        tarifa_social: this.tarifaSocial,
        imagem: this.imagemSelecionada,
      })
      .subscribe({
        next: () => {
          this.mensagem = 'Leitura salva com sucesso!';
          this.resetForm();
        },
        error: () => {
          this.mensagem = 'Erro ao salvar leitura.';
        },
      });
  }

  resetForm(): void {
    this.imagemSelecionada = undefined;
    this.textoOCR = '';
    this.valorExtraido = null;
    this.valorCorrigido = null;
    this.estadoSelecionadoId = undefined;
    this.bandeiraSelecionadaId = undefined;
    this.tarifaSocial = false;
  }
}
