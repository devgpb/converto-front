import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/billing`;

  checkout(data: {
    tenant_id: string;
    price_id: string;
    seatCountInicial: number;
    success_url: string;
    cancel_url: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.api}/checkout`, data);
  }

  getStatus(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/status/${tenantId}`);
  }

  sync(data: { tenant_id: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/sync`, data);
  }

  cancel(data: { tenant_id: string; motivo?: string; descricao?: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/cancel`, data);
  }

  resume(data: { tenant_id: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/resume`, data);
  }

  reactivate(data: {
    tenant_id: string;
    success_url: string;
    cancel_url: string;
    price_id?: string;
    seatCountInicial?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.api}/reactivate`, data);
  }
}
