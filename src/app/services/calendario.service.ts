import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CalendarioStatus = 'todos' | 'pendente' | 'confirmado' | 'cancelado';

export interface CalendarioCliente {
  id_cliente: string | number;
  nome: string;
  celular: string | null;
  cidade: string | null;
  status: string | null;
  campanha: string | null;
}

export interface CalendarioUsuario {
  id_usuario: string | number;
  nome: string;
}

export interface CalendarioEvento {
  id_evento: number;
  id_usuario: string | number;
  id_cliente: string | number;
  evento: string | null;
  confirmado: boolean | null;
  data_utc: string;
  data_local: string;
  hora_local: string;
  dia_local: string;
  cliente: CalendarioCliente | null;
  usuario: CalendarioUsuario | null;
}

export interface CalendarioDay {
  date: string;
  label: string;
  weekday: string;
  startUtc: string;
  endUtc: string;
  events: CalendarioEvento[];
  total: number;
}

export interface CalendarioRange {
  inicio_local: string;
  fim_local: string;
  inicio_utc: string;
  fim_utc: string;
  timezone: string;
  dias: number;
}

export interface CalendarioResponse {
  range: CalendarioRange;
  filters: {
    id_usuario: string | null;
    id_cliente: string | null;
    status: CalendarioStatus;
  };
  totals: {
    eventos: number;
  };
  days: CalendarioDay[];
}

export interface CalendarioFilters {
  inicio: string;
  fim: string;
  status?: CalendarioStatus;
  id_usuario?: string | null;
  id_cliente?: string | null;
  tz?: string;
}

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/calendario`;

  getCalendario(filters: CalendarioFilters): Observable<CalendarioResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const normalized = typeof value === 'string' ? value.trim() : value;
      if (normalized === '') return;
      params = params.set(key, String(normalized));
    });
    return this.http.get<CalendarioResponse>(this.api, { params });
  }
}
