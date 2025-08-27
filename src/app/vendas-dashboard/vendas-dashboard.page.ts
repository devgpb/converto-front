import { Component, OnInit, signal } from '@angular/core';
import { VendasService } from 'src/app/services/vendas/vendas.service';
import { IDashboardVendas } from 'src/app/interfaces/IDashboardVendas';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexTooltip,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexResponsive,
} from 'ng-apexcharts';



type ChartOptionsLine = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  fill: ApexFill;
};

type ChartOptionsBar = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  fill: ApexFill;
};

type ChartOptionsDonut = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
};

type ModalKind = 'novos' | 'atendidos' | 'fechados' | 'eventos' | null;

@Component({
  selector: 'app-vendas-dashboard',
  templateUrl: './vendas-dashboard.page.html',
  styleUrls: ['./vendas-dashboard.page.scss'],
  standalone: false,
})
export class VendasDashboardPage implements OnInit {
  data = signal<IDashboardVendas | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedPeriod = signal<'hoje' | 'semana' | 'mes'>('hoje');
  statusChart = signal<ChartOptionsBar | null>(null);
  campanhaChart = signal<ChartOptionsDonut | null>(null);
  contatosChart = signal<ChartOptionsLine | null>(null);
  range = { start: null as string | null, end: null as string | null };
  rangeError: string | null = null;
  get rangeValid() {
    return !!this.range.start && !!this.range.end && !this.rangeError;
  }

  modalOpen = signal<boolean>(false);
  modalKind = signal<ModalKind>(null);
  modalLoading = signal<boolean>(false);
  modalError = signal<string | null>(null);
  modalItems = signal<any[]>([]);
  modalMeta = signal<any>(null);
  modalPage = signal<number>(1);
  readonly modalPerPage = 12;

  constructor(private api: VendasService) {}

  ngOnInit(): void {
    this.fetch();
  }

