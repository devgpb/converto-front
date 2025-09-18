import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IDashboardVendas } from 'src/app/interfaces/IDashboardVendas';

export interface PaginationMeta {
  total: number; page: number; perPage: number; totalPages: number;
}

export type ApiResponse<T> = { success: boolean; data: T };
export type PaginatedResponse<T> = { success: boolean; meta: PaginationMeta; data: T[] };

export type PeriodoPayload = 'hoje' | 'semana' | 'mes' | [string, string];

export type ClienteItem = {
  nome: string;
  updatedAt: string;
  status: string | null;
  observacao: string | null;
  fechado?: string | null;
  ultimoContato?: string | null;
};

export type EventoItem = {
  data: string;
  evento: string | null;
  confirmado: boolean;
  usuario?: { nomeCompleto: string | null } | null;
  cliente: { nome: string | null } | null;
};

export type LigacaoItem = {
  idLigacao: string;
  dataHora: string;
  atendida: boolean;
  observacao?: string | null;
  usuario?: { name: string | null } | null;
  cliente?: { nome: string | null } | null;
};

export type EventoUsuarioDTO = {
  idEvento: number;
  idUsuario?: number;
  idCliente?: number;
  data: string;
  dataLocal?: string;
  evento?: string | null;
  confirmado?: boolean | null;
  cliente?: { nome?: string | null } | null;
};

@Injectable({ providedIn: 'root' })
export class VendasService {
  private base = `${environment.apiUrl}/clientes/dashboard`;

  constructor(private http: HttpClient) {}

  getAtendimento(periodo: PeriodoPayload): Observable<IDashboardVendas> {
    return this.http
      .post<ApiResponse<IDashboardVendas>>(this.base, { periodo })
      .pipe(map(r => r.data));
  }

  getClientesNovosList(periodo: PeriodoPayload, page: number, perPage: number) {
    return this.http.post<PaginatedResponse<ClienteItem>>(
      `${this.base}/clientes-novos`, { periodo, page, perPage }
    );
  }

  getClientesAtendidosList(periodo: PeriodoPayload, page: number, perPage: number) {
    return this.http.post<PaginatedResponse<ClienteItem>>(
      `${this.base}/clientes-atendidos`, { periodo, page, perPage }
    );
  }

  getClientesFechadosList(periodo: PeriodoPayload, page: number, perPage: number) {
    return this.http.post<PaginatedResponse<ClienteItem>>(
      `${this.base}/clientes-fechados`, { periodo, page, perPage }
    );
  }

  getEventosMarcadosList(periodo: PeriodoPayload, page: number, perPage: number) {
    return this.http.post<PaginatedResponse<EventoItem>>(
      `${this.base}/eventos-marcados`, { periodo, page, perPage }
    );
  }

  getLigacoesEfetuadasList(periodo: PeriodoPayload, page: number, perPage: number) {
    return this.http.post<PaginatedResponse<LigacaoItem>>(
      `${this.base}/ligacoes-efetuadas`, { periodo, page, perPage }
    );
  }

  getContatos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/vendas`);
  }

  marcarContato(dados: any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.apiUrl}/automacao/marcarContato`, dados);
  }

  confirmarEvento(idEvento: any) {
    return this.http.post<any[]>(`${environment.apiUrl}/clientes/eventos/${idEvento}/confirmar`, {});
  }

  cancelarEvento(idEvento: any) {
    return this.http.post<any[]>(`${environment.apiUrl}/clientes/eventos/${idEvento}/cancelar`, {});
  }

  getEventosUsuario(
    idUsuario: number,
    opts: { hoje?: boolean; tz?: string; confirmados?: boolean } = {}
  ): Observable<EventoUsuarioDTO[]> {
    const params: any = {
      idUsuario,
      ...(opts.hoje !== undefined ? { hoje: String(!!opts.hoje) } : {}),
      ...(opts.tz ? { tz: opts.tz } : {}),
      ...(opts.confirmados !== undefined ? { confirmados: String(!!opts.confirmados) } : {}),
    };
    return this.http.get<EventoUsuarioDTO[]>(
      `${environment.apiUrl}/clientes/eventos`,
      { params }
    );
  }

  getEventosIntervalo(
    inicio: string,
    fim: string,
    tz = 'America/Maceio'
  ): Observable<(EventoItem & { dataISO?: string; dataLocal?: string })[]> {
    return this.http.get<(EventoItem & { dataISO?: string; dataLocal?: string })[]>(
      `${environment.apiUrl}/eventos/intervalo`,
      { params: { inicio, fim, tz } }
    );
  }
}

