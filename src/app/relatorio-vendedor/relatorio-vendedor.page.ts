import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RelatoriosService, RelatorioVendedorResponse } from '../services/relatorios.service';
import { AuthService } from '../services/auth.service';
import { SeatsService } from '../services/seats.service';

@Component({
  selector: 'app-relatorio-vendedor',
  templateUrl: './relatorio-vendedor.page.html',
  styleUrls: ['./relatorio-vendedor.page.scss'],
  standalone: false,
})
export class RelatorioVendedorPage implements OnInit {
  private fb = inject(FormBuilder);
  private relatorios = inject(RelatoriosService);
  private auth = inject(AuthService);
  private seats = inject(SeatsService);

  form!: FormGroup;
  usuarios: any[] = [];
  loading = false;
  error: string | null = null;

  isAdmin = false;
  currentUserId: string | null = null;

  data = signal<RelatorioVendedorResponse['data'] | null>(null);

  // chart data (simple series)
  ligSeries: { x: string[]; y: number[] } = { x: [], y: [] };
  atdSeries: { x: string[]; y: number[] } = { x: [], y: [] };

  ngOnInit(): void {
    this.form = this.fb.group({
      id_usuario: [''],
      periodo: ['hoje'],
      start: [''],
      end: [''],
    });
    this.isAdmin = this.auth.isAdmin();
    this.currentUserId = this.auth.getUserId();
    // Default do seletor: usuário atual
    this.form.patchValue({ id_usuario: this.currentUserId || '' });
    this.carregarUsuarios();
  }

  private carregarUsuarios(): void {
    this.usuarios = [];
    if (!this.isAdmin) return; // membros não escolhem outro vendedor
    const tenantId = this.auth.getTenantId();
    if (!tenantId) return;
    this.seats.getUsage(tenantId).subscribe({
      next: (usage: any) => {
        const all = (usage?.users || []).filter((u: any) => !!u);
        this.usuarios = all.filter((u: any) => this.getUserId(u) !== this.currentUserId);
      },
      error: () => (this.usuarios = []),
    });
  }

  setPreset(p: 'hoje' | 'semana' | 'mes'): void {
    this.form.patchValue({ periodo: p, start: '', end: '' });
    // limpar relatório, sem pesquisar automaticamente
    this.data.set(null);
  }

  periodoCustom(): boolean {
    return this.form.value.periodo === 'custom';
  }

  buscar(): void {
    this.loading = true;
    this.error = null;
    const { id_usuario, periodo, start, end } = this.form.value;

    const payload: any = { id_usuario: id_usuario || undefined };
    if (periodo === 'custom' && start && end) {
      payload.periodo = [String(start), String(end)];
    } else if (periodo && periodo !== 'custom') {
      payload.periodo = periodo;
    }

    this.relatorios.relatorioVendedor(payload).subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.prepareSeries();
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.error || 'Falha ao carregar relatório';
        this.loading = false;
      },
    });
  }

  private prepareSeries(): void {
    const d = this.data();
    if (!d) {
      this.ligSeries = { x: [], y: [] };
      this.atdSeries = { x: [], y: [] };
      return;
    }
    const lig = d.ligacoes?.porDia || [];
    const atd = d.clientes?.atendimentosPorDia || [];
    this.ligSeries = { x: lig.map((i) => i.date), y: lig.map((i) => Number(i.count || 0)) };
    this.atdSeries = { x: atd.map((i) => i.date), y: atd.map((i) => Number(i.count || 0)) };
  }

  getUserId(u: any): string | null {
    return (u?.id_usuario || u?.user_id || u?.id || null) ? String(u.id_usuario || u.user_id || u.id) : null;
  }
}
