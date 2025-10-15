import { Component, EventEmitter, ViewChild, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Cliente, ClientesService, ClienteEvento } from '../../../services/clientes.service';
import { VendasService } from '../../../services/vendas/vendas.service';
import { AuthService } from 'src/app/services/auth.service';
import { LigacoesService } from 'src/app/services/ligacoes.service';
import { ClienteLigacoesListComponent } from './cliente-ligacoes-list/cliente-ligacoes-list.component';
import { TagsService, Tag } from 'src/app/services/tags.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss'],
  standalone: false,
})
export class ClienteModalComponent implements OnChanges {
  @Input() cliente!: Cliente | null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  private auth = inject(AuthService);

  formData!: Cliente;
  cidades: string[] = [];
  statuses: string[] = [];
  campanhas: string[] = [];
  idUsuario: any;
  // tags do usuário (logado)
  allTags: Tag[] = [];
  userTagIds = new Set<string>();
  tagQuery = '';
  savingTags = false;
  // animações de fade
  fadingOutOptionId: string | null = null;
  fadingOutSelectedId: string | null = null;
  fadingInSelectedId: string | null = null;

  // eventos
  eventos: ClienteEvento[] = [];
  evTitulo = '';
  evDate = '';
  evTime: string | null = null;
  isSavingEvento = false;
  isLoadingEventos = false;
  tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Maceio';

  errors: Record<string, string> = {};
  isLoading = false;
  // view state
  view: 'form' | 'historico' = 'form';

