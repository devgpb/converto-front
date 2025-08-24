import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface DashboardData {
  clientesNovosHoje: number;
  clientesAtendidosHoje: number;
  totalClientesCadastrados: number;
  eventosMarcados: number;
  clientesFechados: number;
  statusDistribution: { status: string; count: number }[];
  campanhaDistribution: { campanha: string; count: number }[];
  contatosPorDia: { date: string; count: number }[];
}

interface Cliente {
  nome: string;
  status?: string;
  updatedAt?: string;
  fechado?: string;
  ultimoContato?: string;
  observacao?: string;
}

interface Evento {
  cliente?: string;
  data?: string;
  evento?: string;
  confirmado?: boolean;
  usuario?: string;
}

type ModalKind = 'novos' | 'atendidos' | 'fechados' | 'eventos' | null;

@Component({
  selector: 'app-vendas-dashboard',
  templateUrl: './vendas-dashboard.page.html',
  styleUrls: ['./vendas-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class VendasDashboardPage implements OnInit {
  loading = true;
  error: string | null = null;
  selectedPeriod: 'hoje' | 'semana' | 'mes' = 'hoje';

  range = { start: '', end: '' };
  rangeError: string | null = null;
  get rangeValid(): boolean {
    return !!this.range.start && !!this.range.end && !this.rangeError;
  }

  data: DashboardData | null = null;

  maxStatus = 1;
  totalCampanhas = 1;

  modalOpen = false;
  modalKind: ModalKind = null;
  modalItems: (Cliente | Evento)[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // simulate async request
    setTimeout(() => {
      this.data = {
        clientesNovosHoje: 5,
        clientesAtendidosHoje: 12,
        totalClientesCadastrados: 240,
        eventosMarcados: 3,
        clientesFechados: 7,
        statusDistribution: [
          { status: 'Novo', count: 20 },
          { status: 'Atendido', count: 15 },
          { status: 'Fechado', count: 7 },
        ],
        campanhaDistribution: [
          { campanha: 'Verão', count: 14 },
          { campanha: 'Inverno', count: 8 },
          { campanha: 'Sem campanha', count: 5 },
        ],
        contatosPorDia: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-02', count: 7 },
          { date: '2024-01-03', count: 3 },
          { date: '2024-01-04', count: 9 },
        ],
      };

      this.maxStatus = Math.max(
        ...this.data.statusDistribution.map((s) => s.count),
        1
      );
      this.totalCampanhas =
        this.data.campanhaDistribution.reduce((a, c) => a + c.count, 0) || 1;

      this.loading = false;
    }, 600);
  }

  setPeriod(p: 'hoje' | 'semana' | 'mes'): void {
    if (this.selectedPeriod !== p) {
      this.selectedPeriod = p;
      this.range = { start: '', end: '' };
      this.rangeError = null;
      this.loadData();
    }
  }

  selectedPeriodLabel(): string {
    return this.selectedPeriod === 'hoje'
      ? 'hoje'
      : this.selectedPeriod === 'semana'
      ? 'nesta semana'
      : 'neste mês';
  }

  onRangeChange(which: 'start' | 'end', ev: any): void {
    this.range[which] = ev.detail.value;
    this.rangeError = this.validateRange();
  }

  validateRange(): string | null {
    const start = this.range.start ? new Date(this.range.start) : null;
    const end = this.range.end ? new Date(this.range.end) : null;

    if (!start || !end) return 'Selecione as duas datas';
    if (end < start) return 'Data final não pode ser antes da inicial';

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (months > 12 || (months === 12 && end.getDate() > start.getDate())) {
      return 'Intervalo máximo é de 12 meses';
    }
    return null;
  }

  applyRange(): void {
    if (this.rangeValid) {
      this.selectedPeriod = 'mes';
      this.loadData();
    }
  }

  openModal(kind: Exclude<ModalKind, null>): void {
    this.modalKind = kind;
    this.modalOpen = true;

    if (this.isClientList()) {
      this.modalItems = [
        {
          nome: 'João da Silva',
          status: 'Novo',
          updatedAt: '2024-01-03',
          observacao: 'Interessado no pacote premium.',
        },
        {
          nome: 'Maria Souza',
          status: 'Atendido',
          updatedAt: '2024-01-02',
          observacao: 'Aguardando resposta.',
        },
      ];
    } else {
      this.modalItems = [
        {
          cliente: 'Carlos Pereira',
          data: '2024-01-05',
          evento: 'Reunião',
          confirmado: false,
          usuario: 'Marina',
        },
      ];
    }
  }

  closeModal(): void {
    this.modalOpen = false;
    this.modalKind = null;
  }

  modalTitle(): string {
    switch (this.modalKind) {
      case 'novos':
        return 'Clientes novos';
      case 'atendidos':
        return 'Clientes atendidos';
      case 'fechados':
        return 'Clientes fechados';
      case 'eventos':
        return 'Eventos marcados';
      default:
        return '';
    }
  }

  isClientList(): boolean {
    return (
      this.modalKind === 'novos' ||
      this.modalKind === 'atendidos' ||
      this.modalKind === 'fechados'
    );
  }

  statusBadgeColor(status?: string): string {
    const s = (status ?? '').toLowerCase();
    if (['fechado', 'vendido'].includes(s)) return 'success';
    if (['aguardando', 'pendente', 'novo'].includes(s)) return 'warning';
    if (['em negociação', 'negociando', 'atendido'].includes(s))
      return 'primary';
    return 'medium';
  }

  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR');
  }

  short(t?: string, max = 140): string {
    if (!t) return '';
    return t.length > max ? t.slice(0, max - 1) + '…' : t;
  }
}

