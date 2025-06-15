import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ambiente } from '../models/ambiente';
import { Estado } from '../models/estado';
import { Bandeira } from '../models/bandeira';
import { Aparelho } from '../models/aparelho';

// NOVA Interface para as dicas de Aparelhos
export interface ApplianceAiTip {
  id?: number;
  text: string;
  created_at?: string;
}


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api'; // Sua URL base da API// ajuste conforme seu backend

  constructor(private http: HttpClient) {}

  getAparelhoById(id: number): Observable<Aparelho> {
    return this.http.get<Aparelho>(`${this.baseUrl}/aparelhos/${id}/`);
  }

  getAmbientes(): Observable<Ambiente[]> {
    return this.http.get<Ambiente[]>(`${this.baseUrl}/ambientes/`);
  }

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/estados/`);
  }

  getBandeiras(): Observable<Bandeira[]> {
    return this.http.get<Bandeira[]>(`${this.baseUrl}/bandeiras/`);
  }

  atualizarAparelho(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/aparelhos/${id}/`, payload);
  }

  getAparelhos(params?: HttpParams): Observable<Aparelho[]> {
    return this.http.get<Aparelho[]>(`${this.baseUrl}/aparelhos/`, { params });
  }

  criarAparelho(payload: any) {
    return this.http.post(`${this.baseUrl}/aparelhos/`, payload);
  }

  removerAparelho(id: number) {
    return this.http.delete(`${this.baseUrl}/aparelhos/${id}/`);
  }

  getResultados(data?: string): Observable<any> {
    let params = new HttpParams();
    if (data) params = params.set('data', data);
    return this.http.get<any>(`${this.baseUrl}/resultados/`, { params });
  }

  gerarDicaIA(mensagem: string): Observable<any> {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyClP7PDzQR6AYg1hH7RZoNiZ-reoiQrNrs';
    const body = {
      contents: [{
        parts: [{ text: mensagem }]
      }],
      generationConfig: {
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 2048
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    };
    return this.http.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getMonitoramento(params?: any) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/monitoramento/`, { params: httpParams });
  }

  // NOVOS MÉTODOS
  saveApplianceAiTip(tip: { text: string }): Observable<ApplianceAiTip> {
    return this.http.post<ApplianceAiTip>(`${this.baseUrl}/appliance-ai-tips/`, tip);
  }

  getApplianceAiTips(): Observable<ApplianceAiTip[]> {
    return this.http.get<ApplianceAiTip[]>(`${this.baseUrl}/appliance-ai-tips/`);
  }

  deleteApplianceAiTip(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/appliance-ai-tips/${id}/`);
  }
}