  constructor(
    private clientesService: ClientesService,
    private vendasService: VendasService,
    private ligacoesService: LigacoesService,
    private tagsService: TagsService,
    private usuariosService: UsuariosService,
  ) {
    this.idUsuario = this.auth.getUserId()
    console.log(this.idUsuario, this.auth.getUserId())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente'] && this.cliente) {
      this.formData = { ...this.cliente };
      this.errors = {};
      this.fetchFiltros();
      if (this.formData.campanha && !this.clientesService.listaDeCampanhas.includes(this.formData.campanha)) {
        this.clientesService.listaDeCampanhas.push(this.formData.campanha);
      }
      this.campanhas = this.clientesService.listaDeCampanhas;
      this.carregarEventosCliente();
      this.view = 'form';
      this.carregarTags();
    }
    if (changes['isOpen'] && !this.isOpen) {
      // reset view when modal closes
      this.view = 'form';
    }
  }

  private carregarTags(): void {
    // carrega universo de tags
    this.tagsService.list('', 1, 200).subscribe({
      next: (res) => {
        this.allTags = res?.data || [];
      },
      error: () => { this.allTags = []; }
    });
    // carrega tags do usuário logado
    if (this.idUsuario) {
      this.usuariosService.getById(this.idUsuario).subscribe({
        next: (u) => {
          const tags = Array.isArray(u?.tags) ? u.tags : [];
          this.userTagIds = new Set(tags.map((t: any) => String(t.id)));
        },
        error: () => { this.userTagIds = new Set(); }
      });
    }
  }

  get filteredAvailableTags(): Tag[] {
    const q = this.tagQuery.trim().toLowerCase();
    let list = this.allTags || [];
    // remove já selecionadas do seletor
    list = list.filter(t => !this.userTagIds.has(String(t.id)));
    if (!q) return list;
    return list.filter(t => (t.name || '').toLowerCase().includes(q));
  }

  toggleUserTag(tag: Tag): void {
    const id = String(tag.id);
    if (!this.userTagIds.has(id)) {
      // adicionar: fade out no seletor, depois move para selecionadas com fade in
      this.fadingOutOptionId = id;
      setTimeout(() => {
        this.userTagIds.add(id);
        this.fadingOutOptionId = null;
        this.fadingInSelectedId = id;
        setTimeout(() => { this.fadingInSelectedId = null; }, 220);
      }, 180);
    } else {
      // remover: fade out na lista selecionada, depois volta para seletor
      this.fadingOutSelectedId = id;
      setTimeout(() => {
        this.userTagIds.delete(id);
        this.fadingOutSelectedId = null;
      }, 180);
    }
  }

  trackTagById(_: number, t: Tag) { return t.id; }

  hasUserTag(tagId: string): boolean {
    return this.userTagIds.has(String(tagId));
  }

  salvarTagsUsuario(): void {
    if (!this.idUsuario) return;
    this.savingTags = true;
    const payload = { tag_ids: Array.from(this.userTagIds) } as any;
    this.usuariosService.update(this.idUsuario, payload).subscribe({
      next: () => { this.savingTags = false; },
      error: () => { this.savingTags = false; }
    });
  }

  fetchFiltros(): void {
    this.clientesService.getFiltrosClientes().subscribe((data) => {
      const norm = (arr: any[]): string[] =>
        (arr || [])
          .map((x: any) => typeof x === 'string' ? x : (x && x.nome) ? String(x.nome) : '')
          .filter((s: string) => !!s);
      this.cidades = norm((data as any).cidades);
      this.statuses = norm((data as any).status);
      if (this.formData.cidade && !this.cidades.includes(this.formData.cidade)) {
        this.cidades.push(this.formData.cidade);
      }
      if (this.formData.status && !this.statuses.includes(this.formData.status)) {
        this.statuses.push(this.formData.status);
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  openHistorico(): void {
    this.view = 'historico';
    // Define a data padrão para hoje (YYYY-MM-DD)
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    this.ligacaoDate = `${yyyy}-${mm}-${dd}`;
  }

  voltarParaForm(): void {
    this.view = 'form';
  }

  save(): void {
    if (!this.validate()) return;
    this.isLoading = true;
    const payload: Partial<Cliente> = { ...this.formData };
    this.clientesService.postCliente(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.saved.emit();
        this.close();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  validate(): boolean {
    this.errors = {};
    if (!this.formData.nome || !this.formData.nome.trim()) {
      this.errors['nome'] = 'Nome é obrigatório';
    }
    if (!this.formData.celular || !this.formData.celular.trim()) {
      this.errors['celular'] = 'Celular é obrigatório';
    }
    return Object.keys(this.errors).length === 0;
  }

  calcularDias(data: string | Date): number {
    const hoje = new Date();
    const ref = new Date(data);
    const diff = Math.abs(hoje.getTime() - ref.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getBadgeColor(dias: number): string {
    if (dias <= 7) return 'primary';
    if (dias <= 15) return 'secondary';
    if (dias <= 30) return 'warning';
    return 'danger';
  }

  getBadgeText(dias: number): string {
    if (dias <= 7) return 'Recente';
    if (dias <= 15) return 'Normal';
    if (dias <= 30) return 'Atenção';
    return 'Crítico';
  }

  // ===== eventos =====
  private carregarEventosCliente() {
    if (!this.formData?.id_cliente) return;
    this.isLoadingEventos = true;
    this.clientesService.getEventosDoCliente(this.formData.id_cliente, { tz: this.tz }).subscribe({
      next: lista => {
        this.eventos = lista || [];
        this.isLoadingEventos = false;
      },
      error: () => {
        this.isLoadingEventos = false;
      }
    });
  }

  // ===== ligações (histórico) =====
  @ViewChild(ClienteLigacoesListComponent) ligacoesList?: ClienteLigacoesListComponent;
  observacaoLigacao: string = '';
  ligacaoDate: string = '';
  savingLigacao = false;

  adicionarLigacao(atendida: boolean) {
    if (!this.formData?.id_cliente) return;
    const payload = {
      id_cliente: this.formData.id_cliente,
      data_hora: this.ligacaoDate || undefined,
      tz: this.tz,
      atendida,
      observacao: this.observacaoLigacao || null,
    } as any;
    this.savingLigacao = true;
    this.ligacoesService.salvarLigacao(payload).subscribe({
      next: () => {
        this.observacaoLigacao = '';
        // recarregar lista
        this.ligacoesList?.fetch(1);
        this.savingLigacao = false;
      },
      error: () => {
        this.savingLigacao = false;
      }
    });
  }

  // ===== fechar / reabrir cliente =====
  fecharCliente() {
    if (!this.formData?.id_cliente) return;
    const nowIso = new Date().toISOString();
    const payload: Partial<Cliente> & { fechado?: string | null } = {
      id_cliente: this.formData.id_cliente,
      fechado: nowIso,
    } as any;
    this.isLoading = true;
    this.clientesService.postCliente(payload).subscribe({
      next: () => {
        (this.formData as any).fechado = nowIso;
        this.isLoading = false;
        this.saved.emit();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  reabrirCliente() {
    if (!this.formData?.id_cliente) return;
    const payload: Partial<Cliente> & { fechado?: string | null } = {
      id_cliente: this.formData.id_cliente,
      fechado: null,
    } as any;
    this.isLoading = true;
    this.clientesService.postCliente(payload).subscribe({
      next: () => {
        (this.formData as any).fechado = null;
        this.isLoading = false;
        this.saved.emit();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  marcarEvento() {
    if (!this.evDate) {
      return;
    }
    const data = `${this.evDate}T${this.evTime || '00:00'}`;
    this.isSavingEvento = true;
    this.clientesService.criarEvento({
      id_usuario: this.idUsuario,
      id_cliente: this.formData.id_cliente,
      data,
      evento: this.evTitulo || null,
      tz: this.tz
    }).subscribe({
      next: novo => {
        this.eventos.unshift(novo);
        this.evTitulo = '';
        this.evDate = '';
        this.evTime = null;
        this.isSavingEvento = false;
      },
      error: () => {
        this.isSavingEvento = false;
      }
    });
  }

  confirmarEventoLocal(ev: ClienteEvento) {
    ev.confirmado = true;
    this.vendasService.confirmarEvento(ev.id_evento).subscribe({
      error: () => {
        ev.confirmado = null;
      }
    });
  }

  cancelarEventoLocal(ev: ClienteEvento) {
    this.vendasService.cancelarEvento(ev.id_evento).subscribe({
      next: () => {
        this.carregarEventosCliente();
      },
      error: () => {}
    });
  }

  truncateId(id: string): string {
    if (!id) {
      return '';
    }
    return id.length > 10 ? `${id.slice(0, 10)}...` : id;
  }

  copyId(id: string): void {
    if (id) {
      navigator.clipboard.writeText(id);
    }
  }
}

