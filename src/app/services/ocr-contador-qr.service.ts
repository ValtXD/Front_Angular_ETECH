import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Estado {
  id: number;
  nome: string;
}

export interface Bandeira {
  id: number;
  cor: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root',
})
export class OcrContadorQrService {
  private baseUrl = 'http://192.168.0.4:8000/api'; // Ajuste a URL do seu backend

  constructor(private http: HttpClient) {}

  // Método para pegar os estados
  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/estados/`);
  }

  // Método para pegar as bandeiras
  getBandeiras(): Observable<Bandeira[]> {
    return this.http.get<Bandeira[]>(`${this.baseUrl}/bandeiras/`);
  }

  // Método para enviar a imagem e processar OCR no backend
  enviarImagemOCR(imagem: File): Observable<{ texto: string }> {
    const formData = new FormData();
    formData.append('imagem', imagem);

    return this.http.post<{ texto: string }>('http://192.168.0.4:8000/ocr/', formData);
  }

  // Método para salvar a leitura (dados extraídos do OCR, estado, bandeira, etc.)
  salvarLeitura(data: {
    valor_extraido: number;
    valor_corrigido: number;
    estado_id: number;
    bandeira_id: number;
    tarifa_social: boolean;
    imagem: File;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('valor_extraido', data.valor_extraido.toString());
    formData.append('valor_corrigido', data.valor_corrigido.toString());
    formData.append('estado_id', data.estado_id.toString());
    formData.append('bandeira_id', data.bandeira_id.toString());
    formData.append('tarifa_social', data.tarifa_social ? 'true' : 'false');
    formData.append('imagem', data.imagem);

    // Envia a leitura para o backend para ser salva
    return this.http.post(`${this.baseUrl}/leituras-ocr/`, formData);
  }
}
