import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  registros: any[];          // ideal definir uma interface detalhada para registro, ex: ConsumoMensal
  consumo_total: number;
  custo_total: number;
  consumo_anual_estimado?: number;
  custo_anual_estimado?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContadorService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/estados/`);
  }

  getBandeiras(): Observable<Bandeira[]> {
    return this.http.get<Bandeira[]>(`${this.baseUrl}/bandeiras/`);
  }

  calcularConsumo(data: any): Observable<ConsumoMensal> {
    return this.http.post<ConsumoMensal>(`${this.baseUrl}/consumo-mensal/`, data);
  }

  listarConsumos(): Observable<{
    registros: ConsumoMensal[],
    consumo_total: number,
    custo_total: number,
    consumo_anual_estimado?: number,
    custo_anual_estimado?: number
  }> {
    return this.http.get<{
      registros: ConsumoMensal[],
      consumo_total: number,
      custo_total: number,
      consumo_anual_estimado?: number,
      custo_anual_estimado?: number
    }>(`${this.baseUrl}/resultados-contador/`);
  }

  deletar(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/deletar-consumo-mensal/${id}/`, {});
  }

  obterDadosGrafico(): Observable<{ labels: string[], consumos: number[], custos: number[] }> {
    return this.http.get<{ labels: string[], consumos: number[], custos: number[] }>(`${this.baseUrl}/grafico-contador/`);
  }

  listarConsumosComFiltro(params: any): Observable<ResultadoConsumoResponse> {
    return this.http.get<ResultadoConsumoResponse>(`${this.baseUrl}/resultados-contador/`, { params });
  }

}
