import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ClientesService, Cliente, ClientesResponse } from '../../services/clientes.service';
import { AuthService } from '../../services/auth.service';
import { ClienteCardComponent } from './cliente-card.component';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, ClienteCardComponent]
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  total = 0;
  totalPages = 1;
  page = 1;
  pageSize = 50;
  carregandoBusca = false;

  searchTerm = '';
  statusFilter = 'todos';
  cidadeFilter = 'todas';
  sortBy = 'recente';
  statusUnicos: string[] = [];
  cidadesUnicas: string[] = [];
  meusClientes = new FormControl(false);
  tenantId: string | null;

  constructor(
    private clientesService: ClientesService,
    private authService: AuthService
  ) {
    this.tenantId = this.authService.getTenantId();
  }

  ngOnInit(): void {
    this.carregarFiltros();
    this.fetch();
  }

  private buildParams(extra: any = {}) {
    const base: any = {
      page: this.page,
      pageSize: this.pageSize,
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
        this.carregandoBusca = false;
      },
      error: () => (this.carregandoBusca = false),
    });
  }

  pesquisaAvancada(): void {
    this.page = 1;
    this.carregandoBusca = true;
    this.clientesService.getClientes(this.buildParams({ fromSearch: true })).subscribe({
      next: (resp: ClientesResponse) => {
        this.clientes = resp.data;
        this.total = resp.meta.total;
        this.totalPages = resp.meta.totalPages;
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

  trackById(index: number, cliente: Cliente): number {
    return cliente.idCliente;
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (this.total === 0) return 0;
    return Math.min(this.page * this.pageSize, this.total);
  }
}
