import { Component, Input, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarioDay, CalendarioEvento } from 'src/app/services/calendario.service';

@Component({
  selector: 'app-lista-eventos',
  templateUrl: './lista-eventos.component.html',
  styleUrls: ['./lista-eventos.component.scss'],
  standalone: false,
})
export class ListaEventosComponent {
  @Input() day: CalendarioDay | null = null;

  private modalCtrl = inject(ModalController);

  get hasEvents(): boolean {
    return (this.day?.events?.length ?? 0) > 0;
  }

  get dayTitle(): string {
    if (!this.day) return 'Eventos';
    const weekday = this.day.weekday ? `${this.day.weekday}, ` : '';
    return `${weekday}${this.day.label}`;
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

  trackByEvento(_: number, evento: CalendarioEvento): number | string {
    return evento.id_evento ?? `${evento.id_cliente}-${evento.hora_local}`;
  }

  badgeColor(status: boolean | null): 'success' | 'warning' | 'medium' {
    if (status === true) return 'success';
    if (status === false) return 'medium';
    return 'warning';
  }

  badgeLabel(status: boolean | null): string {
    if (status === true) return 'Confirmado';
    if (status === false) return 'Cancelado';
    return 'Pendente';
  }
}
