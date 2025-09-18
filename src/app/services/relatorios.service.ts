import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RelatorioVendedorPayload {
  id_usuario?: string;
  periodo?: 'hoje' | 'semana' | 'mes' | [string, string];
}

export interface SerieDia { date: string; count: number }

export interface RelatorioVendedorResponse {
  success: boolean;
  data: {
    periodo: { inicio: string; fim: string; tz: string };
    vendedor: { id_usuario: string; nome: string; role: string };
    clientes: {
      totalResponsavel: number;
      novosPeriodo: number;
      atendidosPeriodo: number;
      orcamentosEnviadosPeriodo: number;
      vendasFechadasPeriodo: number;
      tempoMedioFechamentoDias: number | null;
      taxaConversaoPeriodo: number;
      statusDistribution: { status: string; count: number }[];
      campanhaDistribution: { campanha: string; count: number }[];
      atendimentosPorDia: SerieDia[];
    };
    ligacoes: {
      total: number;
      atendidas: number;
      naoAtendidas: number;
      taxaAtendimento: number;
      porDia: SerieDia[];
      topClientes: { id_cliente: string; nome: string | null; count: number }[];
    };
    eventos: { total: number; confirmados: number; pendentes: number };
  };
}

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/relatorios`;

  relatorioVendedor(payload: RelatorioVendedorPayload): Observable<RelatorioVendedorResponse> {
    return this.http.post<RelatorioVendedorResponse>(`${this.api}/vendedor`, payload);
  }
}

