import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ModalController, SegmentValue } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  CalendarioDay,
  CalendarioFilters,
  CalendarioResponse,
  CalendarioService,
  CalendarioStatus,
} from '../services/calendario.service';
import { AuthService } from '../services/auth.service';
import { UsuariosService, Usuario } from '../services/usuarios.service';
import { ListaEventosComponent } from './lista-eventos/lista-eventos.component';

type CalendarView = 'dia' | 'semana' | 'mes';

interface MonthCell {
  day: CalendarioDay | null;
  outside: boolean;
}

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: false,
})
export class CalendarioPage implements OnInit, OnDestroy {
  private calendarioService = inject(CalendarioService);
  private auth = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private modalCtrl = inject(ModalController);
  private activeRequest?: Subscription;

  readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Maceio';
  readonly todayIso = this.formatDate(new Date());
  readonly statusOptions: Array<{ value: CalendarioStatus; label: string }> = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'confirmado', label: 'Confirmados' },
    { value: 'cancelado', label: 'Cancelados' },
  ];
  readonly weekdayHeaders = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly currentUserId = this.auth.getUserId();

  viewMode: CalendarView = 'semana';
  selectedDateIso = this.todayIso;
  filters: { status: CalendarioStatus; usuario: string } = {
    status: 'todos',
    usuario: 'all',
  };
  userOptions: Array<{ label: string; value: string }> = [{ label: 'Todos os usuários', value: 'all' }];
  usersLoading = false;
  usersError: string | null = null;

  loading = false;
  error: string | null = null;
  days: CalendarioDay[] = [];
  totals: CalendarioResponse['totals'] = { eventos: 0 };
  range: CalendarioResponse['range'] | null = null;

  ngOnInit(): void {
    if (this.canFilterUsers) {
      this.loadUsers();
    } else if (this.currentUserId) {
      this.filters.usuario = this.currentUserId;
    }
    this.fetchCalendario();
  }

  ngOnDestroy(): void {
    this.activeRequest?.unsubscribe();
  }

  get canFilterUsers(): boolean {
    return this.auth.isAdmin();
  }

  get currentLabel(): string {
    const { start, end } = this.computeRangeDates();
    if (this.viewMode === 'dia') {
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(start);
    }
    if (this.viewMode === 'semana') {
      const startLabel = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
      }).format(start);
      const endLabel = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: start.getMonth() === end.getMonth() ? undefined : 'short',
      }).format(end);
      return `Semana de ${startLabel} a ${endLabel}`;
    }
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(start);
  }

  get timeZoneLabel(): string {
    return `Fuso: ${this.range?.timezone ?? this.timezone}`;
  }

  get activeDay(): CalendarioDay | null {
    return this.viewMode === 'dia' && this.days.length ? this.days[0] : null;
  }

  get monthGrid(): MonthCell[][] {
    if (this.viewMode !== 'mes' || !this.days.length) {
      return [];
    }
    const base = this.parseISO(this.selectedDateIso);
    const firstDay = new Date(base.getFullYear(), base.getMonth(), 1);
    const totalDays = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const offset = this.mondayIndex(firstDay.getDay());
    const dayMap = new Map<string, CalendarioDay>();
    this.days.forEach((day) => dayMap.set(day.date, day));

    const cells: MonthCell[] = [];
    for (let i = 0; i < offset; i += 1) {
      cells.push({ day: null, outside: true });
    }
    for (let d = 1; d <= totalDays; d += 1) {
      const date = new Date(base.getFullYear(), base.getMonth(), d);
      const key = this.formatDate(date);
      const day = dayMap.get(key) ?? this.buildDayStub(date);
      cells.push({ day, outside: false });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, outside: true });
    }
    const weeks: MonthCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }

  get hasEvents(): boolean {
    return this.days.some((day) => day.events.length > 0);
  }

  setViewMode(value: SegmentValue | null | undefined): void {
    const view = typeof value === 'string' ? (value as CalendarView) : null;
    const allowed: CalendarView[] = ['dia', 'semana', 'mes'];
    if (!view || !allowed.includes(view) || view === this.viewMode) {
      return;
    }
    this.viewMode = view;
    this.fetchCalendario();
  }

  onDateChange(value: string | null | undefined): void {
    if (!value) return;
    this.selectedDateIso = value;
    this.fetchCalendario();
  }

  onStatusChange(value: CalendarioStatus | null | undefined): void {
    if (!value) return;
    this.filters.status = value;
    this.fetchCalendario();
  }

  onUserChange(value: string | null | undefined): void {
    if (value === null || value === undefined) return;
    this.filters.usuario = value;
    this.fetchCalendario();
  }

  applyFilters(): void {
    this.fetchCalendario();
  }

  clearFilters(): void {
    this.filters = {
      status: 'todos',
      usuario: this.canFilterUsers ? 'all' : this.currentUserId ?? '',
    };
    this.fetchCalendario();
  }

  goToToday(): void {
    this.selectedDateIso = this.todayIso;
    this.fetchCalendario();
  }

  navigate(direction: 'prev' | 'next'): void {
    const base = this.parseISO(this.selectedDateIso);
    const delta = direction === 'next' ? 1 : -1;
    if (this.viewMode === 'dia') {
      base.setDate(base.getDate() + delta);
    } else if (this.viewMode === 'semana') {
      base.setDate(base.getDate() + delta * 7);
    } else {
      base.setMonth(base.getMonth() + delta);
    }
    this.selectedDateIso = this.formatDate(base);
    this.fetchCalendario();
  }

  trackByDate(_: number, day: CalendarioDay): string {
    return day.date;
  }

  async openDayEvents(day: CalendarioDay | null | undefined): Promise<void> {
    if (!day) return;
    const modal = await this.modalCtrl.create({
      component: ListaEventosComponent,
      componentProps: { day },
      canDismiss: true,
      breakpoints: [0, 0.6, 0.95],
      initialBreakpoint: 0.8,
    });
    await modal.present();
  }

  eventStatusClass(evento: any): string {
    if (evento.confirmado === true) return 'status-confirmado';
    if (evento.confirmado === false) return 'status-cancelado';
    return 'status-pendente';
  }

  private fetchCalendario(): void {
    const { inicio, fim } = this.computeRangeStrings();
    const payload: CalendarioFilters = {
      inicio,
      fim,
      status: this.filters.status,
      tz: this.timezone,
    };

    if (this.canFilterUsers) {
      const userFilter = (this.filters.usuario || '').trim();
      if (userFilter === 'all') {
        payload.id_usuario = 'all';
      } else if (userFilter) {
        payload.id_usuario = userFilter;
      }
    }

    this.loading = true;
    this.error = null;
    this.activeRequest?.unsubscribe();
    this.activeRequest = this.calendarioService.getCalendario(payload).subscribe({
      next: (response) => {
        this.days = response.days ?? [];
        this.totals = response.totals ?? { eventos: 0 };
        this.range = response.range ?? null;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.days = [];
        this.totals = { eventos: 0 };
        this.range = null;
        this.error = err?.error?.error ?? 'Erro ao carregar o calendário';
      },
    });
  }

  private loadUsers(): void {
    this.usersLoading = true;
    this.usersError = null;
    this.usuariosService.listAll().subscribe({
      next: (usuarios: Usuario[]) => {
        const tenantId = this.auth.getTenantId();
        const options = usuarios
          .filter((usuario) => {
            if (!tenantId) return true;
            const userTenant = usuario.tenant_id !== undefined ? String(usuario.tenant_id) : null;
            return userTenant === tenantId;
          })
          .map((usuario) => {
            const id =
              usuario.id_usuario ??
              (usuario.id !== undefined ? String(usuario.id) : undefined) ??
              (usuario.user_id !== undefined ? String(usuario.user_id) : undefined);
            if (!id) {
              return null;
            }
            const label = usuario.name || usuario.email || id;
            return { label, value: id };
          })
          .filter((entry): entry is { label: string; value: string } => Boolean(entry));
        this.userOptions = [{ label: 'Todos os usuários', value: 'all' }, ...options];
        if (!this.filters.usuario || !options.some((opt) => opt.value === this.filters.usuario)) {
          this.filters.usuario = 'all';
        }
        this.usersLoading = false;
      },
      error: () => {
        this.userOptions = [{ label: 'Todos os usuários', value: 'all' }];
        this.usersLoading = false;
        this.usersError = 'Não foi possível carregar os usuários.';
      },
    });
  }

  private computeRangeStrings(): { inicio: string; fim: string } {
    const { start, end } = this.computeRangeDates();
    return { inicio: this.formatDate(start), fim: this.formatDate(end) };
  }

  private computeRangeDates(): { start: Date; end: Date } {
    const base = this.parseISO(this.selectedDateIso);
    if (this.viewMode === 'dia') {
      return { start: base, end: base };
    }
    if (this.viewMode === 'semana') {
      const start = new Date(base);
      const offset = this.mondayIndex(start.getDay());
      start.setDate(start.getDate() - offset);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { start, end };
  }

  private parseISO(value: string): Date {
    if (!value) return new Date();
    const parts = value.split('-').map((part) => Number(part));
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) {
      return new Date();
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mondayIndex(day: number): number {
    return (day + 6) % 7;
  }

  private buildDayStub(date: Date): CalendarioDay {
    const iso = this.formatDate(date);
    return {
      date: iso,
      label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date),
      weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date),
      startUtc: new Date(`${iso}T00:00:00Z`).toISOString(),
      endUtc: new Date(`${iso}T23:59:59Z`).toISOString(),
      events: [],
      total: 0,
    };
  }
}
