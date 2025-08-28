import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id?: number;
  user_id?: number;
  email: string;
  name: string;
  role: string;
  tenant_id?: number;
  principal?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/usuarios`;

  create(email: string, password: string, name: string): Observable<Usuario> {
    return this.http.post<Usuario>(this.api, { email, password, name });
  }

  changeRole(id: number | string, role: string): Observable<{ id: number; role: string }> {
    return this.http.patch<{ id: number; role: string }>(`${this.api}/${id}/role`, { role });
  }
}
