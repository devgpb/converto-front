import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CamposClientesService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/campos-clientes`;

  getStatus(): Observable<{ items: { id: number; nome: string; qtd_clientes: number; ordem?: number }[] }> {
    return this.http.get<{ items: { id: number; nome: string; qtd_clientes: number; ordem?: number }[] }>(`${this.api}/status`);
  }

  addStatus(nome: string): Observable<any> {
    return this.http.post(`${this.api}/status`, { nome });
  }

  getCampanhas(): Observable<{ items: { id: number; nome: string; qtd_clientes: number }[] }> {
    return this.http.get<{ items: { id: number; nome: string; qtd_clientes: number }[] }>(`${this.api}/campanhas`);
  }

  addCampanha(nome: string): Observable<any> {
    return this.http.post(`${this.api}/campanhas`, { nome });
  }

  getFiltros(): Observable<{ status: string[]; campanhas: string[] }> {
    return this.http.get<{ status: string[]; campanhas: string[] }>(`${this.api}/filtros`);
  }

  deleteStatus(id: number): Observable<any> {
    return this.http.delete(`${this.api}/status/${id}`);
  }

  deleteCampanha(id: number): Observable<any> {
    return this.http.delete(`${this.api}/campanhas/${id}`);
  }
  reorderStatus(ids: number[]): Observable<any> {
    return this.http.patch(`${this.api}/status/ordenacao`, { ids });
  }
}
