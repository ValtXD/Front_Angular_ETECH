import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  imagem: string | undefined;
  tarifa_valor_kwh: number | null;
  id: number;
  valor_extraido: number;
  valor_corrigido: number;
  estado: Estado;
  bandeira: Bandeira;
  tarifa_social: boolean;
  data_registro: string;
  imagem_url?: string | null;
  consumo_entre_leituras?: number | null;
  custo_total?: number | null;
  texto_ocr_bruto?: string | null; // caso adicione no backend
}

export interface OcrResponse {
  valor?: number;
  texto?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OcrContadorService {
  private baseUrl = 'http://localhost:8000'; // ajuste seu backend

  constructor(private http: HttpClient) {}

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/api/estados/`);
  }

  getBandeiras(): Observable<Bandeira[]> {
    return this.http.get<Bandeira[]>(`${this.baseUrl}/api/bandeiras/`);
  }

  enviarImagemOCR(imagem: File): Observable<OcrResponse> {
    const formData = new FormData();
    formData.append('imagem', imagem);
    return this.http.post<OcrResponse>(`${this.baseUrl}/ocr-gemini/`, formData);
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
    return this.http.post<LeituraOCR>(`${this.baseUrl}/api/leituras-ocr/`, formData);
  }

  listarLeituras(mes?: string, ano?: string): Observable<LeituraOCR[]> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes);
    if (ano) params = params.set('ano', ano);
    return this.http.get<LeituraOCR[]>(`${this.baseUrl}/api/leituras-ocr/`, { params });
  }

  removerLeitura(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/leituras-ocr/${id}/`);
  }
}
