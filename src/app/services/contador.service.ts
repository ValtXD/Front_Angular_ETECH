import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

export interface Estado {
  id: number;
  nome: string;
  tarifa:{
    valor_kwh: number;
  };
}

export interface Bandeira {
  id: number;
  cor: string;
  valor_adicional: number;
  descricao: string;
}

export interface ConsumoMensal {
  id: number;
  ano: number;
  mes: number;
  estado: Estado;
  bandeira: Bandeira;
  leitura_inicial: number;
  leitura_final: number;
  consumo_kwh: number;
  total_pagar: number;
  tarifa_social: boolean;
}

interface ResultadoConsumoResponse {
  registros: ConsumoMensal[];
  consumo_total: number;
  custo_total: number;
  consumo_anual_estimado?: number;
  custo_anual_estimado?: number;
}

// Nova interface para as dicas da IA
export interface AiTip {
  id?: number;
  text: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContadorService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {
  }

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/estados/`);
  }

  getBandeiras(): Observable<Bandeira[]> {
    return this.http.get<Bandeira[]>(`${this.baseUrl}/bandeiras/`);
  }

  criar(data: any): Observable<ConsumoMensal> {
    return this.http.post<ConsumoMensal>(`${this.baseUrl}/consumo-mensal/`, data);
  }

  deletar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/consumo-mensal/${id}/`);
  }

  obterDadosGrafico(): Observable<{ labels: string[], consumos: number[], custos: number[] }> {
    return this.http.get<{
      labels: string[],
      consumos: number[],
      custos: number[]
    }>(`${this.baseUrl}/grafico-contador/`);
  }

  obterDadosGraficoAnual(): Observable<{ labels: string[], consumos: number[], custos: number[] }> {
    return this.http.get<{
      labels: string[],
      consumos: number[],
      custos: number[]
    }>(`${this.baseUrl}/grafico-contador-anual/`);
  }

  listarConsumos(params?: HttpParams | {[key:string]: any}): Observable<ResultadoConsumoResponse> {
    return this.http.get<ResultadoConsumoResponse>(`${this.baseUrl}/resultados-contador/`, { params });
  }

  atualizar(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/consumo-mensal/${id}/`, payload);
  }

  gerarDicaIA(mensagem: string | Promise<string>): Observable<any> {
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

  // Novos métodos para gerenciar as dicas da IA no backend
  saveAiTip(tip: { text: string }): Observable<AiTip> {
    return this.http.post<AiTip>(`${this.baseUrl}/ai-tips/`, tip);
  }

  getAiTips(): Observable<AiTip[]> {
    return this.http.get<AiTip[]>(`${this.baseUrl}/ai-tips/`);
  }

  deleteAiTip(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ai-tips/${id}/`);
  }
}
