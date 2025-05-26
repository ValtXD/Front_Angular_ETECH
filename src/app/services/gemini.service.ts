import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface GeminiResponse {
  candidates: { content: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyClP7PDzQR6AYg1hH7RZoNiZ-reoiQrNrs';

  constructor(private http: HttpClient) {}

  gerarDica(prompt: string): Observable<GeminiResponse> {
    const body = {
      prompt: { text: prompt },
      temperature: 0.7,
      candidateCount: 1,
      maxOutputTokens: 200,
    };

    return this.http.post<GeminiResponse>(this.apiUrl, body);
  }
}
