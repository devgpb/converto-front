import { Component, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ClientesService, Cliente, ClientesResponse } from '../../services/clientes.service';
import { AuthService } from '../../services/auth.service';
import { ViewPreferenceService } from '../../services/view-preference.service';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss'],
  standalone: false,
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  total = 0;
  totalPages = 1;
  page = 1;
  pageSize = 50;
  carregandoBusca = false;

  viewMode: any = 'cards';


  searchTerm = '';
  statusFilter = 'todos';
  cidadeFilter = 'todas';
  sortBy = 'recente';
  statusUnicos: string[] = [];
  cidadesUnicas: string[] = [];
  meusClientes = new FormControl(false);
  tenantId: string | null;

  clienteSelecionado: Cliente | null = null;
  modalAberto = false;

  private clientesService = inject(ClientesService);
  private authService = inject(AuthService);
  private viewPref = inject(ViewPreferenceService);

  constructor() {
    this.tenantId = this.authService.getTenantId();
  }

  ngOnInit(): void {
    this.viewMode = this.viewPref.getViewMode();
    this.carregarFiltros();
  }

  private buildParams(extra: any = {}) {
    const base: any = {
      page: this.page,
      perPage: this.pageSize,
      sortBy: this.sortBy,
    };

    if (this.meusClientes.value && this.tenantId) {
      base.tenantId = this.tenantId;
    }

    if (extra.fromSearch) {
      base.search = this.searchTerm;
      base.status = this.statusFilter;
      base.cidade = this.cidadeFilter;
    }

    return { ...base, ...extra };
  }

  carregarFiltros(): void {
    this.clientesService.getFiltrosClientes().subscribe(data => {
      this.statusUnicos = data.status || [];
      this.cidadesUnicas = data.cidades || [];
    });
  }

  fetch(): void {
    this.carregandoBusca = true;
    this.clientesService.getClientes(this.buildParams()).subscribe({
      next: (resp: ClientesResponse) => {
        this.clientes = resp.data;
        this.total = resp.meta.total;
        this.totalPages = resp.meta.totalPages;
        this.page = resp.meta.page;
        this.pageSize = resp.meta.perPage;
        this.carregandoBusca = false;
      },
      error: () => (this.carregandoBusca = false),
    });
  }

  pesquisaAvancada(resetPage = false): void {
    if (resetPage) {
      this.page = 1;
    }
    this.carregandoBusca = true;
    this.clientesService.getClientes(this.buildParams({ fromSearch: true })).subscribe({
      next: (resp: ClientesResponse) => {
        this.clientes = resp.data;
        this.total = resp.meta.total;
        this.totalPages = resp.meta.totalPages;
        this.page = resp.meta.page;
        this.pageSize = resp.meta.perPage;
        this.carregandoBusca = false;
      },
      error: () => (this.carregandoBusca = false),
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    const filtrando = !!this.searchTerm || this.statusFilter !== 'todos' || this.cidadeFilter !== 'todas' || !!this.meusClientes.value;
    filtrando ? this.pesquisaAvancada() : this.fetch();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    const filtrando = !!this.searchTerm || this.statusFilter !== 'todos' || this.cidadeFilter !== 'todas' || !!this.meusClientes.value;
    filtrando ? this.pesquisaAvancada() : this.fetch();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'todos';
    this.cidadeFilter = 'todas';
    this.meusClientes.setValue(false);
    this.page = 1;
    this.fetch();
  }

  onViewModeChange(mode: any): void {
    this.viewMode = mode ?? 'cards';  // se vier undefined, cai no padrão
    this.viewPref.setViewMode(this.viewMode);
  }

  abrirWhatsapp(cliente: Cliente, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const celularRaw = cliente?.celular || '';
    const celularLimpo = celularRaw.replace(/\D/g, '');
    const celularComDDI = celularLimpo.startsWith('55') ? celularLimpo : `55${celularLimpo}`;
    const url = `https://wa.me/${celularComDDI}`;
    window.open(url, '_blank');
  }

  isUltimoContatoHoje(cliente: Cliente): boolean {
    if (!cliente.ultimoContato) return false;
    const ultimoContatoDate = new Date(cliente.ultimoContato);
    const hoje = new Date();
    return (
      ultimoContatoDate.getDate() === hoje.getDate() &&
      ultimoContatoDate.getMonth() === hoje.getMonth() &&
      ultimoContatoDate.getFullYear() === hoje.getFullYear()
    );
  }

  marcarContato(cliente: Cliente, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const payload: Partial<Cliente> = {
      id_cliente: cliente.id_cliente,
      ultimoContato: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clientesService.postCliente(payload).subscribe(() => {
      cliente.ultimoContato = payload.ultimoContato;
      cliente.updated_at = payload.updated_at;
    });
  }

  getDias(cliente: Cliente): number {
    const referencia = cliente.updated_at || cliente.created_at || new Date().toISOString();
    const hoje = new Date();
    const refDate = new Date(referencia);
    hoje.setHours(0, 0, 0, 0);
    refDate.setHours(0, 0, 0, 0);
    const diffMs = hoje.getTime() - refDate.getTime();
    return Math.max(0, Math.floor(diffMs / 86400000));
  }

  getDiasColor(cliente: Cliente): string {
    const dias = this.getDias(cliente);
    if (dias <= 7) return 'success';
    if (dias <= 15) return 'warning';
    if (dias <= 30) return 'medium';
    return 'danger';
  }

  getPrimeiroNome(nome: string): string {
    return nome.trim().split(' ')[0];
  }
  openClienteModal(cliente: Cliente): void {
    this.clienteSelecionado = cliente;
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.clienteSelecionado = null;
  }

  salvarCliente(): void {
    this.fetch();
  }

  trackById(index: number, cliente: Cliente): number {
    return cliente.id_cliente;
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (this.total === 0) return 0;
    return Math.min(this.page * this.pageSize, this.total);
  }
}
