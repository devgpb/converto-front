import { Component, inject } from '@angular/core';
import { JobsService } from '../services/jobs.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-clientes-importar',
  templateUrl: './clientes-importar.page.html',
  styleUrls: ['./clientes-importar.page.scss'],
  standalone: false,
})
export class ClientesImportarPage {
  private jobs = inject(JobsService);
  private alertController = inject(AlertController);

  file: File | null = null;
  dragOver = false;

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
    this.jobs.postImportClients(this.file).subscribe({
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
}

