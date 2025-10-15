import { Component, OnInit, inject } from '@angular/core';
import { LigacoesService } from '../services/ligacoes.service';
import { ClientesService } from '../services/clientes.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { SeatsService } from '../services/seats.service';
import { Usuario } from '../services/usuarios.service';
import { TagsService, Tag } from '../services/tags.service';

interface MetaPage {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Component({
  selector: 'app-vendas-ligacoes',
  templateUrl: './vendas-ligacoes.page.html',
  styleUrls: ['./vendas-ligacoes.page.scss'],
  standalone: false,
})
export class VendasLigacoesPage implements OnInit {
  private ligacoesService = inject(LigacoesService);
  private clientesService = inject(ClientesService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private seats = inject(SeatsService);
  private tagsService = inject(TagsService);

  isAdmin = false;
  currentUserId: string | null = null;
  usuarios: Usuario[] = [];
  filtrosForm!: FormGroup;
  loading = false;
  clientes: any[] = [];
  meta: MetaPage = { total: 0, page: 1, perPage: 10, totalPages: 0 };
  cidades: string[] = [];
  statusList: string[] = [];
  allTags: Tag[] = [];
  tagQuery = '';
  selectedTagIds = new Set<string>();
  observacoes: Record<string, string> = {};
  removing: Record<string, boolean> = {};

  private ligadosHojeIds = new Set<string>();

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      id_usuario: [''],
      search: [''],
      cidade: ['todas'],
      status: ['todos'],
      sortBy: [''],
      ocultarLigadosHoje: [true],
      perPage: [10],
      limiteTotal: [10],
    });

    this.isAdmin = this.auth.isAdmin();
    this.currentUserId = this.auth.getUserId();
    this.carregarUsuarios();
    this.carregarFiltrosClientes();
    this.carregarTags();
    // Mantém seletor começando em 'Todos' e não busca automaticamente
  }

  private carregarTags(): void {
    this.tagsService.list('', 1, 200).subscribe({
      next: (res) => { this.allTags = res?.data || []; },
      error: () => { this.allTags = []; }
    });
  }

  get filteredTags(): Tag[] {
    const q = this.tagQuery.trim().toLowerCase();
    if (!q) return this.allTags;
    return (this.allTags || []).filter(t => (t.name || '').toLowerCase().includes(q));
  }

  toggleTag(tag: Tag): void {
    const id = String(tag.id);
    if (this.selectedTagIds.has(id)) this.selectedTagIds.delete(id);
    else this.selectedTagIds.add(id);
  }

  hasTag(id: string): boolean { return this.selectedTagIds.has(String(id)); }

  private carregarUsuarios(): void {
    this.usuarios = [];
    if (this.isAdmin) {
      const tenantId = this.auth.getTenantId();
      if (!tenantId) return;
      this.seats.getUsage(tenantId).subscribe({
        next: (usage: any) => {
          const all = (usage?.users || []).filter((u: any) => !!u);
          // Exclui o próprio usuário; opção 'Meus Clientes' aparece separadamente no select
          this.usuarios = all.filter((u: any) => this.getUserId(u) !== this.currentUserId);
        },
        error: () => (this.usuarios = []),
      });
    }
  }

  getUserId(u: any): string | null {
    return (u?.id_usuario || u?.user_id || u?.id || null) ? String(u.id_usuario || u.user_id || u.id) : null;
  }

  private carregarFiltrosClientes(): void {
    this.clientesService.getFiltrosClientes().subscribe({
      next: (res) => {
        const norm = (arr: any[]): string[] =>
          (arr || [])
            .map((x: any) => typeof x === 'string' ? x : (x && x.nome) ? String(x.nome) : '')
            .filter((s: string) => !!s);
        this.cidades = norm((res as any).cidades);
        this.statusList = norm((res as any).status);
      },
      error: () => {}
    });
  }

  private async carregarLigadosHoje(idUsuario: string): Promise<void> {
    this.ligadosHojeIds.clear();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Maceio';
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const d = hoje.getDate().toString().padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    return new Promise((resolve) => {
      this.ligacoesService.getLigacoesDoUsuario({ id_usuario: idUsuario, inicio: iso, fim: iso, tz, _: Date.now() }).subscribe({
        next: (regs) => {
          regs?.forEach((r: any) => {
            if (r.id_cliente) this.ligadosHojeIds.add(String(r.id_cliente));
          });
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  buscar(page: number = 1): void {
    const f = this.filtrosForm.value;
    const idUsuario = f.id_usuario;

    this.loading = true;
    this.observacoes = {};
    const params: any = {
      id_usuario: idUsuario,
      search: f.search,
      cidade: f.cidade && f.cidade !== 'todas' ? f.cidade : undefined,
      status: f.status && f.status !== 'todos' ? f.status : undefined,
      sortBy: f.sortBy,
      page,
      perPage: Number(f.perPage || 10),
      limiteTotal: Number(f.limiteTotal || 10),
    };
    const tagIds = Array.from(this.selectedTagIds);
    if (tagIds.length) params.tagIds = tagIds.join(',');

    Object.keys(params).forEach((k) => {
      const v = params[k];
      if (v === undefined || v === null || v === '' || v === 'undefined') {
        delete params[k];
      }
    });

    const applyResult = (ret: any) => {
      let rows = ret?.data || [];
      if (f.ocultarLigadosHoje && idUsuario) {
        rows = rows.filter((c: any) => !this.ligadosHojeIds.has(String(c.id_cliente)));
      }
      this.clientes = rows;
      this.meta = ret?.meta || { total: rows.length, page, perPage: params.perPage, totalPages: 1 };
    };

    const proceed = () => {
      this.clientesService.getClientes(params).subscribe({
        next: (ret: any) => applyResult(ret),
        error: () => {
          this.clientes = [];
          this.meta = { total: 0, page: 1, perPage: params.perPage, totalPages: 0 };
        },
        complete: () => (this.loading = false),
      });
    };

    if (f.ocultarLigadosHoje && idUsuario) {
      this.carregarLigadosHoje(idUsuario).then(proceed);
    } else {
      proceed();
    }
  }

  paginaAnterior(): void {
    if (this.meta.page > 1) this.buscar(this.meta.page - 1);
  }

  proximaPagina(): void {
    if (this.meta.page < this.meta.totalPages) this.buscar(this.meta.page + 1);
  }

  whatsapp(celular: string | null | undefined): void {
    const digits = String(celular || '').replace(/\D/g, '');
    if (!digits) return;
    const url = `https://wa.me/${digits}`;
    window.open(url, '_blank');
  }

  pular(cliente: any): void {
    delete this.observacoes[cliente.id_cliente];
    this.removerComAnimacao(cliente);
  }

  salvarLigacao(cliente: any, atendida: boolean): void {
    const f = this.filtrosForm.value;
    const observacao = this.observacoes[cliente.id_cliente] || null;
    const payload = {
      id_usuario: f.id_usuario || undefined,
      id_cliente: cliente.id_cliente,
      atendida,
      observacao,
    };
    this.ligacoesService.salvarLigacao(payload).subscribe({
      next: () => { delete this.observacoes[cliente.id_cliente]; this.removerComAnimacao(cliente); },
      error: () => { delete this.observacoes[cliente.id_cliente]; this.removerComAnimacao(cliente); },
    });
  }

  private removerComAnimacao(cliente: any): void {
    const id = cliente.id_cliente;
    this.removing[id] = true;
    setTimeout(() => {
      const idx = this.clientes.findIndex((c) => c.id_cliente === id);
      if (idx >= 0) this.clientes.splice(idx, 1);
      delete this.removing[id];
    }, 250);
  }
}

