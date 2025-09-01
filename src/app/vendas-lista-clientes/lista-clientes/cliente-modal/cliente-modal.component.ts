import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Cliente, ClientesService, ClienteEvento } from '../../../services/clientes.service';
import { VendasService } from '../../../services/vendas/vendas.service';
import { AuthService } from 'src/app/services/auth.service';

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

  constructor(
    private clientesService: ClientesService,
    private vendasService: VendasService,
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
    }
  }

  fetchFiltros(): void {
    this.clientesService.getFiltrosClientes().subscribe((data) => {
      this.cidades = data.cidades || [];
      this.statuses = data.status || [];
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
}

