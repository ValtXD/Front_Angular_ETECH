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
  private baseUrl = 'http://localhost:8000/api';

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

  gerarDicaIA(mensagem: string): Observable<any> {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyClP7PDzQR6AYg1hH7RZoNiZ-reoiQrNrs';

    const body = {
      contents: [{
        parts: [{
          text: mensagem
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 2000,
        topP: 0.9,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    };

    return this.http.post(url, body, {
      headers: {'Content-Type': 'application/json'}
    });
  }
}
