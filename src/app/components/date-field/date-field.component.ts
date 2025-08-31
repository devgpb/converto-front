import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonicModule, IonModal } from '@ionic/angular';

@Component({
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  // explicit for Angular 15+ metadata
  standalone: false as any
})
export class DateFieldComponent implements OnInit {
  @Input() label = 'Data';
  @Input() mode: 'single' | 'range' = 'single';
  @Input() locale = 'pt-BR';
  @Input() presentation: 'date' | 'date-time' | 'time' = 'date';

  // Single value (ISO string)
  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string | null>();

  // Range values (YYYY-MM-DD preferencialmente)
  @Input() start: string | null = null; // YYYY-MM-DD
  @Input() end: string | null = null;   // YYYY-MM-DD
  @Output() startChange = new EventEmitter<string | null>();
  @Output() endChange = new EventEmitter<string | null>();
  // Componente agora apenas escolhe datas; aplicação é externa (botão Aplicar)

  // Optional constraints
  @Input() min?: string;
  @Input() max?: string;

  triggerId = '';
  @ViewChild(IonModal) modal?: IonModal;

  // Valores temporários por sessão do modal (evita selecionar só ao trocar mês)
  pendingStart: string | null = null; // YYYY-MM-DD
  pendingEnd: string | null = null;   // YYYY-MM-DD

  ngOnInit(): void {
    this.triggerId = `df-${Math.random().toString(36).slice(2, 8)}`;
  }

  onDatetimeChange(ev: CustomEvent) {
    const val: any = (ev as any).detail?.value;
    const iso = typeof val === 'string' ? val : val?.to ?? val?.from ?? null;
    this.value = iso;
    this.valueChange.emit(this.value);
  }

  onStartChange(ev: CustomEvent) {
    const val: any = (ev as any).detail?.value as string | null;
    const iso = typeof val === 'string' ? val : null;
    const ymd = iso ? this.toYmd(iso) : null;
    this.pendingStart = ymd;
    this.start = ymd;
    this.startChange.emit(ymd);
    // Não auto-aplica nem fecha modal; o botão externo controla a pesquisa
  }

  onEndChange(ev: CustomEvent) {
    const val: any = (ev as any).detail?.value as string | null;
    const iso = typeof val === 'string' ? val : null;
    const ymd = iso ? this.toYmd(iso) : null;
    this.pendingEnd = ymd;
    this.end = ymd;
    this.endChange.emit(ymd);
    // Não auto-aplica nem fecha modal; o botão externo controla a pesquisa
  }

  // Limpa seleção ao abrir o modal para evitar disparo ao navegar entre meses
  onWillPresent() {
    this.pendingStart = null;
    this.pendingEnd = null;
  }

  closeModal() {
    this.modal?.dismiss();
  }

  formattedValue(): string {
    try {
      if (this.mode === 'single') {
        if (!this.value) return 'Selecionar';
        return new Date(this.value).toLocaleDateString(this.locale);
      }
      const a = this.start ? this.formatYmd(this.start) : '--/--/----';
      const b = this.end ? this.formatYmd(this.end) : '--/--/----';
      return `${a} – ${b}`;
    } catch {
      return 'Selecionar';
    }
  }

  private toYmd(iso: string): string {
    // normaliza para YYYY-MM-DD independente do fuso
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatYmd(ymd: string): string {
    // converte YYYY-MM-DD para locale
    const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10));
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
    return dt.toLocaleDateString(this.locale);
  }
}
