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
            message: 'Job criado com sucesso.',
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
}

