import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeatsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/seats`;

  sync(tenantId: string): Observable<any> {
    return this.http.post<any>(`${this.api}/sync`, { tenant_id: tenantId });
  }

  getUsage(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/usage/${tenantId}`);
  }

  add(tenantId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.api}/add`, { tenant_id: tenantId, user_id: userId });
  }

  remove(tenantId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.api}/remove`, { tenant_id: tenantId, user_id: userId });
  }
}

