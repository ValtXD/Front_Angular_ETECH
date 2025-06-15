import { Component, OnInit } from '@angular/core';
import { OcrContadorService, Estado, Bandeira } from '../services/ocr-contador.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-upload-imagem',
  templateUrl: './upload-imagem.component.html',
  styleUrls: ['./upload-imagem.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, MatLabel, MatOption, MatFormField, MatSelect, MatCheckbox],
})
export class UploadImagemComponent implements OnInit {
  estados: Estado[] = [];
  bandeiras: Bandeira[] = [];

  imagemSelecionada?: File;
  textoOCR: string = '';
  valorExtraido: number | null = null;
  valorCorrigido: number | null = null;
  estadoSelecionadoId: number | null = null;
  bandeiraSelecionadaId: number | null = null;
  tarifaSocial: boolean = false;
  mensagem: string = '';

  constructor(private ocrContadorService: OcrContadorService, private router: Router) {}

  ngOnInit(): void {
    this.ocrContadorService.getEstados().subscribe(estados => (this.estados = estados));
    this.ocrContadorService.getBandeiras().subscribe(bandeiras => (this.bandeiras = bandeiras));
  }

  imagemPreviewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.imagemSelecionada = event.target.files[0];
      this.textoOCR = '';
      this.valorExtraido = null;
      this.valorCorrigido = null;
      this.mensagem = '';

      if (this.imagemSelecionada) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagemPreviewUrl = reader.result;
        };
        reader.readAsDataURL(this.imagemSelecionada);
      }
    }
  }
  processarOCR(): void {
    if (!this.imagemSelecionada) {
      this.mensagem = 'Selecione uma imagem primeiro.';
      return;
    }

    this.ocrContadorService.enviarImagemOCR(this.imagemSelecionada).subscribe({
      next: res => {
        if (res.error) {
          this.mensagem = res.error;
          this.textoOCR = '';
          this.valorExtraido = null;
          this.valorCorrigido = null;
        } else {
          this.textoOCR = res.texto || '';
          this.valorExtraido = res.valor || null;
          this.valorCorrigido = this.valorExtraido;
          this.mensagem = '';
        }
      },
      error: () => {
        this.mensagem = 'Erro ao processar a imagem.';
      },
    });
  }

  get podeMostrarBotaoSalvar(): boolean {
    return this.valorCorrigido !== null && this.valorCorrigido !== undefined;
  }

  get podeSalvar(): boolean {
    return (
      this.podeMostrarBotaoSalvar &&
      this.estadoSelecionadoId !== null &&
      this.bandeiraSelecionadaId !== null &&
      this.imagemSelecionada !== undefined
    );
  }

  salvarLeitura(): void {
    if (!this.podeSalvar) {
      this.mensagem = 'Preencha todos os campos e certifique-se que o OCR extraiu o valor.';
      return;
    }

    this.ocrContadorService
      .salvarLeitura({
        valor_extraido: this.valorExtraido!,
        valor_corrigido: this.valorCorrigido!,
        estado_id: this.estadoSelecionadoId!,
        bandeira_id: this.bandeiraSelecionadaId!,
        tarifa_social: this.tarifaSocial,
        imagem: this.imagemSelecionada!,
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
    this.estadoSelecionadoId = null;
    this.bandeiraSelecionadaId = null;
    this.tarifaSocial = false;
  }

  irParaLeituras(): void {
    this.router.navigate(['/leituras']);
  }
}
