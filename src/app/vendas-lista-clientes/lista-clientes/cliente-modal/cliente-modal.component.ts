import { Component, EventEmitter, ViewChild, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Cliente, ClientesService, ClienteEvento } from '../../../services/clientes.service';
import { VendasService } from '../../../services/vendas/vendas.service';
import { AuthService } from 'src/app/services/auth.service';
import { LigacoesService } from 'src/app/services/ligacoes.service';
import { ClienteLigacoesListComponent } from './cliente-ligacoes-list/cliente-ligacoes-list.component';
import { TagsService, Tag } from 'src/app/services/tags.service';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss'],
  standalone: false,
})
export class ClienteModalComponent implements OnChanges {
  @Input() idCliente: number | string | null = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  private auth = inject(AuthService);
  private toastController = inject(ToastController);

  formData!: Cliente;
  cidades: string[] = [];
  statuses: string[] = [];
  campanhas: string[] = [];
  idUsuario: any;
  // tags do cliente
  allTags: Tag[] = [];
  clienteTagIds = new Set<string>();
  tagQuery = '';
  savingTags = false;
  isLoadingCliente = false;
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
  ) {
    this.idUsuario = this.auth.getUserId()
    console.log(this.idUsuario, this.auth.getUserId())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['idCliente'] && this.idCliente) || (changes['isOpen'] && this.isOpen && this.idCliente)) {
      this.loadClienteById(String(this.idCliente));
    }
    if (changes['isOpen'] && !this.isOpen) {
      // reset view when modal closes
      this.view = 'form';
    }
  }

  private loadClienteById(id: string) {
    this.isLoadingCliente = true;
    this.errors = {};
    this.clientesService.getClienteById(id).subscribe({
      next: (cli) => {
        this.formData = { ...cli } as Cliente;
        // normaliza tags do cliente
        const tags = Array.isArray((cli as any)?.tags) ? (cli as any).tags : [];
        this.clienteTagIds = new Set(tags.map((t: any) => String(t.id)));
        // filtros e campanhas
        this.fetchFiltros();
        if (this.formData.campanha && !this.clientesService.listaDeCampanhas.includes(this.formData.campanha)) {
          this.clientesService.listaDeCampanhas.push(this.formData.campanha);
        }
        this.campanhas = this.clientesService.listaDeCampanhas;
        // carregar eventos e universo de tags
        this.carregarEventosCliente();
        this.view = 'form';
        this.carregarTags();
        this.isLoadingCliente = false;
      },
      error: () => {
        this.isLoadingCliente = false;
      }
    });
  }

  private carregarTags(): void {
    // carrega universo de tags
    this.tagsService.list('', 1, 200).subscribe({
      next: (res) => { this.allTags = res?.data || []; },
      error: () => { this.allTags = []; }
    });
  }

  get filteredAvailableTags(): Tag[] {
    const q = this.tagQuery.trim().toLowerCase();
    let list = this.allTags || [];
    // remove já selecionadas do seletor
    list = list.filter(t => !this.clienteTagIds.has(String(t.id)));
    if (!q) return list;
    return list.filter(t => (t.name || '').toLowerCase().includes(q));
  }

  toggleUserTag(tag: Tag): void {
    if (!this.formData?.id_cliente) return;
    const id = String(tag.id);
    const isAdding = !this.clienteTagIds.has(id);
    const before = new Set(this.clienteTagIds);

    if (isAdding) {
      // adicionar: fade out no seletor, depois move para selecionadas com fade in
      this.fadingOutOptionId = id;
      setTimeout(() => {
        this.clienteTagIds.add(id);
        this.fadingOutOptionId = null;
        this.fadingInSelectedId = id;
        setTimeout(() => { this.fadingInSelectedId = null; }, 220);
        this.persistClienteTag('add', tag, before);
      }, 180);
    } else {
      // remover: fade out na lista selecionada, depois volta para seletor
      this.fadingOutSelectedId = id;
      setTimeout(() => {
        this.clienteTagIds.delete(id);
        this.fadingOutSelectedId = null;
        this.persistClienteTag('remove', tag, before);
      }, 180);
    }
  }

  trackTagById(_: number, t: Tag) { return t.id; }

  hasUserTag(tagId: string): boolean {
    return this.clienteTagIds.has(String(tagId));
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'medium' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    await toast.present();
  }

  private persistClienteTag(method: 'add'|'remove', tag: Tag, previous: Set<string>) {
    if (!this.formData?.id_cliente) return;
    this.savingTags = true;
    const snapshot = new Set(previous);
    const tagId = String(tag.id);
    this.clientesService.updateClienteTags(this.formData.id_cliente, method, [tagId]).subscribe({
      next: async (res) => {
        const updatedIds = new Set((res?.tags || []).map((t: any) => String(t.id)));
        this.clienteTagIds = updatedIds;
        this.savingTags = false;
        if (method === 'add') {
          await this.showToast('Tag adicionada');
        }
      },
      error: async () => {
        this.clienteTagIds = snapshot;
        this.savingTags = false;
        await this.showToast('Falha ao salvar tag', 'danger');
      }
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
    // Sanitiza date/time vindos do ion-datetime para montar um ISO válido
    // evDate pode vir como 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm[:ss][.SSS]Z'
    // evTime pode vir como 'HH:mm' ou 'HH:mm:ss' ou ISO com 'T'
    const rawDate = String(this.evDate);
    let datePart = '';
    if (rawDate.includes('T')) {
      // pega apenas a parte da data
      datePart = rawDate.split('T')[0];
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      datePart = rawDate;
    } else {
      // tenta normalizar via Date
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        return; // data inválida
      }
      datePart = d.toISOString().slice(0, 10);
    }

    let timePart = this.evTime ? String(this.evTime) : '00:00';
    if (timePart.includes('T')) {
      // se vier ISO ou contiver T, extrai após o T
      timePart = timePart.split('T')[1];
    }
    // remove timezone e millis se houver
    timePart = timePart.replace(/Z$/, '');
    timePart = timePart.split('.')[0];
    // garante formato HH:mm ou HH:mm:ss
    const hhmmssMatch = timePart.match(/^\d{2}:\d{2}(?::\d{2})?$/);
    if (!hhmmssMatch) {
      // tenta extrair HH:mm de strings como '15:57:00Z'
      const m = timePart.match(/^(\d{2}:\d{2})(?::\d{2})?/);
      timePart = m ? m[1] : '00:00';
    }
    const data = `${datePart}T${timePart}`;
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

