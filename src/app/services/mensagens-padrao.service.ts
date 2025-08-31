import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MensagemPadrao {
  idMensagem?: number;
  nome: string;
  mensagem: string;
}

export interface ListaMensagensResponse {
  sucesso: boolean;
  total: number;
  pagina: number;
  limite: number;
  dados: MensagemPadrao[];
}

export interface MensagemResponse {
  sucesso: boolean;
  mensagem: string;
  dado: MensagemPadrao;
}

@Injectable({ providedIn: 'root' })
export class MensagensPadraoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/mensagens-padrao`;

  listar(q = '', page = 1, limit = 50): Observable<ListaMensagensResponse> {
    return this.http.get<ListaMensagensResponse>(this.api, {
      params: { q, page, limit }
    });
  }

  criar(payload: { nome: string; mensagem: string }): Observable<MensagemResponse> {
    return this.http.post<MensagemResponse>(this.api, payload);
  }

  atualizar(id: number, payload: Partial<MensagemPadrao>): Observable<MensagemResponse> {
    return this.http.put<MensagemResponse>(`${this.api}/${id}`, payload);
  }

  remover(id: number): Observable<{ sucesso: boolean; mensagem: string }> {
    return this.http.delete<{ sucesso: boolean; mensagem: string }>(`${this.api}/${id}`);
  }
}

