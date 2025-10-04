import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CamposClientesService } from '../services/campos-clientes.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastController } from '@ionic/angular';

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

  status: { id: number; nome: string; qtd_clientes: number; ordem?: number }[] = [];
  campanhas: { id: number; nome: string; qtd_clientes: number }[] = [];
  loading = false;
  errorMsg = '';

  formStatus = this.fb.group({ nome: ['', [Validators.required, Validators.minLength(2)]] });
  formCampanha = this.fb.group({ nome: ['', [Validators.required, Validators.minLength(2)]] });

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
}
