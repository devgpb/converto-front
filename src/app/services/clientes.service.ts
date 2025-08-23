import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cliente {
  nome: string ;
  celular: string | null;
  cidade?: string | null;
  status?: string | null;
  indicacao?: string | null;
  campanha?: string | null;
  observacao?: string | null;
  tenant_id?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/clientes`;

  // Lista de campanhas disponíveis (pode ser carregada de uma API futuramente)
  public listaDeCampanhas: string[] = [];

  postCliente(cliente: Cliente): Observable<any> {
    return this.http.post<any>(this.api, cliente);
  }

  getFiltrosClientes(): Observable<{ cidades: string[]; status: string[] }> {
    return this.http.get<{ cidades: string[]; status: string[] }>(`${this.api}/filtros`);
  }
}

