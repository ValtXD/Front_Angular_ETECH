import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Estado {
  id: number;
  nome: string;
  sigla: string;
  tarifa_valor_kwh: number;
}

export interface Bandeira {
  id: number;
  cor: string;
  valor_adicional: number;
  descricao: string;
}

export interface LeituraOCR {
  id: number;
  valor_extraido: number;
  valor_corrigido: number;
  estado: Estado;
  bandeira: Bandeira;
  tarifa_social: boolean;
  data_registro: string;
  imagem_url?: string;
  consumo_entre_leituras?: number | null;
  custo_total?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class OcrContadorService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/estados/`);
  }

  getBandeiras(): Observable<Bandeira[]> {
    return this.http.get<Bandeira[]>(`${this.baseUrl}/bandeiras/`);
  }

  enviarImagemOCR(imagem: File): Observable<{ texto: string }> {
    const formData = new FormData();
    formData.append('imagem', imagem);
    return this.http.post<{ texto: string }>(`${this.baseUrl}/ocr/`, formData);
  }

  salvarLeitura(leitura: {
    valor_extraido: number;
    valor_corrigido: number;
    estado_id: number;
    bandeira_id: number;
    tarifa_social: boolean;
    imagem: File;
  }): Observable<LeituraOCR> {
    const formData = new FormData();
    formData.append('valor_extraido', leitura.valor_extraido.toString());
    formData.append('valor_corrigido', leitura.valor_corrigido.toString());
    formData.append('estado_id', leitura.estado_id.toString());
    formData.append('bandeira_id', leitura.bandeira_id.toString());
    formData.append('tarifa_social', leitura.tarifa_social ? 'true' : 'false');
    formData.append('imagem', leitura.imagem);
    return this.http.post<LeituraOCR>(`${this.baseUrl}/leituras-ocr/`, formData);
  }

  listarLeituras(): Observable<LeituraOCR[]> {
    return this.http.get<LeituraOCR[]>(`${this.baseUrl}/leituras-ocr/`);
  }
}
