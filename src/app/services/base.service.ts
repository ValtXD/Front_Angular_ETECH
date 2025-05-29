import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class BaseService {
  private baseUrl: string = 'http://localhost:8000/api/login/';
  private baseUrl2 = 'http://localhost:8000api/register/';
  private http = inject(HttpClient);

  getAll<T>(endpoint: string): Observable<T[]> {
    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${endpoint}`).pipe(
      map(response => response.results),
      catchError(this.handleError)
    );
  }

  getObject<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  postObject<T>(endpoint: string, object: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}/`, object).pipe(
      catchError(this.handleError)
    );
  }

  updateObject<T>(endpoint: string, id: string, object: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}/`, object).pipe(
      catchError(this.handleError)
    );
  }

  deleteObject(endpoint: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.log('Erro detalhado:', error);

    let errorMessage = 'Ocorreu um erro na requisição';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
