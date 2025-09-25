import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Enterprise {
  id: string;
  tenant_id: string;
  name: string;
  cnpj?: string | null;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class EnterpriseService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/enterprises`;

  list(): Observable<Enterprise[]> {
    return this.http.get<Enterprise[]>(this.api);
  }

  get(id: string): Observable<Enterprise> {
    return this.http.get<Enterprise>(`${this.api}/${id}`);
  }

  update(id: string, data: Partial<Pick<Enterprise, 'name' | 'cnpj'>>): Observable<Enterprise> {
    return this.http.put<Enterprise>(`${this.api}/${id}`, data);
  }
}
