import { Component, OnInit, inject } from '@angular/core';
import { JobsService } from '../services/jobs.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.page.html',
  styleUrls: ['./jobs.page.scss'],
  standalone: false,
})
export class JobsPage implements OnInit {
  private jobsService = inject(JobsService);
  private alertController = inject(AlertController);
  jobs: any[] = [];
  loading = false;

  // Paginação e busca (padrão similar ao ListaClientesComponent)
  total = 0;
  totalPages = 1;
  page = 1;
  pageSize = 10; // padrão solicitado: 10
  searchTerm = '';

  metadataOpen = false;
  metadataLoading = false;
  metadata: { label: string; value: any }[] = [];
  selectedJob: any = null;
  jobDetails: any = null;
  jobErrors: { linha?: number; motivo?: string }[] = [];

  ngOnInit(): void {
    this.fetch();
  }

  ionViewWillEnter(): void {
    this.fetch();
  }

  private buildParams(extra: any = {}) {
    const base: any = {
      page: this.page,
      perPage: this.pageSize,
    };
    if (extra.fromSearch) {
      base.search = this.searchTerm || '';
    }
    return { ...base, ...extra };
  }

  fetch(): void {
    this.loading = true;
    this.jobsService.listUserJobs(this.buildParams()).subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? [];
        const meta = resp?.meta ?? { total: data.length, page: 1, perPage: data.length, totalPages: 1 };
        this.jobs = data;
        this.total = meta.total ?? data.length;
        this.totalPages = meta.totalPages ?? 1;
        this.page = meta.page ?? 1;
        this.pageSize = meta.perPage ?? this.pageSize;
        this.loading = false;
      },
      error: () => {
        this.jobs = [];
        this.total = 0;
        this.totalPages = 1;
        this.page = 1;
        this.loading = false;
      },
    });
  }

  pesquisaAvancada(resetPage = false): void {
    if (resetPage) this.page = 1;
    this.loading = true;
    this.jobsService.listUserJobs(this.buildParams({ fromSearch: true })).subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? [];
        const meta = resp?.meta ?? { total: data.length, page: 1, perPage: data.length, totalPages: 1 };
        this.jobs = data;
        this.total = meta.total ?? data.length;
        this.totalPages = meta.totalPages ?? 1;
        this.page = meta.page ?? 1;
        this.pageSize = meta.perPage ?? this.pageSize;
        this.loading = false;
      },
      error: () => {
        this.jobs = [];
        this.total = 0;
        this.totalPages = 1;
        this.page = 1;
        this.loading = false;
      },
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    const filtrando = !!this.searchTerm;
    filtrando ? this.pesquisaAvancada() : this.fetch();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    const filtrando = !!this.searchTerm;
    filtrando ? this.pesquisaAvancada() : this.fetch();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.page = 1;
    this.fetch();
  }

  viewData(job: any): void {
    this.selectedJob = job;
    this.metadataOpen = true;
    this.metadataLoading = false; // usamos os dados já carregados
    const result = job?.returnvalue ?? null;
    this.jobDetails = { ...job, result };
    this.metadata = Array.isArray(result?.metadata) ? result.metadata : [];
    const erros = result?.summary?.erros;
    this.jobErrors = Array.isArray(erros) ? erros : [];
  }

  closeMetadata(): void {
    this.metadataOpen = false;
  }

  translateQueue(queue: string): string {
    const map: Record<string, string> = {
      'import-clients': 'Importar Clientes',
      'export-clients': 'Exportar Clientes',
    };
    return map[queue] ?? queue;
  }

  translateState(job: any): string {
    const map: Record<string, string> = {
      waiting: 'Aguardando',
      active: 'Em execução',
      completed: 'Concluído',
      failed: 'Erro',
    };
    return map[job.state] ?? job.state;
  }

  statusColor(state: string): string {
    switch (state) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'active':
        return 'warning';
      case 'waiting':
        return 'medium';
      default:
        return 'primary';
    }
  }

  // Helpers para exportação
  isExport(job: any): boolean {
    const q = job?.queue || job?.queueName;
    return q === 'export-clients';
  }

  getExportLink(job: any): string | null {
    return job?.exportLink || job?.returnvalue?.signedUrl || null;
  }

  getExportExpiry(job: any): Date | null {
    const iso = job?.exportExpiresAt || job?.returnvalue?.expiresAt || null;
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  isExpired(job: any): boolean {
    const exp = this.getExportExpiry(job);
    if (!exp) return false; // sem expiração definida, não desabilita
    return Date.now() > exp.getTime();
  }

  async downloadExport(job: any): Promise<void> {
    const link = this.getExportLink(job);
    const expired = this.isExpired(job);
    if (!link || expired) {
      const alert = await this.alertController.create({
        header: 'Link indisponível',
        message: expired ? 'O link de download expirou. Gere uma nova exportação.' : 'Não há link de download disponível.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    try {
      window.open(link, '_blank');
    } catch {
      const alert = await this.alertController.create({
        header: 'Falha ao abrir o link',
        message: 'Não foi possível abrir o link de download. Tente copiar e colar no navegador.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (this.total === 0) return 0;
    return Math.min(this.page * this.pageSize, this.total);
  }
}
