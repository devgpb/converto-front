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

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/api/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          this.token$.next(res.token);
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

  logout(): void {
    this.token$.next(null);
    this.router.navigate(['/login']);
  }
}
