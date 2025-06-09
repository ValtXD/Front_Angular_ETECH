// src/app/services/documento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProcessarDocumentoResponse {
  tipo: string;
  dados: any[];
  erros: string[];
}

export interface CalculoResponse {
  resultados: any[];
  total_consumo: number;
  total_custo_normal: number;
  total_custo_social: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private baseUrl = 'http://localhost:8000/api'; // ajuste conforme seu backend

  constructor(private http: HttpClient) {}

  processarDocumento(file: File): Observable<ProcessarDocumentoResponse> {
    const formData = new FormData();
    formData.append('arquivo', file);
    return this.http.post<ProcessarDocumentoResponse>(`${this.baseUrl}/processar-documento/`, formData);
  }

  calcularCustos(
    tipo: string,
    dados: any[],
    estadoId: number | null,
    bandeiraId: number | null,
    tarifaSocial: boolean
  ): Observable<CalculoResponse> {
    return this.http.post<CalculoResponse>(`${this.baseUrl}/calcular-custos/`, {
      tipo,
      dados,
      estado_id: estadoId,
      bandeira_id: bandeiraId,
      tarifa_social: tarifaSocial
    });
  }

  listarEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/estados/`);
  }

  listarBandeiras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bandeiras/`);
  }

  // --- NOVO MÉTODO: Chama o endpoint do seu backend para gerar a dica de IA ---
  gerarDicaIA(payload: {
    tipo_documento: string;
    dados_originais: any[];
    resultados_calculo: CalculoResponse;
    estado_id: number | null;
    bandeira_id: number | null;
    tarifa_social_ativa: boolean;
  }): Observable<any> {
    // Este payload é enviado para o seu backend, que por sua vez se comunica com a API Gemini
    return this.http.post(`${this.baseUrl}/gerar-dica-documento/`, payload);
  }
}
