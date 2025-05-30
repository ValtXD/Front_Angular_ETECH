import { Component } from '@angular/core';
import { DocumentoService, ProcessarDocumentoResponse } from '../services/documento.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-documento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-documento.component.html',
  styleUrls: ['./upload-documento.component.css']
})
export class UploadDocumentoComponent {
  arquivo?: File;
  tipoDocumento = '';
  dados: any[] = [];
  erros: string[] = [];
  carregando = false;

  constructor(private docService: DocumentoService, private router: Router) {}

  onArquivoChange(event: any) {
    if (event.target.files.length > 0) {
      this.arquivo = event.target.files[0];
      this.processarArquivo();
    }
  }

  processarArquivo() {
    if (!this.arquivo) return;
    this.carregando = true;
    this.dados = [];
    this.erros = [];
    this.tipoDocumento = '';

    this.docService.processarDocumento(this.arquivo).subscribe({
      next: (res: ProcessarDocumentoResponse) => {
        this.tipoDocumento = res.tipo;
        this.dados = res.dados;
        this.erros = res.erros;
        this.carregando = false;
      },
      error: () => {
        alert('Erro ao processar o arquivo.');
        this.carregando = false;
      }
    });
  }
  //Somente pra baixar o Template (Facilita pro Usuário)
  baixarTemplate(tipo: string, formato: string) {
    const url = `http://localhost:8000/baixar-template/${tipo}/${formato}/`;
    const link = document.createElement('a');
    link.href = url;
    link.download = tipo === 'contador' ? `modelo_contador.${formato}` : `modelo_aparelho.${formato}`;  // Nome do arquivo para download(Caso de modificação)
    link.click();
  }

  irParaResultados() {
    if (this.dados.length === 0 || this.erros.length > 0){
      alert('Não há dados válidos para mostrar resultados.');
      return;
    }

    this.router.navigate(['/resultados-documento'], {
      state: {
        tipoDocumento: this.tipoDocumento,
        dados: this.dados
      }
    });
  }
}