  openModal(kind: Exclude<ModalKind, null>) {
    this.modalKind.set(kind);
    this.modalPage.set(1);
    this.modalOpen.set(true);
    this.fetchModal();
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  nextPage() {
    const meta = this.modalMeta();
    if (!meta) return;
    if (meta.page < meta.totalPages) {
      this.modalPage.set(meta.page + 1);
      this.fetchModal();
    }
  }

  prevPage() {
    const meta = this.modalMeta();
    if (!meta) return;
    if (meta.page > 1) {
      this.modalPage.set(meta.page - 1);
      this.fetchModal();
    }
  }

  private fetchModal() {
    const kind = this.modalKind();
    if (!kind) return;

    this.modalLoading.set(true);
    this.modalError.set(null);

    const periodo = this.periodoPayload();
    const page = this.modalPage();
    const perPage = this.modalPerPage;

    let req$: import('rxjs').Observable<any>;
    switch (kind) {
      case 'novos':
        req$ = this.api.getClientesNovosList(periodo, page, perPage);
        break;
      case 'atendidos':
        req$ = this.api.getClientesAtendidosList(periodo, page, perPage);
        break;
      case 'fechados':
        req$ = this.api.getClientesFechadosList(periodo, page, perPage);
        break;
      case 'eventos':
        req$ = this.api.getEventosMarcadosList(periodo, page, perPage);
        break;
    }

    req$?.subscribe({
      next: (res: any) => {
        this.modalItems.set(res.data ?? []);
        this.modalMeta.set(res.meta ?? null);
        this.modalLoading.set(false);
      },
      error: () => {
        this.modalError.set('Erro ao carregar a lista');
        this.modalLoading.set(false);
      },
    });
  }

  setPeriod(p: 'hoje' | 'semana' | 'mes') {
    if (this.selectedPeriod() !== p) {
      this.selectedPeriod.set(p);
      this.range = { start: null, end: null };
      this.rangeError = null;
      this.fetch();
      this.fetchModal();
    }
  }

  private fetch() {
    this.loading.set(true);
    this.error.set(null);
    const periodo = this.periodoPayload();

    this.api.getAtendimento(periodo).subscribe({
      next: (res) => {
        this.data.set(res);
        this.buildStatusChart(res);
        this.buildCampanhaChart(res);
        this.buildContatosChart(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar dados do dashboard');
        this.loading.set(false);
      },
    });
  }

  private buildStatusChart(d: IDashboardVendas) {
    const ordered = [...(d.statusDistribution || [])].sort((a, b) => b.count - a.count);
    const labels = ordered.map((s) => s.status || 'Sem status');
    const values = ordered.map((s) => s.count);

    this.statusChart.set({
      series: [{ name: 'Clientes', data: values }],
      chart: { type: 'bar', height: 360, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
      dataLabels: {
        enabled: true,
        style: { fontSize: '16px', fontWeight: 'bold', colors: ['#fff'] },
        dropShadow: { enabled: true, top: 1, left: 1, blur: 2, color: '#000', opacity: 0.7 },
      },
      stroke: { show: false },
      xaxis: { categories: labels, labels: { rotate: 0 } },
      tooltip: { y: { formatter: (val: number) => `${val} clientes` } },
      fill: { opacity: 1 },
    });
  }

  private buildCampanhaChart(d: IDashboardVendas) {
    const map = new Map<string, number>();

    for (const it of d.campanhaDistribution ?? []) {
      const rotuloRaw = (it.campanha ?? 'Sem campanha').trim();
      const rotulo = rotuloRaw.length ? rotuloRaw : 'Sem campanha';
      const key = rotulo.toLowerCase();
      const val = Number(it.count ?? 0);
      map.set(key, (map.get(key) ?? 0) + (isFinite(val) ? val : 0));
    }

    if (map.size === 0) {
      map.set('sem campanha', 0);
    }

    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([k]) =>
      k === 'sem campanha' ? 'Sem campanha' : k.replace(/\b\w/g, (c) => c.toUpperCase())
    );
    const values = entries.map(([, v]) => v);
    const series = labels.map((_, i) => Number(values[i] ?? 0));

    this.campanhaChart.set({
      series,
      chart: { type: 'donut', height: 360, toolbar: { show: false } },
      labels,
      legend: { position: 'bottom' },
      dataLabels: {
        enabled: true,
        style: { fontSize: '16px', fontWeight: 'bold', colors: ['#fff'] },
        dropShadow: { enabled: true, top: 1, left: 1, blur: 2, color: '#000', opacity: 0.7 },
      },
      tooltip: { y: { formatter: (val: number) => `${val} clientes` } },
      responsive: [{ breakpoint: 1024, options: { legend: { position: 'bottom' } } }],
    });
  }

  private buildContatosChart(d: IDashboardVendas) {
    const items = (d.contatosPorDia ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
    const labels = items.map((i) =>
      new Date(i.date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
    );
    const values = items.map((i) => Number(i.count || 0));

    this.contatosChart.set({
      series: [{ name: 'Contatos/dia', data: values }],
      chart: { type: 'area', height: 360, toolbar: { show: false } },
      xaxis: { categories: labels, labels: { rotate: 0 } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      tooltip: { y: { formatter: (val: number) => `${val} contato${val === 1 ? '' : 's'}` } },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.2,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
    });
  }

  formatDate(d?: string | null) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR');
  }

  modalTitle() {
    const k = this.modalKind();
    return k === 'novos'
      ? 'Clientes novos'
      : k === 'atendidos'
      ? 'Clientes atendidos'
      : k === 'fechados'
      ? 'Clientes fechados'
      : k === 'eventos'
      ? 'Eventos marcados'
      : '';
  }

  isClientList() {
    return this.modalKind() === 'novos' || this.modalKind() === 'atendidos' || this.modalKind() === 'fechados';
  }

  statusPillClass(status?: string | null) {
    const s = (status ?? '').toLowerCase();
    if (['fechado', 'vendido'].includes(s)) return 'bg-green-100 text-green-700';
    if (['aguardando', 'pendente', 'novo'].includes(s)) return 'bg-orange-100 text-orange-700';
    if (['em negociação', 'negociando', 'atendido'].includes(s)) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  }

  short(t?: string | null, max = 140) {
    if (!t) return '';
    return t.length > max ? t.slice(0, max - 1) + '…' : t;
  }

  private periodoPayload(): 'hoje' | 'semana' | 'mes' | [string, string] {
    if (this.rangeValid) {
      return [this.range.start!, this.range.end!]; // já são YYYY-MM-DD
    }
    return this.selectedPeriod();
  }


  onRangeChange(which: 'start' | 'end', value: string) {
    this.range[which] = value || null;
    const start = this.range.start ? new Date(this.range.start) : null;
    const end = this.range.end ? new Date(this.range.end) : null;
    this.rangeError = this.validateRange(start, end);
  }


  private validateRange(start: Date | null, end: Date | null): string | null {
    if (!start || !end) return 'Selecione as duas datas';
    if (end < start) return 'Data final não pode ser antes da inicial';
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months > 12 || (months === 12 && end.getDate() > start.getDate())) {
      return 'Intervalo máximo é de 12 meses';
    }
    return null;
  }

  applyRange() {
    if (!this.rangeValid) return;
    this.fetch();
    this.fetchModal();
  }

  private toYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

