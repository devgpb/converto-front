import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  id: number;
  email: string;
  name: string;
  role: string;
  principal?: boolean;
  tenant?: { id: string; name: string } | null;
  enterprise?: { id: string; name: string } | null;
  seats?: {
    paid: number;
    active_users: number;
    total_users: number;
    available: number;
    subscription_status: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/profile`;

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.api);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.api}/password`, {
      oldPassword,
      newPassword,
    });
  }
}

