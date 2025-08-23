import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ClientesService, Cliente } from '../../../services/clientes.service';

@Component({
  selector: 'app-cliente-card',
  templateUrl: './cliente-card.component.html',
  styleUrls: ['./cliente-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ClienteCardComponent implements OnInit, OnChanges {
  @Input() cliente!: Cliente;
  @Output() edit = new EventEmitter<Cliente>();

  dias = 0;
  diasColor = 'medium';

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.updateDias();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente']) {
      this.updateDias();
    }
  }

  onEdit(): void {
    this.edit.emit(this.cliente);
  }

  abrirWhatsapp(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const celularRaw = this.cliente?.celular || '';
    const celularLimpo = celularRaw.replace(/\D/g, '');
    const celularComDDI = celularLimpo.startsWith('55') ? celularLimpo : `55${celularLimpo}`;
    const url = `https://wa.me/${celularComDDI}`;
    window.open(url, '_blank');
  }

  get isUltimoContatoHoje(): boolean {
    if (!this.cliente.ultimoContato) return false;
    const ultimoContatoDate = new Date(this.cliente.ultimoContato);
    const hoje = new Date();
    return (
      ultimoContatoDate.getDate() === hoje.getDate() &&
      ultimoContatoDate.getMonth() === hoje.getMonth() &&
      ultimoContatoDate.getFullYear() === hoje.getFullYear()
    );
  }

  marcarContato(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const payload: Partial<Cliente> = {
      id_cliente: this.cliente.id_cliente,
      ultimoContato: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clientesService.postCliente(payload).subscribe(() => {
      this.cliente.ultimoContato = payload.ultimoContato;
      this.cliente.updated_at = payload.updated_at;
      this.updateDias();
    });
  }

  private updateDias(): void {
    const referencia = this.cliente.updated_at || this.cliente.created_at || new Date().toISOString();
    this.dias = this.calcularDias(referencia);
    this.diasColor = this.getCorDias(this.dias);
  }

  private calcularDias(referencia: string | Date): number {
    const hoje = new Date();
    const refDate = new Date(referencia);
    hoje.setHours(0, 0, 0, 0);
    refDate.setHours(0, 0, 0, 0);
    const diffMs = hoje.getTime() - refDate.getTime();
    return Math.max(0, Math.floor(diffMs / 86400000));
  }

  private getCorDias(dias: number): string {
    if (dias <= 7) return 'success';
    if (dias <= 15) return 'warning';
    if (dias <= 30) return 'medium';
    return 'danger';
  }

  getPrimeiroNome(nome: string): string {
    return nome.trim().split(' ')[0];
  }
}
