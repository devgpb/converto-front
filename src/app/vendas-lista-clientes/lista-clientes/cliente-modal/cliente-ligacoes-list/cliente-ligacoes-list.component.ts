import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { LigacoesService, LigacaoRegistro, PaginacaoMeta } from 'src/app/services/ligacoes.service';

@Component({
  selector: 'app-cliente-ligacoes-list',
  templateUrl: './cliente-ligacoes-list.component.html',
  styleUrls: ['./cliente-ligacoes-list.component.scss'],
  standalone: false,
})
export class ClienteLigacoesListComponent implements OnChanges {
  private api = inject(LigacoesService);

  @Input() idCliente!: string | number;
  @Input() pageSize = 10;

  tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Maceio';

  loading = false;
  error: string | null = null;
  items: LigacaoRegistro[] = [];
  meta: PaginacaoMeta = { total: 0, page: 1, perPage: this.pageSize, totalPages: 0 } as any;
  deleting: Record<string, boolean> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idCliente'] && this.idCliente) {
      this.meta = { total: 0, page: 1, perPage: this.pageSize, totalPages: 0 } as any;
      this.fetch(1);
    }
    if (changes['pageSize'] && this.idCliente) {
      this.fetch(1);
    }
  }

  fetch(page = 1) {
    if (!this.idCliente) return;
    this.loading = true;
    this.error = null;
    this.api
      .getLigacoesDoCliente(this.idCliente, { page, perPage: this.pageSize, tz: this.tz })
      .subscribe({
        next: (res) => {
          this.items = res.data || [];
          this.meta = res.meta || { total: this.items.length, page, perPage: this.pageSize, totalPages: 1 } as any;
          this.loading = false;
        },
        error: () => {
          this.items = [];
          this.meta = { total: 0, page: 1, perPage: this.pageSize, totalPages: 0 } as any;
          this.error = 'Erro ao carregar histórico de ligações';
          this.loading = false;
        },
      });
  }

  prevPage() {
    if (this.meta.page > 1) this.fetch(this.meta.page - 1);
  }

  nextPage() {
    if (this.meta.page < this.meta.totalPages) this.fetch(this.meta.page + 1);
  }

  delete(item: LigacaoRegistro) {
    if (!item?.id_ligacao) return;
    this.deleting[item.id_ligacao] = true;
    this.api.deletarLigacao(item.id_ligacao).subscribe({
      next: () => {
        // Recarrega a página atual
        const page = this.meta.page || 1;
        this.fetch(page);
      },
      error: () => {
        // Mesmo em erro, recarrega para manter consistência
        const page = this.meta.page || 1;
        this.fetch(page);
      },
      complete: () => {
        delete this.deleting[item.id_ligacao];
      }
    });
  }
}
