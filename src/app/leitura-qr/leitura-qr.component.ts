import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OcrContadorQrService, Estado, Bandeira } from '../services/ocr-contador-qr.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leitura-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leitura-qr.component.html',
  styleUrls: ['./leitura-qr.component.css'],
})
export class LeituraQrComponent implements OnInit {
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;

  qrData = 'http://10.31.2.225:4200/leitura-qr'; //IP frontend

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

  // Variáveis para o Modal
  showModal: boolean = false;
  modalMessage: string = '';

  constructor(private ocrContadorQrService: OcrContadorQrService, private router: Router) {}

  ngOnInit(): void {
    this.ocrContadorQrService.getEstados().subscribe(dados => this.estados = dados);
    this.ocrContadorQrService.getBandeiras().subscribe(dados => this.bandeiras = dados);
  }

  abrirCamera() {
    this.cameraInput.nativeElement.click();
  }

  abrirGaleria() {
    this.galleryInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagemSelecionada = input.files[0];

      const reader = new FileReader();
      reader.onload = e => this.previewUrl = e.target?.result ?? null;
      reader.readAsDataURL(this.imagemSelecionada);

      this.textoOCR = '';
      this.valorExtraido = null;
      this.valorCorrigido = null;
      this.mensagem = '';
      this.closeModal();
    }
  }

  processarOCR() {
    if (!this.imagemSelecionada) {
      this.mensagem = 'Selecione uma imagem para processar.';
      return;
    }

    this.ocrContadorQrService.enviarImagemOCR(this.imagemSelecionada).subscribe({
      next: res => {
        if (res.error) {
          this.mensagem = res.error;
          this.textoOCR = '';
          this.valorExtraido = null;
          this.valorCorrigido = null;
        } else {
          this.textoOCR = res.texto_ia || '';
          this.valorExtraido = res.valor ?? null;
          this.valorCorrigido = this.valorExtraido;
          this.mensagem = '';
        }
      },
      error: (err) => {
        console.error('Erro no processamento OCR:', err);
        this.mensagem = 'Erro ao processar OCR. Verifique o console para detalhes.';
        this.textoOCR = '';
        this.valorExtraido = null;
        this.valorCorrigido = null;
      }
    });
  }

  get podeSalvar(): boolean {
    return !!(this.valorCorrigido !== null && this.estadoSelecionadoId !== null && this.bandeiraSelecionadaId !== null && this.imagemSelecionada);
  }

  salvarLeitura() {
    if (!this.podeSalvar) {
      this.mensagem = 'Preencha todos os campos corretamente.';
      return;
    }

    this.ocrContadorQrService.salvarLeitura({
      valor_extraido: this.valorExtraido ?? 0,
      valor_corrigido: this.valorCorrigido!,
      estado_id: this.estadoSelecionadoId!,
      bandeira_id: this.bandeiraSelecionadaId!,
      tarifa_social: this.tarifaSocial,
      imagem: this.imagemSelecionada!
    }).subscribe({
      next: () => {
        this.modalMessage = 'Leitura salva com sucesso! Acesse a aplicação no seu computador para visualizar todos os detalhes a partir da imagem enviada.';
        this.showModal = true;
        this.resetarForm();
      },
      error: (err) => {
        console.error('Erro ao salvar leitura:', err);
        this.mensagem = 'Erro ao salvar leitura. Verifique o console para detalhes.';
      }
    });
  }

  resetarForm() {
    this.imagemSelecionada = undefined;
    this.previewUrl = null;
    this.textoOCR = '';
    this.valorExtraido = null;
    this.valorCorrigido = null;
    this.estadoSelecionadoId = null;
    this.bandeiraSelecionadaId = null;
    this.tarifaSocial = false;
    this.mensagem = '';
    this.closeModal();
  }

  irParaLeituras() {
    this.router.navigate(['/leituras']);
  }

  // Novo método para fechar o modal
  closeModal() {
    this.showModal = false;
    this.modalMessage = '';
  }
}
