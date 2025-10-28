import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Tag } from './tags.service';

export interface Cliente {
  id_cliente: number;
  nome: string;
  celular: string | null;
  cidade?: string | null;
  status?: string | null;
  indicacao?: string | null;
  campanha?: string | null;
  observacao?: string | null;
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
  responsavel?: { name: string };
  ultimoContato?: string;
  fechado?: string | null;
  tags?: Tag[];
}

export interface ClientesResponse {
  data: Cliente[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

export interface ClienteEvento {
  id_evento: number;
  idCliente: number;
  data: string;
  dataLocal?: string;
  evento?: string | null;
  confirmado?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/clientes`;

  // Lista de campanhas disponíveis (pode ser carregada de uma API futuramente)
  public listaDeCampanhas: string[] = [];

  postCliente(cliente: Partial<Cliente>): Observable<any> {
    return this.http.post<any>(this.api, cliente);
  }

  getFiltrosClientes(): Observable<{
    cidades: (string | { id: number | string; nome: string })[];
    status: (string | { id: number | string; nome: string })[];
  }> {
    return this.http.get<{
      cidades: (string | { id: number | string; nome: string })[];
      status: (string | { id: number | string; nome: string })[];
    }>(`${this.api}/filtros`);
  }

  getClientes(params: any): Observable<ClientesResponse> {
    // Garante que não envia chaves com undefined/null (ex: tagIds=undefined)
    const clean: Record<string, any> = {};
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((k) => {
        const v = (params as any)[k];
        if (v !== undefined && v !== null && v !== 'undefined') {
          clean[k] = v;
        }
      });
    }
    return this.http.get<ClientesResponse>(this.api, { params: clean });
  }

  getEventosDoCliente(idCliente: number, params: any = {}): Observable<ClienteEvento[]> {
    return this.http.get<ClienteEvento[]>(`${this.api}/${idCliente}/eventos`, { params });
  }

  criarEvento(payload: {
    id_usuario: any;
    id_cliente: number;
    idUsuario?: number;
    data: string;
    evento?: string | null;
    tz?: string;
  }): Observable<ClienteEvento> {
    return this.http.post<ClienteEvento>(`${this.api}/eventos`, payload);
  }

  getClienteById(id: number | string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.api}/${id}`);
  }

  updateClienteTags(id_cliente: number | string, method: 'add' | 'remove', tagIds: Array<string | number>): Observable<{ id_cliente: number | string; tags: Tag[] }> {
    return this.http.post<{ id_cliente: number | string; tags: Tag[] }>(`${this.api}/${id_cliente}/tags`, {
      method,
      tag_ids: tagIds,
    });
  }
}
