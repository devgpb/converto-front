import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Cliente, ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ClienteModalComponent implements OnChanges {
  @Input() cliente!: Cliente | null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  formData!: Cliente;
  cidades: string[] = [];
  statuses: string[] = [];
  campanhas: string[] = [];

  errors: Record<string, string> = {};
  isLoading = false;

  constructor(private clientesService: ClientesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente'] && this.cliente) {
      this.formData = { ...this.cliente };
      this.errors = {};
      this.fetchFiltros();
      if (this.formData.campanha && !this.clientesService.listaDeCampanhas.includes(this.formData.campanha)) {
        this.clientesService.listaDeCampanhas.push(this.formData.campanha);
      }
      this.campanhas = this.clientesService.listaDeCampanhas;
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
}

