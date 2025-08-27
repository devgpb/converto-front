import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/tenants`;

  createTenant(data: { name: string; email: string; enterprise_name?: string }): Observable<any> {
    return this.http.post<any>(this.api, data);
  }

  getTenant(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }
}

