import { Component, inject, OnInit } from '@angular/core';
import { JobsService } from '../services/jobs.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SeatsService } from '../services/seats.service';
import { Usuario } from '../services/usuarios.service';

@Component({
  selector: 'app-clientes-importar',
  templateUrl: './clientes-importar.page.html',
  styleUrls: ['./clientes-importar.page.scss'],
  standalone: false,
})
export class ClientesImportarPage implements OnInit {
  private jobs = inject(JobsService);
  private alertController = inject(AlertController);
  private auth = inject(AuthService);
  private seats = inject(SeatsService);

  file: File | null = null;
  dragOver = false;
  assignEnabled = true;
  isAdmin = false;
  currentUserId: string | null = null;
  selectedUserId: string | null = null;
  usuarios: Usuario[] = [];

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    this.currentUserId = this.auth.getUserId();
    this.selectedUserId = this.currentUserId;
    if (this.isAdmin) {
      const tenantId = this.auth.getTenantId();
      if (tenantId) {
        this.seats.getUsage(tenantId).subscribe({
          next: (usage: any) => {
            const all = (usage?.users || []).filter((u: any) => !!u);
            // Evita duplicar o próprio usuário na lista (já existe a opção "Meus Clientes")
            this.usuarios = all.filter((u: any) => this.getUserId(u) !== this.currentUserId);
          },
          error: () => {
            this.usuarios = [];
          },
        });
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const droppedFile = event.dataTransfer?.files[0];
    if (droppedFile) {
      this.file = droppedFile;
    }
  }

  onFileSelected(event: any) {
    const selected = event.target.files[0];
    this.file = selected ?? null;
  }

  removeFile() {
    this.file = null;
  }

  openFileDialog(input: HTMLInputElement) {
    input.click();
  }

  importar() {
    if (!this.file) return;
    const assignUserId = this.assignEnabled ? (this.isAdmin ? this.selectedUserId : this.currentUserId) : null;
    this.jobs.postImportClients(this.file, assignUserId || undefined).subscribe({
      next: () => {
        this.alertController
          .create({
            header: 'Importação iniciada',
            message: 'Seu Trabalho de importação foi iniciado, por favor, acompanhe em "Meus Trabalhos".',
            buttons: ['OK'],
          })
          .then((a) => a.present());
        this.file = null;
      },
      error: () => {
        this.alertController
          .create({
            header: 'Erro',
            message: 'Não foi possível criar o job.',
            buttons: ['OK'],
          })
          .then((a) => a.present());
      },
    });
  }

  getUserId(u: any): string | null {
    return (u?.id_usuario || u?.user_id || u?.id || null) ? String(u.id_usuario || u.user_id || u.id) : null;
  }

  async exportar() {
    const alert = await this.alertController.create({
      header: 'Exportar clientes',
      message: 'A exportação cria um trabalho em segundo plano que gera um arquivo CSV com seus clientes. O link ficará disponível em "Meus Trabalhos" quando concluir. Deseja iniciar a exportação agora?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Exportar',
          role: 'confirm',
          handler: () => {
            this.jobs.postExportClients({ /* exportScope padrão: user */ }).subscribe({
              next: () => {
                this.alertController
                  .create({
                    header: 'Exportação iniciada',
                    message: 'Seu trabalho de exportação foi iniciado. Acompanhe em "Meus Trabalhos".',
                    buttons: ['OK'],
                  })
                  .then((a) => a.present());
              },
              error: () => {
                this.alertController
                  .create({
                    header: 'Erro',
                    message: 'Não foi possível criar o job de exportação.',
                    buttons: ['OK'],
                  })
                  .then((a) => a.present());
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  baixarExemploCSV() {
    const headers = [
      'nome',
      'celular',
      'status',
      'cidade',
      'indicacao',
      'campanha',
      'observacao'
    ];

    const exemplo = [
      'Fulano de Tal',
      '11988887777',
      'Novo',
      'Sao Paulo',
      'Instagram',
      'Promocao Inverno',
      'Cliente ficticio para exemplo'
    ];

    const quote = (v: any) => '"' + String(v).replace(/"/g, '""') + '"';
    const sep = ';';

    const csvBody = [headers.join(sep), exemplo.map(quote).join(sep)].join('\n');
    const csvWithBom = '\ufeff' + csvBody; // BOM para Excel/Windows

    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_importacao_clientes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }


}

