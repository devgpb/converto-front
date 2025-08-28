import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoSugestao = 'Comentário' | 'Sugestão' | 'Bug';

export interface SugestaoPayload {
  tipo: TipoSugestao;
  mensagem: string; // até 800 caracteres
}

@Injectable({ providedIn: 'root' })
export class SugestoesService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/sugestoes`;

  enviarSugestao(payload: SugestaoPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.api, payload);
  }
}

