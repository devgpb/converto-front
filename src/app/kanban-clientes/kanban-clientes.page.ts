import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ViewDidEnter } from '@ionic/angular';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom, takeUntil } from 'rxjs';
import {
  CdkDragDrop,
  CdkDragEnd,
  CdkDragEnter,
  CdkDragExit,
  CdkDragMove,
  CdkDragStart,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { Cliente, ClientesResponse, ClientesService } from '../services/clientes.service';
import { CamposClientesService } from '../services/campos-clientes.service';
import { AuthService } from '../services/auth.service';

interface KanbanColumnState {
  id: string;
  status: string;
  title: string;
  clientes: Cliente[];
  page: number;
  total: number;
  loading: boolean;
  fullyLoaded: boolean;
  error?: string | null;
}

@Component({
  selector: 'app-kanban-clientes',
  templateUrl: './kanban-clientes.page.html',
  styleUrls: ['./kanban-clientes.page.scss'],
  standalone: false,
})
export class KanbanClientesPage implements ViewDidEnter, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly pageSize = 10;
  private readonly initialPages = 2; // 2 * 10 = 20 registros iniciais
  private readonly autoScrollThreshold = 100;
  private readonly autoScrollSpeed = 16;

  searchControl = new FormControl('');
  meusClientesControl = new FormControl<boolean>(false);

  columns: KanbanColumnState[] = [];
  dropListIds: string[] = [];
  @ViewChild('boardContainer', { static: false }) boardContainer?: ElementRef<HTMLDivElement>;

  boardLoading = false;
  reloadingColumns = false;
  globalError: string | null = null;
  isDragging = false;
  dragOverColumnId: string | null = null;
  blockedColumnId: string | null = null;

  readonly skeletonPlaceholders = Array.from({ length: 3 });

  selectedCliente: Cliente | null = null;
  modalOpen = false;

  private readonly clientesService = inject(ClientesService);
  private readonly camposService = inject(CamposClientesService);
  private readonly authService = inject(AuthService);
  private currentUserId: string | null = this.authService.getUserId();
  private autoScrollFrame: number | null = null;
  private autoScrollDirection: -1 | 0 | 1 = 0;

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.onFiltersChanged());

    this.meusClientesControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.onFiltersChanged());
  }

  ionViewDidEnter(): void {
    if (this.columns.length === 0) {
      this.initializeBoard();
    }
  }

  ngOnDestroy(): void {
    this.cancelBoardAutoScroll();
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByCliente(_index: number, cliente: Cliente): number {
    return cliente.id_cliente;
  }

  trackByColumn(_index: number, column: KanbanColumnState): string {
    return column.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  async onFiltersChanged(): Promise<void> {
    if (!this.columns.length) {
      return;
    }
    await this.reloadColumnsData();
  }

  async refreshBoard(): Promise<void> {
    await this.initializeBoard(true);
  }

  async onColumnScroll(column: KanbanColumnState, event: Event): Promise<void> {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 120;
    if (reachedBottom) {
      await this.loadMore(column);
    }
  }

  async drop(event: CdkDragDrop<Cliente[]>, targetColumn: KanbanColumnState): Promise<void> {
    this.cancelBoardAutoScroll();
    this.dragOverColumnId = null;
    this.blockedColumnId = null;
    const previousColumn = this.findColumnByDropListId(event.previousContainer.id);
    if (!previousColumn) {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(targetColumn.clientes, event.previousIndex, event.currentIndex);
      return;
    }

    if (targetColumn.loading) {
      this.blockedColumnId = targetColumn.id;
      return;
    }

    const cliente = event.previousContainer.data[event.previousIndex];
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const originalStatus = cliente.status;
    const originalFechado = cliente.fechado ?? null;
    const previousColumnOriginalTotal = previousColumn.total;
    const targetColumnOriginalTotal = targetColumn.total;

    if (previousColumn !== targetColumn) {
      previousColumn.total = Math.max(previousColumn.total - 1, previousColumn.clientes.length);
      targetColumn.total = Math.max(targetColumn.total + 1, targetColumn.clientes.length);
    }

    try {
      await this.persistStatusChange(cliente, targetColumn.status);
      cliente.status = targetColumn.status;
    } catch (error) {
      // retorna cliente para a coluna original caso falhe
      transferArrayItem(
        event.container.data,
        event.previousContainer.data,
        event.currentIndex,
        event.previousIndex,
      );
      cliente.status = originalStatus;
      cliente.fechado = originalFechado;
      if (previousColumn !== targetColumn) {
        previousColumn.total = previousColumnOriginalTotal;
        targetColumn.total = targetColumnOriginalTotal;
      }
      console.error('Falha ao alterar status do cliente', error);
    }
  }

  openCliente(cliente: Cliente): void {
    if (this.isDragging) {
      return;
    }
    this.selectedCliente = cliente;
    this.modalOpen = true;
  }

  closeClienteModal(): void {
    this.modalOpen = false;
    this.selectedCliente = null;
  }

  onDragStart(_event: CdkDragStart<Cliente>): void {
    this.isDragging = true;
  }

  onDragMoved(event: CdkDragMove<Cliente>): void {
    this.handleBoardAutoScroll(event.event);
  }

  onDragEnd(_event: CdkDragEnd): void {
    this.cancelBoardAutoScroll();
    requestAnimationFrame(() => {
      this.isDragging = false;
      this.dragOverColumnId = null;
      this.blockedColumnId = null;
    });
  }

  onDropListEntered(column: KanbanColumnState, _event: CdkDragEnter<Cliente[]>): void {
    this.dragOverColumnId = column.id;
    this.blockedColumnId = column.loading ? column.id : null;
  }

  onDropListExited(column: KanbanColumnState, _event: CdkDragExit<Cliente[]>): void {
    if (this.dragOverColumnId === column.id) {
      this.dragOverColumnId = null;
    }
    if (this.blockedColumnId === column.id && !column.loading) {
      this.blockedColumnId = null;
    }
  }

  async handleClienteSaved(): Promise<void> {
    await this.reloadColumnsData();
  }

  private async initializeBoard(forceReload = false): Promise<void> {
    if (this.boardLoading) return;

    this.boardLoading = true;
    this.globalError = null;

    try {
      if (!this.columns.length || forceReload) {
        // Busca ordem de status diretamente da API de campos para garantir ordem absoluta
        const campos = await firstValueFrom(this.camposService.getStatus());
        const statuses = (campos.items || []).map(i => i.nome).filter(Boolean);
        
        this.columns = statuses.map((status, index) => this.createColumn(status, index));
        this.dropListIds = this.columns.map((column) => column.id);
      }

      await this.reloadColumnsData();
    } catch (error) {
      console.error('Erro ao carregar o Kanban', error);
      this.globalError = 'Não foi possível carregar o Kanban. Tente novamente.';
    } finally {
      this.boardLoading = false;
    }
  }

  private async reloadColumnsData(): Promise<void> {
    if (!this.columns.length) return;
    if (this.reloadingColumns) return;

    this.reloadingColumns = true;
    try {
      const clearPromises = this.columns.map(async (column) => {
        column.clientes = [];
        column.page = 0;
        column.total = 0;
        column.fullyLoaded = false;
        column.error = null;
        await this.loadPages(column, this.initialPages);
      });
      await Promise.all(clearPromises);
    } finally {
      this.reloadingColumns = false;
    }
  }

  async loadMore(column: KanbanColumnState, count = 1): Promise<void> {
    await this.loadPages(column, count);
  }

  private createColumn(status: string, index: number): KanbanColumnState {
    return {
      id: this.buildColumnId(status, index),
      status,
      title: status,
      clientes: [],
      page: 0,
      total: 0,
      loading: false,
      fullyLoaded: false,
      error: null,
    };
  }

  private buildColumnId(status: string, index: number): string {
    const slug = status.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `kanban-${slug}-${index}`;
  }

  private findColumnByDropListId(id: string): KanbanColumnState | undefined {
    return this.columns.find((column) => column.id === id);
  }

  private async loadPages(column: KanbanColumnState, count: number): Promise<void> {
    if (column.loading || column.fullyLoaded) {
      return;
    }

    column.loading = true;
    column.error = null;

    try {
      for (let i = 0; i < count; i += 1) {
        const nextPage = column.page + 1;
        const response = await this.fetchClientes(column.status, nextPage);
        this.applyResponse(column, response);

        if (column.fullyLoaded || response.data.length === 0) {
          break;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar coluna', column.status, error);
      column.error = 'Erro ao carregar clientes.';
    } finally {
      column.loading = false;
    }
  }

  private async fetchClientes(status: string, page: number): Promise<ClientesResponse> {
    const params: any = {
      page,
      perPage: this.pageSize,
      sortBy: 'recente',
      status,
    };

    const term = (this.searchControl.value || '').trim();
    if (term) {
      params.search = term;
    }

    if (this.meusClientesControl.value && this.currentUserId) {
      params.id_usuario = this.currentUserId;
    }

    return await firstValueFrom(this.clientesService.getClientes(params));
  }

  private applyResponse(column: KanbanColumnState, response: ClientesResponse): void {
    const existingIds = new Set(column.clientes.map((cliente) => cliente.id_cliente));
    const novos = (response.data || []).filter((cliente) => !existingIds.has(cliente.id_cliente));

    column.clientes = [...column.clientes, ...novos];
    column.page = response.meta?.page ?? column.page;
    column.total = response.meta?.total ?? column.total;

    const totalLoaded = column.clientes.length;
    const totalDisponivel = response.meta?.total ?? totalLoaded;
    const reachedEnd = totalLoaded >= totalDisponivel;

    if (reachedEnd || response.data.length < this.pageSize) {
      column.fullyLoaded = true;
    }
  }

  private async persistStatusChange(cliente: Cliente, novoStatus: string): Promise<void> {
    const payload: Partial<Cliente> & { fechado?: string | null } = {
      id_cliente: cliente.id_cliente,
      status: novoStatus,
    } as any;

    const novoStatusLower = (novoStatus || '').toLowerCase();

    if (novoStatusLower === 'fechado') {
      payload.fechado = new Date().toISOString();
    } else if (cliente.fechado) {
      // Reabre antes de aplicar o novo status
      await firstValueFrom(this.clientesService.postCliente({
        id_cliente: cliente.id_cliente,
        fechado: null,
      }));
      cliente.fechado = null;
    }

    await firstValueFrom(this.clientesService.postCliente(payload));

    if (novoStatusLower === 'fechado') {
      cliente.fechado = payload.fechado ?? null;
    }
  }

  private handleBoardAutoScroll(nativeEvent: MouseEvent | TouchEvent): void {
    const board = this.boardContainer?.nativeElement;
    if (!board || board.scrollWidth <= board.clientWidth) {
      this.cancelBoardAutoScroll();
      return;
    }

    const pointerX = this.getPointerClientX(nativeEvent);
    if (pointerX === null) {
      this.cancelBoardAutoScroll();
      return;
    }

    const bounds = board.getBoundingClientRect();
    const threshold = this.autoScrollThreshold;

    if (pointerX >= bounds.right - threshold) {
      this.scheduleBoardAutoScroll(1);
    } else if (pointerX <= bounds.left + threshold) {
      this.scheduleBoardAutoScroll(-1);
    } else {
      this.cancelBoardAutoScroll();
    }
  }

  private scheduleBoardAutoScroll(direction: -1 | 1): void {
    if (this.autoScrollDirection === direction && this.autoScrollFrame !== null) {
      return;
    }

    this.autoScrollDirection = direction;
    if (this.autoScrollFrame === null) {
      this.autoScrollFrame = requestAnimationFrame(() => this.performBoardAutoScroll());
    }
  }

  private performBoardAutoScroll(): void {
    const board = this.boardContainer?.nativeElement;
    if (!board || this.autoScrollDirection === 0) {
      this.cancelBoardAutoScroll();
      return;
    }

    const maxScrollLeft = board.scrollWidth - board.clientWidth;
    if (maxScrollLeft <= 0) {
      this.cancelBoardAutoScroll();
      return;
    }

    if (this.autoScrollDirection === -1 && board.scrollLeft <= 0) {
      this.cancelBoardAutoScroll();
      return;
    }

    if (this.autoScrollDirection === 1 && board.scrollLeft >= maxScrollLeft) {
      this.cancelBoardAutoScroll();
      return;
    }

    const delta = this.autoScrollDirection * this.autoScrollSpeed;
    const next = Math.min(Math.max(board.scrollLeft + delta, 0), maxScrollLeft);
    board.scrollLeft = next;
    this.autoScrollFrame = requestAnimationFrame(() => this.performBoardAutoScroll());
  }

  private cancelBoardAutoScroll(): void {
    if (this.autoScrollFrame !== null) {
      cancelAnimationFrame(this.autoScrollFrame);
      this.autoScrollFrame = null;
    }
    this.autoScrollDirection = 0;
  }

  private getPointerClientX(event: MouseEvent | TouchEvent): number | null {
    if ('clientX' in event) {
      return event.clientX;
    }

    if (event.touches && event.touches.length) {
      return event.touches[0].clientX;
    }

    if (event.changedTouches && event.changedTouches.length) {
      return event.changedTouches[0].clientX;
    }

    return null;
  }
}
