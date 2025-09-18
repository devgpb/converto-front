import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioLigacao {
  id_usuario: string;
  name: string;
  email: string;
  role: string;
}

export interface NovaLigacaoPayload {
  id_ligacao?: string;
  id_usuario?: string;
  id_cliente: any;
  data_hora?: string;
  tz?: string;
  atendida: boolean;
  observacao?: string | null;
}

export interface LigacaoRegistro {
  id_ligacao: string;
  id_usuario: string;
  id_cliente: string;
  data_hora: string;
  dataHoraISO?: string;
  dataHoraLocal?: string;
  atendida: boolean;
  observacao?: string | null;
  usuario?: { id_usuario: string; name?: string; email?: string } | null;
}

export interface PaginacaoMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class LigacoesService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/ligacoes`;

  getUsuariosParaLigacao(): Observable<UsuarioLigacao[]> {
    return this.http.get<UsuarioLigacao[]>(`${this.api}/usuarios`);
  }

  getLigacoesDoUsuario(params: { [key: string]: any }): Observable<any[]> {
    return this.http.get<any[]>(this.api, { params });
  }

  salvarLigacao(payload: NovaLigacaoPayload): Observable<any> {
    return this.http.post<any>(this.api, payload);
  }

  getLigacoesDoCliente(
    idCliente: string | number,
    params: { page?: number; perPage?: number; tz?: string } = {}
  ): Observable<{ data: LigacaoRegistro[]; meta: PaginacaoMeta }> {
    const httpParams: any = {};
    if (params.page) httpParams.page = params.page;
    if (params.perPage) httpParams.perPage = params.perPage;
    if (params.tz) httpParams.tz = params.tz;
    return this.http.get<{ data: LigacaoRegistro[]; meta: PaginacaoMeta }>(
      `${this.api}/cliente/${idCliente}`,
      { params: httpParams }
    );
  }
}
