import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContadorEnergia {
  id: number;
  estado: string;
  bandeira: string;
  tarifa_social: boolean;
  consumo_kwh: number;
  total_pagar: number;
  data_registro: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContadorEnergiaService {
  private apiUrl = 'http://localhost:8000/api/contador-energia/';

  constructor(private http: HttpClient) {}

  listar(): Observable<ContadorEnergia[]> {
    return this.http.get<ContadorEnergia[]>(this.apiUrl);
  }

  criar(payload: any): Observable<ContadorEnergia> {
    return this.http.post<ContadorEnergia>(this.apiUrl, payload);
  }

  deletar(id: number): Observable<any> {
    return this.http.post(`http://localhost:8000/api/deletar-registro-contador/${id}/`, {});
  }
}
