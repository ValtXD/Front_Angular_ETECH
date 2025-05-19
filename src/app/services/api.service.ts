// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ambiente } from '../models/ambiente';
import { Estado } from '../models/estado';
import { Bandeira } from '../models/bandeira';
import { Aparelho } from '../models/aparelho';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api'; // ajuste conforme seu backend

  constructor(private http: HttpClient) {}

  getAmbientes(): Observable<Ambiente[]> {
    return this.http.get<Ambiente[]>(`${this.baseUrl}/ambientes/`);
  }

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/estados/`);
  }

  getBandeiras(): Observable<Bandeira[]> {
    return this.http.get<Bandeira[]>(`${this.baseUrl}/bandeiras/`);
  }

  getAparelhos(data?: string): Observable<Aparelho[]> {
    let params = new HttpParams();
    if (data) params = params.set('data', data);
    return this.http.get<Aparelho[]>(`${this.baseUrl}/aparelhos/`, { params });
  }

  criarAparelho(payload: any) {
    return this.http.post(`${this.baseUrl}/aparelhos/`, payload);
  }

  removerAparelho(id: number) {
    return this.http.delete(`${this.baseUrl}/aparelhos/${id}/`);
  }

  // Único método para resultados, traz aparelhos, totais e datas
  getResultados(data?: string): Observable<any> {
    let params = new HttpParams();
    if (data) params = params.set('data', data);
    return this.http.get<any>(`${this.baseUrl}/resultados/`, { params });
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
}
