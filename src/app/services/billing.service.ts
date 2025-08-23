import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/billing`;

  getStatus(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/status/${tenantId}`);
  }
}

