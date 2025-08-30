import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(null);
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    const saved = localStorage.getItem('token');
    if (saved) {
      this.token$.next(saved);
    }
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          this.token$.next(res.token);
          localStorage.setItem('token', res.token);
        })
      );
  }

  register(data: {
    tenant_id: string;
    email: string;
    password: string;
    name: string;
  }): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/register`, data)
      .pipe(
        tap((res) => {
          this.token$.next(res.token);
          localStorage.setItem('token', res.token);
        })
      );
  }

  get token(): string | null {
    return this.token$.value;
  }

  isAuthenticated(): boolean {
    const token = this.token$.value;
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expired = Date.now() > payload.exp * 1000;
      if (expired) {
        this.logout();
      }
      return !expired;
    } catch {
      this.logout();
      return false;
    }
  }

  getTenantId(): string | null {
    const token = this.token$.value;
    if (!token) {
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tenant_id || null;
    } catch {
      return null;
    }
  }

  getUserId(): string | null {
    const token = this.token$.value;
    if (!token) {
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || null;
    } catch {
      return null;
    }
  }

  private getPayload(): any | null {
    const token = this.token$.value;
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const payload = this.getPayload();
    if (!payload) return [];
    let roles: string[] = [];
    if (Array.isArray(payload.roles)) {
      roles = payload.roles as string[];
    } else if (typeof payload.role === 'string') {
      roles = [payload.role];
    } else if (typeof payload.roles === 'string') {
      roles = [payload.roles];
    }
    return roles.map((r) => (r || '').toString().toLowerCase());
  }

  hasRole(role: string): boolean {
    const wanted = (role || '').toLowerCase();
    return this.getRoles().includes(wanted);
  }

  hasAnyRole(roles: string[]): boolean {
    const set = new Set(this.getRoles());
    return roles.map((r) => (r || '').toLowerCase()).some((r) => set.has(r));
  }

  isAdmin(): boolean {
    return this.hasAnyRole(['administrador', 'admin']);
  }

  logout(): void {
    this.token$.next(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
