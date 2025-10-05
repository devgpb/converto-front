import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CamposClientesService } from '../services/campos-clientes.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastController } from '@ionic/angular';
import { TagsService, Tag } from '../services/tags.service';

@Component({
  selector: 'app-campos-clientes',
  templateUrl: './campos-clientes.page.html',
  styleUrls: ['./campos-clientes.page.scss'],
  standalone: false,
})
export class CamposClientesPage implements OnInit {
  private campos = inject(CamposClientesService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastController);
  private tagsService = inject(TagsService);

  status: { id: number; nome: string; qtd_clientes: number; ordem?: number }[] = [];
  campanhas: { id: number; nome: string; qtd_clientes: number }[] = [];
  tags: Tag[] = [];
  loading = false;
  errorMsg = '';

  formStatus = this.fb.group({ nome: ['', [Validators.required, Validators.minLength(2)]] });
  formCampanha = this.fb.group({ nome: ['', [Validators.required, Validators.minLength(2)]] });
  formTag = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    color_hex: ['#1976D2']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    // carrega listas mestre com contagem de uso
    this.campos.getStatus().subscribe({
      next: (res) => {
        this.status = (res.items || []).slice().sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));
        this.loading = false;
      },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.error || 'Falha ao carregar status'; },
    });
    this.campos.getCampanhas().subscribe({
      next: (res) => {
        this.campanhas = (res.items || []).slice();
      },
      error: (err) => { this.errorMsg = err?.error?.error || 'Falha ao carregar campanhas'; },
    });
    this.tagsService.list('', 1, 200).subscribe({
      next: (res) => { this.tags = res.data || []; },
      error: (err) => { this.errorMsg = err?.error?.error || 'Falha ao carregar tags'; }
    });
  }

  adicionarStatus(): void {
    if (this.formStatus.invalid) return;
    const nome = this.formStatus.value.nome?.trim();
    if (!nome) return;
    this.campos.addStatus(nome).subscribe({
      next: () => {
        this.formStatus.reset();
        this.load();
      },
      error: (err) => { this.errorMsg = err?.error?.error || 'Falha ao adicionar status'; },
    });
  }

  adicionarCampanha(): void {
    if (this.formCampanha.invalid) return;
    const nome = this.formCampanha.value.nome?.trim();
    if (!nome) return;
    this.campos.addCampanha(nome).subscribe({
      next: () => {
        this.formCampanha.reset();
        this.load();
      },
      error: (err) => { this.errorMsg = err?.error?.error || 'Falha ao adicionar campanha'; },
    });
  }

  deletarStatus(item: { id: number; nome: string; qtd_clientes: number }): void {
    if (!item?.id) return;
    if (!confirm(`Excluir status "${item.nome}"?`)) return;
    this.errorMsg = '';
    this.campos.deleteStatus(item.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.errorMsg = err?.error?.error || 'Não foi possível excluir o status'; },
    });
  }

  deletarCampanha(item: { id: number; nome: string; qtd_clientes: number }): void {
    if (!item?.id) return;
    if (!confirm(`Excluir campanha "${item.nome}"?`)) return;
    this.errorMsg = '';
    this.campos.deleteCampanha(item.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.errorMsg = err?.error?.error || 'Não foi possível excluir a campanha'; },
    });
  }

  // Drag and drop ordering of status
  dropStatus(event: CdkDragDrop<any[]>): void {
    if (!event || event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.status, event.previousIndex, event.currentIndex);
    const ids = this.status.map(s => s.id);
    this.campos.reorderStatus(ids).subscribe({
      next: async () => {
        // Atualiza ordens localmente para maior responsividade
        this.status = this.status.map((s, idx) => ({ ...s, ordem: idx }));
        const t = await this.toast.create({ message: 'Ordem salva com sucesso', duration: 1500, color: 'success', position: 'bottom' });
        t.present();
      },
      error: async (err) => {
        const msg = err?.error?.error || 'Falha ao salvar ordem dos status';
        this.errorMsg = msg;
        const t = await this.toast.create({ message: msg, duration: 2000, color: 'danger', position: 'bottom' });
        t.present();
      }
    });
  }

  criarTag(): void {
    if (this.formTag.invalid) return;
    const payload = {
      name: (this.formTag.value.name || '').trim(),
      description: (this.formTag.value.description || '').trim() || null,
      color_hex: this.formTag.value.color_hex || null,
    } as { name: string; description?: string | null; color_hex?: string | null };
    if (!payload.name) return;
    this.tagsService.create(payload).subscribe({
      next: async (tag) => {
        this.formTag.reset({ name: '', description: '', color_hex: '#1976D2' });
        this.tags.unshift(tag);
        const t = await this.toast.create({ message: 'Tag criada', duration: 1200, color: 'success', position: 'bottom' });
        t.present();
      },
      error: async (err) => {
        const msg = err?.error?.error || 'Falha ao criar tag';
        this.errorMsg = msg;
        const t = await this.toast.create({ message: msg, duration: 1800, color: 'danger', position: 'bottom' });
        t.present();
      }
    });
  }

  removerTag(tag: Tag): void {
    if (!tag?.id) return;
    if (!confirm(`Excluir tag "${tag.name}"?`)) return;
    this.tagsService.remove(tag.id).subscribe({
      next: async () => {
        this.tags = this.tags.filter(t => t.id !== tag.id);
        const t = await this.toast.create({ message: 'Tag removida', duration: 1000, color: 'success', position: 'bottom' });
        t.present();
      },
      error: async (err) => {
        const msg = err?.error?.error || 'Falha ao remover tag';
        this.errorMsg = msg;
        const t = await this.toast.create({ message: msg, duration: 1800, color: 'danger', position: 'bottom' });
        t.present();
      }
    });
  }
}
